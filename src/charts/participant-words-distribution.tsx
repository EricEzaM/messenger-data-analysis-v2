import c3 from "c3";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { getChartId } from "./chart-utils";

export function ParticipantWordsDistribution() {
	const chartId = useRef(getChartId());
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let participantWords = conversationData.messages.reduce<{
			[key: string]: number;
		}>((accum, { sender, wordCount }) => {
			if (wordCount) {
				accum[sender] = (accum[sender] ?? 0) + wordCount;
			}
			return accum;
		}, {});

		let participantWordColumns: [string, number][] = Object.keys(
			participantWords
		).map((key) => [key, participantWords[key]]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "donut",
				columns: participantWordColumns,
			},
			donut: {
				title: "Word Distribution",
			},
		});
	}, [conversationData]);

	return <div id={chartId.current}></div>;
}
