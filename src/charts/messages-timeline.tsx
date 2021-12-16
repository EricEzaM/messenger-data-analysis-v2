import c3 from "c3";
import {
	addDays,
	addMonths,
	addWeeks,
	isAfter,
	isEqual,
	isSameDay,
	isSameMonth,
	isSameWeek,
	isSameYear,
	startOfMonth,
	startOfWeek,
	startOfYear,
} from "date-fns";
import addYears from "date-fns/esm/addYears/index";
import { useEffect } from "react";
import { useChartId } from "../hooks/use-chart-id";
import { useConversation } from "../hooks/use-conversation";
import { ConversationData } from "../models/conversation-stats";

export type TimelineGroupBy = "Date" | "Week" | "Month" | "Year";

interface DateMessageCount {
	date: Date;
	participants: {
		[key: string]: number;
	};
}

export function MessagesTimeline({ groupBy }: { groupBy: TimelineGroupBy }) {
	const { conversationData } = useConversation();
	const chartId = useChartId();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		const dateMessageCounts = calculateDateMessageCounts(
			conversationData,
			groupBy
		);

		let participantData = conversationData.participants.map((p) => ({
			name: p,
			counts: dateMessageCounts.map((mtc) => mtc.participants[p] ?? 0),
		}));

		c3.generate({
			bindto: `#${chartId.current}`,
			data: {
				x: "x",
				columns: [
					["x", ...dateMessageCounts.map((t) => t.date)],
					...participantData.map<[string, ...number[]]>((v) => [
						v.name,
						...v.counts,
					]),
					[
						"Total",
						...dateMessageCounts.map((count) =>
							Object.values(count.participants).reduce((acc, v) => acc + v, 0)
						),
					],
				],
			},
			axis: {
				x: {
					type: "timeseries",
					tick: {
						format: "%Y-%m-%d",
					},
				},
				y: {
					min: 0,
					padding: {
						bottom: 0,
					},
				},
			},
			zoom: {
				enabled: true,
			},
			grid: {
				y: {
					show: true,
				},
			},
		});
	}, [conversationData, groupBy, chartId]);

	return <div id={chartId.current}></div>;
}

function calculateDateMessageCounts(
	data: ConversationData,
	groupBy: TimelineGroupBy = "Date"
): DateMessageCount[] {
	// Transform the conversation data into an array of data about the date of each message.
	let dateMessageCounts: DateMessageCount[] = data.messages.reduce(
		(accum: DateMessageCount[], currMsg) => {
			const messageDate = currMsg.time.date;

			// Find if the data for the period in question already exists.
			let existingData = accum.find((data) => {
				switch (groupBy) {
					case "Date":
						return isSameDay(data.date, messageDate);
					case "Week":
						return isSameWeek(data.date, messageDate);
					case "Month":
						return isSameMonth(data.date, messageDate);
					case "Year":
						return isSameYear(data.date, messageDate);
					default:
						return data.date;
				}
			});

			if (existingData) {
				// Update the sent count for the participant, or add them if they arent in the object.
				if (existingData.participants[currMsg.sender]) {
					existingData.participants[currMsg.sender] += 1;
				} else {
					existingData.participants[currMsg.sender] = 1;
				}
			} else {
				// Create new date data
				accum.push({
					date:
						groupBy === "Date"
							? messageDate
							: groupBy === "Week"
							? startOfWeek(messageDate)
							: groupBy === "Month"
							? startOfMonth(messageDate)
							: groupBy === "Year"
							? startOfYear(messageDate)
							: messageDate,
					participants: {},
				});
			}
			return accum;
		},
		[]
	);

	// Construct data for date periods which did not have any data.
	// This fills in gaps in the data, for example if there were no messages for some days/month/etc.
	let firstDate = new Date(
		Math.min(...dateMessageCounts.map((data) => data.date.getTime()))
	);

	let lastDate = new Date(
		Math.max(...dateMessageCounts.map((data) => data.date.getTime()))
	);

	let valueToAdd = 1;
	while (true) {
		let testDate = firstDate;
		switch (groupBy) {
			case "Date":
				testDate = addDays(testDate, valueToAdd);
				break;
			case "Week":
				testDate = addWeeks(testDate, valueToAdd);
				break;
			case "Month":
				testDate = addMonths(testDate, valueToAdd);
				break;
			case "Year":
				testDate = addYears(testDate, valueToAdd);
				break;
		}
		valueToAdd++;

		if (isAfter(testDate, lastDate)) {
			break;
		}

		const hasDataForDate = dateMessageCounts.some((data) =>
			isEqual(data.date, testDate)
		);

		if (!hasDataForDate) {
			dateMessageCounts.push({
				date: testDate,
				participants: data.participants.reduce(
					(accum: { [key: string]: number }, p) => {
						accum[p] = 0;
						return accum;
					},
					{}
				),
			});
		}
	}

	return dateMessageCounts;
}
