import c3 from "c3";
import { getDay, getMonth } from "date-fns";
import { useEffect, useRef } from "react";
import { useConversation } from "../hooks/use-conversation";
import { generateChartId } from "./chart-utils";

type Category = "DaysOfWeek" | "MonthsOfYear";

export function MessagesCategorical({ category }: { category: Category }) {
	const chartId = useRef(generateChartId());
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

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

		const participantCounts: { [participant: string]: Array<number> } = {};

		// Add an entry for each participant and fill with zeros.
		conversationData.participants.forEach(
			(p) =>
				(participantCounts[p] = Array(category === "DaysOfWeek" ? 7 : 12).fill(
					0
				))
		);
		conversationData.messages.forEach((msg) => {
			participantCounts[msg.sender][
				category === "DaysOfWeek"
					? getDay(msg.time.date)
					: getMonth(msg.time.date)
			] += 1;
		});

		// Create columsn in the required format.
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
