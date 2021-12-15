export interface Message {
	content: string;
	sender_name: string;
	type: string;
	timestamp_ms: number;
	[key: string]: any; // Can have many different keys, depending on the type of message, e.g. stickers, shared links, etc.
}

export class Conversation {
	title: string = "";
	messages: Message[] = [];
	participants: string[] = [];
	thread_type: string = "";

	extend(other: Conversation) {
		if (this.title === "") {
			this.title = other.title;
		}

		if (this.thread_type === "") {
			this.thread_type = other.thread_type;
		}

		this.messages.push(...other.messages);

		// We could account for duplicate names, but the data only includes
		// names so we can't discern between messages from people with the same name anyway.
		for (const name of other.participants) {
			if (!this.participants.includes(name)) {
				this.participants.push(name);
			}
		}
	}
}
