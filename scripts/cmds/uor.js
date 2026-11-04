const fs = require("fs-extra");

module.exports = {
	config: {
		name: "uor",
		aliases: ["unsendonreaction", "unsendreact"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 2,
		description: {
			en: "turn on/off unsend when a bot admin reacts to a bot message with 😠 or 😡"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off]: turn unsend-on-reaction on/off"
				+ "\n   {pn}: show the current state"
		}
	},

	langs: {
		en: {
			turnedOn: "✅ Turned on unsendOnReaction. A bot admin reacting to a bot message with 😠 or 😡 will unsend it.",
			turnedOff: "✅ Turned off unsendOnReaction.",
			status: "🌐 unsendOnReaction is currently: %1",
			on: "on",
			off: "off"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const config = global.GoatBot.config;
		const unsendOnReaction = config.unsendOnReaction || (config.unsendOnReaction = { enable: false });
		const action = (args[0] || "").toLowerCase();

		if (!action)
			return message.reply(getLang("status", getLang(unsendOnReaction.enable ? "on" : "off")));

		if (action !== "on" && action !== "off")
			return message.SyntaxError();

		unsendOnReaction.enable = action === "on";
		fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
		return message.reply(getLang(unsendOnReaction.enable ? "turnedOn" : "turnedOff"));
	}
};
