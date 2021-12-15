import c3 from "c3";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { getChartId } from "./chart-utils";

export function ParticipantMessageDistribution() {
	const chartId = useRef(getChartId());
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
		});
	}, [conversationData]);

	return <div id={chartId.current}></div>;
}
