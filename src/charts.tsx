import c3 from "c3";
import { useEffect } from "react";
import "c3/c3.css";
import { useConversation } from "./hooks/use-conversation";
import { isAfter, isEqual, isSameMonth } from "date-fns";
import { addMonths } from "date-fns/esm";
import set from "date-fns/set";

interface MessageDateData {
	date: Date;
	total: number;
	senders: { name: string; count: number }[];
}

export function Charts() {
	const { conversationData } = useConversation();

	useEffect(() => {
		if (!conversationData) {
			return;
		}

		let accumulatedDateData: MessageDateData[] =
			conversationData.messagesData.reduce((accum: MessageDateData[], curr) => {
				let dateData = accum.find((data) =>
					isSameMonth(data.date, curr.time.date_monthonly)
				);

				if (dateData) {
					// Update the total
					dateData.total += 1;

					// Update the sent count for the sender
					let senderData = dateData.senders.find((s) => s.name === curr.sender);
					if (senderData) {
						senderData.count += 1;
					} else {
						dateData.senders.push({
							name: curr.sender,
							count: 1,
						});
					}
				} else {
					// Create new date data
					accum.push({
						date: curr.time.date_monthonly,
						total: 1,
						senders: conversationData.participants.map((p) => ({
							name: p,
							count: curr.sender === p ? 1 : 0,
						})),
					});
				}
				return accum;
			}, []);

		let firstDate = new Date(
			Math.min(...accumulatedDateData.map((data) => data.date.getTime()))
		);

		let lastDate = set(new Date(), {
			date: 1,
			hours: 0,
			minutes: 0,
			seconds: 0,
			milliseconds: 0,
		});

		let valueToAdd = 1;
		while (true) {
			let testDate = addMonths(firstDate, valueToAdd);
			valueToAdd++;

			if (isAfter(testDate, lastDate)) {
				break;
			}

			const hasDataForDate = accumulatedDateData.some((data) =>
				isEqual(data.date, testDate)
			);

			if (!hasDataForDate) {
				accumulatedDateData.push({
					date: testDate,
					total: 0,
					senders: conversationData.participants.map((p) => ({
						name: p,
						count: 0,
					})),
				});
			}
		}

		let senderDataArray = conversationData.participants.map((p) => ({
			name: p,
			counts: accumulatedDateData.map(
				(mtc) => mtc.senders.find((s) => s.name === p)?.count ?? 0
			),
		}));

		c3.generate({
			bindto: "#chart",
			data: {
				x: "x",
				columns: [
					["x", ...accumulatedDateData.map((t) => t.date)],
					["Total", ...accumulatedDateData.map((t) => t.total)],
					...senderDataArray.map<[string, ...number[]]>((v) => [
						v.name,
						...v.counts,
					]),
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
		});

		let donutColumns: [string, number][] = [];
		conversationData.participantMessageCount.forEach((v, k) => {
			donutColumns.push([k, v]);
		});

		c3.generate({
			bindto: "#chart2",
			data: {
				type: "donut",
				columns: donutColumns,
			},
			donut: {
				title: "Message Distribution",
			},
		});
	}, [conversationData]);

	return (
		<>
			<div id="chart"></div>
			<div id="chart2"></div>
		</>
	);
}
