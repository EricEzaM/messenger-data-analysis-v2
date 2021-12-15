import {
	getDate,
	getDay,
	getHours,
	getMinutes,
	getMonth,
	getYear,
	set,
} from "date-fns";
import GraphemeSplitter from "grapheme-splitter";
import { Conversation, Message } from "../models/conversation";
import {
	ConversationData,
	MessageData,
	MessageType,
	TimeData,
} from "../models/conversation-stats";
import { LatinChars } from "../utils";

export class ConversationAnalyser {
	analyse(conversation: Conversation): ConversationData {
		let participantMessages: { [key: string]: number } = {};
		let messagesData: MessageData[] = [];

		for (const msg of conversation.messages) {
			// Update the participant message counts
			participantMessages[msg.sender_name] =
				(participantMessages[msg.sender_name] ?? 0) + 1;

			// Get all other message data
			// Content data is used to get words and emojis, but is not returned itself.
			let contentData = this.getTextMessageData(msg);

			let msgData: MessageData = {
				sender: msg.sender_name,
				emojis: this.getEmojiData(contentData),
				wordCount: msg.content ? msg.content.split(" ").length : null,
				words: this.getWordsData(contentData),
				time: this.getMessageTimeData(msg),
				type: this.getMessageType(msg),
			};

			messagesData.push(msgData);
		}

		// General conversation data
		let convData: ConversationData = {
			title: conversation.title,
			participants: conversation.participants,
			participantMessageCount: participantMessages,
			messages: messagesData,
		};

		return convData;
	}

	getMessageType(message: Message): MessageType {
		if (message.sticker) {
			return "Sticker";
		} else if (message.videos) {
			return "Videos";
		} else if (message.photos) {
			return "Photos";
		} else if (message.files) {
			return "Files";
		} else if (message.gifs) {
			return "GIFs";
		} else if (message.share || message.type === "Share") {
			return "Shared Link";
		} else if (message.audio_files) {
			return "Audio";
		} else if (message.plan) {
			return "Plan";
		} else if (message.content) {
			return "Text";
		} else {
			return "Unknown";
		}
	}

	getMessageTimeData(message: Message): TimeData {
		let msgDate = new Date(message.timestamp_ms);

		return {
			day: getDay(msgDate),
			date_of_month: getDate(msgDate),
			month: getMonth(msgDate),
			year: getYear(msgDate),
			hour: getHours(msgDate),
			minute: getMinutes(msgDate),
			date: set(msgDate, {
				hours: 0,
				minutes: 0,
				seconds: 0,
				milliseconds: 0,
			}),
		};
	}

	getTextMessageData(message: Message): string[] {
		if (this.getMessageType(message) !== "Text") {
			return [];
		}

		let content = decodeURIComponent(escape(message.content));

		// Facebooks emoticons shortcuts (only used for old messages)
		content = content
			.replaceAll(/( :\))/g, " 🙂 ")
			.replaceAll(/( <\("\))/g, " 🐧 ")
			.replaceAll(/( :\()/g, " 😞 ")
			.replaceAll(/( :\/)/g, " 😕 ")
			.replaceAll(/( :P)/g, " 😛 ")
			.replaceAll(/ :D/g, " 😀 ")
			.replaceAll(/ :o/g, " 😮 ")
			.replaceAll(/ ;\)/g, " 😉 ")
			.replaceAll(/ B-\)/g, " 😎 ")
			.replaceAll(/ >:\(/g, " 😠 ")
			.replaceAll(/ :'\(/g, " 😢 ")
			.replaceAll(/ 3:\)/g, " 😈 ")
			.replaceAll(/ O:\)/gi, " 😇 ")
			.replaceAll(/ :\*/g, " 😗 ")
			.replaceAll(/<3/g, " ❤ ")
			.replaceAll(/\^_\^/g, " 😊 ")
			.replaceAll(/-_-/g, " 😑 ")
			.replaceAll(/ >:O/gi, " 😠 ")
			.replaceAll(/\(y\)/gi, " 👍 ");

		// Uses regex to replace certain patterns.
		// * All punctuation, including space-apostrophe/apostrophe-space patterns.
		// * Punctuation and symbols not in words
		return content
			.toLowerCase()
			.replace(/['"]\s+/g, "") // apostrophe space
			.replace(/\s+['"]/g, "") // space apostrophe
			.replace(/[.,/\\#!$%^&*;:{}=\-_`"~()[\]@?+><]/g, "") // punctuation
			.replace(/\s+/g, " ") // multiple spaces
			.split(" ")
			.filter((s) => s !== "");
	}

	getWordsData(words: string[]) {
		var regularCharacters = new RegExp("[\\w‘’“”'" + LatinChars + "]", "g");

		// Doesn't contain a valid char - meaning contents is ONLY an emoji
		var emojiCharacters = new RegExp("[^\\w‘’“”'" + LatinChars + "]", "g");

		/* Match anthing that DOES CONTAIN an alphanumeric character or apostrophe. 
		this unfiltered list will still contain words that have emojis at the 
		start/end with no space in between. */
		var wordsWithEmojis = words.filter((w) => w.match(regularCharacters));

		var wordsOnly = wordsWithEmojis
			.map((word) => word.replaceAll(emojiCharacters, "")) // Remove the emojis so just the word is left.
			.filter((word) => word); // Remove empty entries

		return wordsOnly;
	}

	getEmojiData(words: string[]) {
		// Doesn't contain a valid char - meaning contents is ONLY an emoji
		var emojiCharacters = new RegExp("[^\\w‘’“”'" + LatinChars + "]", "g");

		// Match anything that contains something that IS NOT an alphanumeric
		// charater or apostophe (i.e. must be an emoji)
		var messageAllEmojis = words.filter((w) => w.match(emojiCharacters));

		// Use emoji splitter tool to split by emojis.
		var splitter = new GraphemeSplitter();

		// Returns array used to store INDIVIDUAL emojis sent. Eg 3 hearts in a row
		// become 3 induvidual hearts
		return messageAllEmojis
			.map((word) => {
				var splitwords = splitter.splitGraphemes(word);
				// Remove other characters, only leaving emojis
				var emojis = splitwords.filter((n) => n.match(emojiCharacters));

				return emojis;
			})
			.flat();
	}
}
