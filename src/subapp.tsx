import { useRef, useState } from "react";
import { ColumnDisplayType } from "./charts/chart-common";
import { EmojiFrequency } from "./charts/emoji-frequency";
import { MessagesCategorical } from "./charts/messages-date-categorical";
import { MessageLengths } from "./charts/messages-lengths";
import { MessagesTimeOfDay } from "./charts/messages-time-of-day";
import { MessagesTimeline } from "./charts/messages-timeline";
import { ParticipantMessageDistribution } from "./charts/participant-message-distribution";
import { ParticipantWordsDistribution } from "./charts/participant-words-distribution";
import { WordFrequency } from "./charts/word-frequency";
import { useConversation } from "./hooks/use-conversation";

export function SubApp() {
	const input = useRef<HTMLInputElement>(null);
	const { conversation, analyseConversationFromFiles } = useConversation();

	const [lengthLimit, setLengthLimit] = useState(12);
	const [wordLenMin, setWordLenMin] = useState(1);
	const [wordLenMax, setWordLenMax] = useState(10);
	const [columnType, setColumnType] = useState(ColumnDisplayType.Normal);

	function onFilesSelected() {
		if (input.current && input.current.files) {
			let fileArr = Array.from(input.current.files);
			analyseConversationFromFiles(fileArr);
		}
	}

	return (
		<div>
			<input
				ref={input}
				onChange={(e) => onFilesSelected()}
				type="file"
				name="files"
				multiple
				accept=".json"
			/>
			{conversation && (
				<ul>
					<li>{conversation.title}</li>
					<li>{JSON.stringify(conversation.participants, undefined, 2)}</li>
					<li>{conversation.messages.length}</li>
				</ul>
			)}

			<div>
				Msg Length Limit
				<input
					type="number"
					value={lengthLimit}
					onChange={(e) => setLengthLimit(parseInt(e.target.value))}
				/>
				Word Len Min
				<input
					type="number"
					value={wordLenMin}
					onChange={(e) => setWordLenMin(parseInt(e.target.value))}
				/>
				Word Len Max
				<input
					type="number"
					value={wordLenMax}
					onChange={(e) => setWordLenMax(parseInt(e.target.value))}
				/>
			</div>

			<select
				onChange={(e) => {
					console.log(e.target.value);
					setColumnType(
						ColumnDisplayType[e.target.value as keyof typeof ColumnDisplayType]
					);
				}}
			>
				{Object.values(ColumnDisplayType).map((v) => (
					<option key={v} value={v}>
						{v}
					</option>
				))}
			</select>

			<EmojiFrequency columnDisplayType={columnType} />
			<WordFrequency
				lengthMin={wordLenMin}
				lengthMax={wordLenMax}
				columnDisplayType={columnType}
			/>
			<MessageLengths
				lengthLimit={lengthLimit}
				columnDisplayType={columnType}
			/>
			<MessagesTimeOfDay groupBy="Hours" columnDisplayType={columnType} />
			<MessagesTimeOfDay groupBy="Minutes" columnDisplayType={columnType} />
			<MessagesCategorical
				category="MonthsOfYear"
				columnDisplayType={columnType}
			/>
			<MessagesTimeline groupBy="Month" />
			<ParticipantMessageDistribution />
			<ParticipantWordsDistribution />
		</div>
	);
}
