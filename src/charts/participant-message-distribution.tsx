import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";

export function ParticipantMessageDistribution() {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let participantMessageColumns: [string, number][] = Object.keys(
			conversationData.participantMessageCount
		).map((key) => [key, conversationData.participantMessageCount[key]]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "donut",
				columns: participantMessageColumns,
			},
			donut: {
				title: "Message Distribution",
			},
			tooltip: {
				format: {
					value: (value, ratio, id, index) => `${value}`,
				},
			},
		});
	}, [conversationData, chartId]);

	return <div id={chartId.current}></div>;
}
