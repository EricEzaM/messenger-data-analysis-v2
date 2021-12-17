import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";

export function MessageLengths({ lengthLimit = 12 }: { lengthLimit: number }) {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let msgLengthData = conversationData.messages.reduce<{
			[key: string]: number[];
		}>((accum, msg) => {
			if (msg.wordCount) {
				if (msg.sender in accum) {
					accum[msg.sender][msg.wordCount] =
						(accum[msg.sender][msg.wordCount] ?? 0) + 1;
				} else {
					accum[msg.sender] = [];
					accum[msg.sender][msg.wordCount] = 1;
				}
			}

			return accum;
		}, {});

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
				columns: msgLengthColumns,
			},
			axis: {
				x: {
					min: 1,
					max: lengthLimit,
					padding: {
						left: 0,
					},
					tick: {
						format: (x) => {
							if (x === 0) {
								return "";
							} else {
								return x.toString();
							}
						},
						culling: false,
					},
				},
				y: {
					padding: {
						bottom: 0,
					},
				},
			},
		});
	}, [conversationData, chartId, lengthLimit]);

	return <div id={chartId.current}></div>;
}
