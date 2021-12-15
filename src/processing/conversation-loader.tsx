import { Conversation } from "../models/conversation";

export class ConversationLoader {
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
				let fileConv = JSON.parse(res, (key, value) => {
					if (key === "participants") {
						return value.map((p: { name: string }) => p.name);
					}

					return value;
				});

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
