import React, { createContext, ReactNode, useContext, useState } from "react";
import { Conversation } from "../models/conversation";
import { ConversationData } from "../models/conversation-stats";
import { ConversationAnalyser } from "../processing/conversation-analyser";
import { ConversationLoader } from "../processing/conversation-loader";

interface ConversationContextProps {
	conversation: Conversation | null;
	conversationData: ConversationData | null;
	analyseConversationFromFiles: (files: File[]) => void;
}

export const ConversationContext = createContext<ConversationContextProps>({
	conversation: null,
	conversationData: null,
	analyseConversationFromFiles: () => {},
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
	const [conversationData, setConversationData] =
		useState<ConversationData | null>(null);

	function analyseConversationFromFiles(files: File[]) {
		let analyser = new ConversationAnalyser();
		let loader = new ConversationLoader(files);
		loader.onLoad = (conversation: Conversation) => {
			setConversation(conversation);

			let data = analyser.analyse(conversation);
			setConversationData(data);
		};
		loader.load();
	}

	return {
		conversation,
		conversationData,
		analyseConversationFromFiles,
	};
}

export function useConversation() {
	return useContext(ConversationContext);
}
