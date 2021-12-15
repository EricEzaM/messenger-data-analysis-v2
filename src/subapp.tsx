import { useRef } from "react";
import { MessagesCategorical } from "./charts/messages-categorical";
import { MessagesTimeline } from "./charts/messages-timeline";
import { ParticipantMessageDistribution } from "./charts/participant-message-distribution";
import { ParticipantWordsDistribution } from "./charts/participant-words-distribution";
import { useConversation } from "./hooks/use-conversation";

export function SubApp() {
	const input = useRef<HTMLInputElement>(null);
	const { conversation, analyseConversationFromFiles } = useConversation();

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
			<MessagesCategorical category="MonthsOfYear" />
			<MessagesTimeline groupBy="Month" />
			<ParticipantMessageDistribution />
			<ParticipantWordsDistribution />
		</div>
	);
}
