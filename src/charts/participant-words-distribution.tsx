import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";
import { compareFnColumns } from "./chart-common";

export function ParticipantWordsDistribution() {
	const chartId = useChartId();
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
				columns: participantWordColumns.sort(compareFnColumns),
			},
			donut: {
				title: "Word Distribution",
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
