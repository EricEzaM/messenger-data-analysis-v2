import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";

export function WordFrequency({
	lengthMin = 1,
	lengthMax = 10,
}: {
	lengthMin: number;
	lengthMax: number;
}) {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		const wordCounts = conversationData.messages.reduce<{
			[word: string]: { [participant: string]: number; total: number };
		}>((accum, msg) => {
			msg.words.forEach((word) => {
				if (word.length >= lengthMin && word.length <= lengthMax) {
					accum[word] = accum[word] ?? { total: 0 }; // Create new entry if word does not exist
					accum[word][msg.sender] = accum[word][msg.sender] ?? 0; // Create new entry if word does not exist for sender
					accum[word][msg.sender] = (accum[word][msg.sender] ?? 0) + 1; // Increment usage of word for sender
					accum[word].total += 1;
				}
			});

			return accum;
		}, {});

		let topWords = Object.keys(wordCounts)
			.sort((a, b) => wordCounts[b].total - wordCounts[a].total)
			.slice(0, 20);

		const wordCountColumns = conversationData.participants.map<
			[string, ...number[]]
		>((p) => [p, ...topWords.map((w) => wordCounts[w][p] ?? 0)]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "bar",
				columns: wordCountColumns,
			},
			axis: {
				x: {
					type: "category",
					categories: topWords,
				},
			},
		});
	}, [conversationData, chartId, lengthMin, lengthMax]);

	return <div id={chartId.current}></div>;
}
