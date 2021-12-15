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
	date: Date;
	day: number;
	date_of_month: number;
	month: number;
	year: number;
	hour: number;
	minute: number;
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
	messages: MessageData[];
	participantMessageCount: Map<string, number>;
}
