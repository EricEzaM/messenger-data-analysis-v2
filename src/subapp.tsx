import { useRef } from "react";
import { useConversation } from "./hooks/useConversation";

export function SubApp() {
	const input = useRef<HTMLInputElement>(null);
	const { conversation, loadConversationFromFiles } = useConversation();

	function onFilesSelected() {
		if (input.current && input.current.files) {
			let fileArr = Array.from(input.current.files);
			loadConversationFromFiles(fileArr);
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
		</div>
	);
}
