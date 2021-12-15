import { useRef } from "react";
import { MessagesTimeline } from "./charts/messages-timeline";
import { ParticipantContribution } from "./charts/participant-contribution";
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
			<MessagesTimeline groupBy="Month" />
			<ParticipantContribution />
		</div>
	);
}
