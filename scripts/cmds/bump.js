module.exports = {
	config: {
		name: "bump",
		aliases: ["b"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "bump a message back to the top of the chat"
		},
		category: "box chat",
		guide: {
			en: "   {pn}: reply to the message you want to bump"
		}
	},

	langs: {
		en: {
			syntaxError: "⚠️ Please reply to the message you want to bump"
		}
	},

	onStart: async function ({ api, event, message, args }) {
		if (!event.messageReply)
			return message.SyntaxError();

		const targetID = event.messageReply.messageID;
		const text = args.join(" ").trim();
		await api.bumpMessage(targetID, event.threadID, text);
	}
};
