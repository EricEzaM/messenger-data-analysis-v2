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

		// Account for cases where the conversation has multiple participants with the same name.
		// e.g. "Facebook user"
		let participantsWithNameInstanceNumber = [];
		for (let i = 0; i < other.participants.length; i++) {
			const p = other.participants[i];
			const instance = other.participants
				.slice(0, i + 1)
				.filter((p2) => p2.name === p.name).length;

			participantsWithNameInstanceNumber.push({
				name: p.name + (instance > 1 ? `_${instance}` : ""),
			});
		}

		for (const p of participantsWithNameInstanceNumber) {
			if (!this.participants.map((p) => p.name).includes(p.name)) {
				this.participants.push(p);
			}
		}
	}
}
