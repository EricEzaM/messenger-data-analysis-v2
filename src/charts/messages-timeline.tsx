import c3 from "c3";
import { useEffect } from "react";
import {
	TimelineGroupBy,
	useChartMessagesOverTime,
} from "../hooks/use-chart-messages-over-time";
import { useConversation } from "../hooks/use-conversation";

export function MessagesTimeline({ groupBy }: { groupBy: TimelineGroupBy }) {
	const { conversationData } = useConversation();
	const { dateMessageCounts } = useChartMessagesOverTime(groupBy);

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let participantData = conversationData.participants.map((p) => ({
			name: p,
			counts: dateMessageCounts.map((mtc) => mtc.participants[p] ?? 0),
		}));

		c3.generate({
			bindto: "#chart",
			data: {
				x: "x",
				columns: [
					["x", ...dateMessageCounts.map((t) => t.date)],
					[
						"Total",
						...dateMessageCounts.map((count) =>
							Object.values(count.participants).reduce((acc, v) => acc + v, 0)
						),
					],
					...participantData.map<[string, ...number[]]>((v) => [
						v.name,
						...v.counts,
					]),
				],
			},
			axis: {
				x: {
					type: "timeseries",
					tick: {
						format: "%Y-%m-%d",
					},
				},
				y: {
					min: 0,
					padding: {
						bottom: 0,
					},
				},
			},
			zoom: {
				enabled: true,
			},
		});

		// let donutColumns: [string, number][] = [];
		// conversationData.participantMessageCount.forEach((v, k) => {
		// 	donutColumns.push([k, v]);
		// });

		// c3.generate({
		// 	bindto: "#chart2",
		// 	data: {
		// 		type: "donut",
		// 		columns: donutColumns,
		// 	},
		// 	donut: {
		// 		title: "Message Distribution",
		// 	},
		// });
	}, [dateMessageCounts, conversationData]);

	return <div id="chart"></div>;
}
