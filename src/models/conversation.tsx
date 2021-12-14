export class Message {
	content: string = "";
	sender_name: string = "";
	type: string = "";
	timestamp_ms: number = -1;
}

export class Participant {
	name: string = "";
}

export class Conversation {
	title: string = "";
	messages: Message[] = [];
	participants: Participant[] = [];
	thread_type: string = "";

	extend(other: Conversation) {
		if (this.title === "") {
			this.title = other.title;
		}

		if (this.thread_type === "") {
			this.thread_type = other.thread_type;
		}

		this.messages.push(...other.messages);

		for (const p of other.participants) {
			if (!this.participants.map((p) => p.name).includes(p.name)) {
				this.participants.push(p);
			}
		}
	}
}
