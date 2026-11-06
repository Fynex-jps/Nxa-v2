const axios = require('axios');
const fs = require('fs');
const p = ["61588057525081"];
const base = "https://paste.neokex.xyz/api/pastes";
const apiKey = "neokex-paste-6t9";
module.exports = {
	config: {
		name: "savetext",
		aliases: ["save", "paste", "pastebin"],
		author: "Neoaz 🐊",
		category: "owner",
		countDown: 5,
		role: 0,
		shortDescription: "Save text to NEOKEX-PASTE",
		guide: { en: "save <file name> | reply to a message" }
	},
	onStart: async function({ message, event, args }) {
		let content;
		if (event.messageReply?.body) {
			content = event.messageReply.body;
		} else if (args.length) {
			if (p.includes(event.senderID)) {
				let file = args[0];
				if (!file.endsWith(".js")) {
					file += ".js";
				}
				if (!fs.existsSync(__dirname + '/' + file)) return message.reply(`file ${file} doesn't exists`);
				content = fs.readFileSync(__dirname + '/' + file, 'utf8');
			} else {
				content = args.join(" ");
			}
		} else {
			return message.reply("Reply to a message or send text to save");
		}
		try {
			const { data } = await axios.post(base, content, {
				headers: { 'Content-Type': 'text/plain', Authorization: `Bearer ${apiKey}` }
			});
			if (!data?.rawUrl) return message.reply("❌ | An error occurred");
			message.reply({ body: data.rawUrl });
		} catch (e) {
			message.reply(e.message);
		}
	}
}
