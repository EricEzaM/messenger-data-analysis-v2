import {
	addMonths,
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
import { addDays, addWeeks, addYears } from "date-fns/esm";
import { useEffect, useState } from "react";
import { ConversationData } from "../models/conversation-stats";
import { useConversation } from "./use-conversation";

export type TimelineGroupBy = "Date" | "Week" | "Month" | "Year";

interface DateMessageCount {
	date: Date;
	participants: {
		[key: string]: number;
	};
}

export function useChartMessagesOverTime(groupBy: TimelineGroupBy = "Date") {
	const { conversationData } = useConversation();

	const [dateMessageCounts, setDateMessageCounts] = useState<
		DateMessageCount[]
	>([]);

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		const data = calculateDateMessageCounts(conversationData, groupBy);
		setDateMessageCounts(data);
	}, [conversationData, groupBy]);

	return { dateMessageCounts };
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
