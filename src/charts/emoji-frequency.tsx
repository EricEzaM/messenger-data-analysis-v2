import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";
import { ColumnChartProps, getStackConfiguration } from "./chart-common";

type Props = {} & ColumnChartProps;

export function EmojiFrequency({ columnDisplayType }: Props) {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		const emojiCounts = conversationData.messages.reduce<{
			[emoji: string]: { [participant: string]: number; total: number };
		}>((accum, msg) => {
			msg.emojis.forEach((emoji) => {
				accum[emoji] = accum[emoji] ?? { total: 0 }; // Create new entry if word does not exist
				accum[emoji][msg.sender] = accum[emoji][msg.sender] ?? 0; // Create new entry if word does not exist for sender
				accum[emoji][msg.sender] = (accum[emoji][msg.sender] ?? 0) + 1; // Increment usage of word for sender
				accum[emoji].total += 1;
			});

			return accum;
		}, {});

		let topEmojis = Object.keys(emojiCounts)
			.sort((a, b) => emojiCounts[b].total - emojiCounts[a].total)
			.slice(0, 20);

		const emojiCountColumns = conversationData.participants.map<
			[string, ...number[]]
		>((p) => [p, ...topEmojis.map((w) => emojiCounts[w][p] ?? 0)]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "bar",
				columns: emojiCountColumns,
				...getStackConfiguration(emojiCountColumns, columnDisplayType),
			},
			axis: {
				x: {
					type: "category",
					categories: topEmojis,
				},
			},
		});
	}, [conversationData, chartId, columnDisplayType]);

	return <div className="chart-xticks-large" id={chartId.current}></div>;
}
