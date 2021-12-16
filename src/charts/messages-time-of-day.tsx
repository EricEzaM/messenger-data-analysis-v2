import c3 from "c3";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { generateChartId } from "./chart-utils";

type GroupByTimeOfDay = "Hours" | "Minutes";

const hours = Array(24)
	.fill(0)
	.map((v, i) => i); // 0 to 23, hours in the day.

const MINUTES_INTERVAL = 15;
const MINUTES_INTERVAL_DIVISOR = 60 / MINUTES_INTERVAL;

const minutes = Array(24 * MINUTES_INTERVAL_DIVISOR)
	.fill(0)
	.map((v, i) => {
		const hour = Math.floor(i / MINUTES_INTERVAL_DIVISOR);
		const min = (i % MINUTES_INTERVAL_DIVISOR) * MINUTES_INTERVAL;
		return (
			hour.toString().padStart(2, "0") + ":" + min.toString().padStart(2, "0")
		);
	});

export function MessagesTimeOfDay({ groupBy }: { groupBy: GroupByTimeOfDay }) {
	const chartId = useRef(generateChartId());
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
				// groups: [[...columns.map((v) => v[0])]],
				// stack: {
				// 	normalize: true,
				// },
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
			// grid: {
			// 	y: {
			// 		lines: [{ value: 50, text: "" }],
			// 	},
			// },
		});
	}, [conversationData, groupBy]);

	return <div id={chartId.current}></div>;
}
