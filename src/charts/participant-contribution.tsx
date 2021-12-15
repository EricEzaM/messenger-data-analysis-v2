import c3 from "c3";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { getChartId } from "./chart-utils";

export function ParticipantContribution() {
	const chartId = useRef(getChartId());
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let donutColumns: [string, number][] = [];
		conversationData.participantMessageCount.forEach((v, k) => {
			donutColumns.push([k, v]);
		});

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "donut",
				columns: donutColumns,
			},
			donut: {
				title: "Message Distribution",
			},
		});
	}, [conversationData]);

	return <div id={chartId.current}></div>;
}
