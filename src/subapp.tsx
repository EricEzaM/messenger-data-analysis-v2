import { useRef, useState } from "react";
import { MessagesCategorical } from "./charts/messages-date-categorical";
import { MessageLengths } from "./charts/messages-lengths";
import { MessagesTimeOfDay } from "./charts/messages-time-of-day";
import { MessagesTimeline } from "./charts/messages-timeline";
import { ParticipantMessageDistribution } from "./charts/participant-message-distribution";
import { ParticipantWordsDistribution } from "./charts/participant-words-distribution";
import { useConversation } from "./hooks/use-conversation";

export function SubApp() {
	const input = useRef<HTMLInputElement>(null);
	const { conversation, analyseConversationFromFiles } = useConversation();

	const [lengthLimit, setLengthLimit] = useState(12);

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

			<input
				type="number"
				value={lengthLimit}
				onChange={(e) => setLengthLimit(parseInt(e.target.value))}
			/>

			<MessageLengths lengthLimit={lengthLimit} />
			<MessagesTimeOfDay groupBy="Hours" />
			<MessagesTimeOfDay groupBy="Minutes" />
			<MessagesCategorical category="MonthsOfYear" />
			<MessagesTimeline groupBy="Month" />
			<ParticipantMessageDistribution />
			<ParticipantWordsDistribution />
		</div>
	);
}
