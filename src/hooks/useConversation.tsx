import React, { createContext, ReactNode, useContext, useState } from "react";
import { Conversation } from "../models/conversation";

class ConversationLoader {
	files: File[] = [];
	conversationParts: Conversation[] = [];

	onLoad: (conversation: Conversation) => void = () => {};

	constructor(files: File[]) {
		this.files = files;
	}

	load() {
		this.readFile(0);
	}

	private readAllComplete() {
		// Merge all the conversation parts which came from each file.
		let conv = this.conversationParts.reduce((accume, convPart) => {
			accume.extend(convPart);
			return accume;
		}, new Conversation());

		this.onLoad(conv);
	}

	private readFile(index: number) {
		if (index > this.files.length - 1) {
			this.readAllComplete();
			return;
		}

		let fr = new FileReader();
		fr.onload = (ev: ProgressEvent<FileReader>) => {
			let res = ev.target?.result;

			if (res && typeof res === "string") {
				let fileConv = JSON.parse(res);

				// Only keep properties from the JSON that appear on the Conversation class.
				let conversationPart = Object.assign(
					new Conversation(),
					Object.keys(fileConv)
						.filter((key) => Object.keys(new Conversation()).includes(key))
						.reduce(
							(accum, key) => Object.assign(accum, { [key]: fileConv[key] }),
							{}
						)
				);

				this.conversationParts.push(conversationPart);
				this.readFile(index + 1);
			}
		};

		fr.readAsText(this.files[index]);
	}
}

interface ConversationContextProps {
	conversation: Conversation | null;
	loadConversationFromFiles: (files: File[]) => void;
}

export const ConversationContext = createContext<ConversationContextProps>({
	conversation: null,
	loadConversationFromFiles: () => {},
});

export function ConversationProvider({ children }: { children: ReactNode }) {
	const conversationContext = useConversationProvider();

	return (
		<ConversationContext.Provider value={conversationContext}>
			{children}
		</ConversationContext.Provider>
	);
}

function useConversationProvider(): ConversationContextProps {
	const [conversation, setConversation] = useState<Conversation | null>(null);

	function loadConversationFromFiles(files: File[]) {
		let loader = new ConversationLoader(files);
		loader.onLoad = (conversation: Conversation) => {
			setConversation(conversation);
		};
		loader.load();
	}

	return {
		conversation,
		loadConversationFromFiles,
	};
}

export function useConversation() {
	return useContext(ConversationContext);
}
