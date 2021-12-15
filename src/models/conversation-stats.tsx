export type MessageType =
	| "Unknown"
	| "Sticker"
	| "Videos"
	| "Photos"
	| "Files"
	| "GIFs"
	| "Shared Link"
	| "Audio"
	| "Plan"
	| "Text";

export interface TimeData {
	day: number;
	date: number;
	month: number;
	year: number;
	hour: number;
	minute: number;
	date_dateonly: Date;
	date_monthonly: Date;
}

export interface MessageData {
	sender: string;
	time: TimeData;
	type: MessageType;
	words: string[];
	emojis: string[];
	wordCount: number | null;
}

export interface ConversationData {
	title: string;
	participants: string[];
	messageCount: number;
	participantMessageCount: Map<string, number>;
	messagesData: MessageData[];
}
