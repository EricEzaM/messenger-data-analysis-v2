import c3 from "c3";
import { getDay, getMonth } from "date-fns";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { generateChartId } from "./chart-utils";

type Category = "DaysOfWeek" | "MonthsOfYear";

const daysOfWeek = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

const monthsOfYear = [
	"January",
	"February",
	"March",
	"April",
	"May",
	"June",
	"July",
	"August",
	"September",
	"October",
	"November",
	"December",
];

export function MessagesCategorical({ category }: { category: Category }) {
	const chartId = useRef(generateChartId());
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		// Create counts dictionary style object and fill with zeroes to initilise the counts.
		const arrLen = category === "DaysOfWeek" ? 7 : 12;
		const participantCounts = conversationData.participants.reduce(
			(accum: { [participant: string]: number[] }, p) => {
				accum[p] = Array(arrLen).fill(0);
				return accum;
			},
			{}
		);

		// Add message counts to each category for each participant
		conversationData.messages.forEach((msg) => {
			participantCounts[msg.sender][
				category === "DaysOfWeek"
					? getDay(msg.time.date)
					: getMonth(msg.time.date)
			] += 1;
		});

		// Create columns in the required format.
		const daysOfWeekColumns: [string, ...number[]][] = Object.keys(
			participantCounts
		).map((k) => [k, ...participantCounts[k]]);

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				type: "bar",
				columns: daysOfWeekColumns,
			},
			axis: {
				x: {
					type: "category",
					categories: category === "DaysOfWeek" ? daysOfWeek : monthsOfYear,
				},
			},
		});
	}, [conversationData, category]);

	return <div id={chartId.current}></div>;
}
