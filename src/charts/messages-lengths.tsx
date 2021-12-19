import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";
import { ColumnChartProps, getStackConfiguration } from "./chart-common";

type Props = {
	lengthLimit: number;
} & ColumnChartProps;

type MessageLengthData = { [participant: string]: number[] };

export function MessageLengths({ lengthLimit = 12, columnDisplayType }: Props) {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		// Ensures consistency of series order.
		let defaultDict: MessageLengthData = {};
		conversationData.participants.forEach((p) => (defaultDict[p] = []));

		let msgLengthData = conversationData.messages.reduce<MessageLengthData>(
			(accum, msg) => {
				if (msg.wordCount && msg.wordCount <= lengthLimit) {
					if (msg.sender in accum) {
						accum[msg.sender][msg.wordCount] =
							(accum[msg.sender][msg.wordCount] ?? 0) + 1;
					} else {
						accum[msg.sender] = [];
						accum[msg.sender][msg.wordCount] = 1;
					}
				}

				return accum;
			},
			defaultDict
		);

		// Remove the "empty" or "undefined" values from the array,
		// as before we only filled indicies which had values.
		Object.keys(msgLengthData).forEach((key) => {
			msgLengthData[key] = Array.from(
				msgLengthData[key],
				(value) => value || 0
			);
		});

		const msgLengthColumns: [string, ...number[]][] = Object.keys(
			msgLengthData
		).map((key) => [key, ...msgLengthData[key]]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "bar",
				columns: msgLengthColumns,
				...getStackConfiguration(msgLengthColumns, columnDisplayType),
			},
			axis: {
				x: {
					padding: {
						left: 0,
					},
					tick: {
						culling: false,
					},
				},
			},
		});
	}, [conversationData, chartId, lengthLimit, columnDisplayType]);

	return <div id={chartId.current}></div>;
}
