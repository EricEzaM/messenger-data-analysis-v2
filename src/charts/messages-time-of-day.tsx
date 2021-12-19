import c3 from "c3";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";
import { ColumnChartProps, getStackConfiguration } from "./chart-common";

type GroupByTimeOfDay = "Hours" | "Minutes";

const MINUTES_INTERVAL = 15;
const MINUTES_INTERVAL_DIVISOR = 60 / MINUTES_INTERVAL;

const hours = Array(24)
	.fill(0)
	.map((v, i) => i); // 0 to 23, hours in the day.

const minutes = Array(24 * MINUTES_INTERVAL_DIVISOR)
	.fill(0)
	.map((v, i) => {
		const hour = Math.floor(i / MINUTES_INTERVAL_DIVISOR);
		const min = (i % MINUTES_INTERVAL_DIVISOR) * MINUTES_INTERVAL;
		return (
			hour.toString().padStart(2, "0") + ":" + min.toString().padStart(2, "0")
		);
	}); // 00:00 to 23:45, hours in the day in X minute blocks, as defined by minutes interval.

type Props = {
	groupBy: GroupByTimeOfDay;
} & ColumnChartProps;

export function MessagesTimeOfDay({ groupBy, columnDisplayType }: Props) {
	const chartId = useChartId();
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		// Create counts dictionary style object and fill with zeroes to initilise the counts.
		const arrLen = groupBy === "Hours" ? 24 : 24 * MINUTES_INTERVAL_DIVISOR;
		const participantCounts = conversationData.participants.reduce(
			(accum: { [participant: string]: number[] }, p) => {
				accum[p] = Array(arrLen).fill(0);
				return accum;
			},
			{}
		);

		// Add message counts to each category for each participant
		conversationData.messages.forEach((msg) => {
			const idx =
				groupBy === "Hours"
					? msg.time.hour
					: msg.time.hour * MINUTES_INTERVAL_DIVISOR +
					  Math.floor(msg.time.minute / MINUTES_INTERVAL);
			participantCounts[msg.sender][idx] += 1;
		});

		const columns: [string, ...number[]][] = Object.keys(participantCounts).map(
			(k) => [k, ...participantCounts[k]]
		);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "bar",
				columns: columns,
				...getStackConfiguration(columns, columnDisplayType),
			},
			axis: {
				x: {
					type: "category",
					categories:
						groupBy === "Hours"
							? hours.map((h) => h.toString().padStart(2, "0") + ":00")
							: minutes,
				},
			},
		});
	}, [conversationData, groupBy, chartId, columnDisplayType]);

	return <div id={chartId.current}></div>;
}
