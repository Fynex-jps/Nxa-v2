const fs = require("fs-extra");

module.exports = {
	config: {
		name: "noprefix",
		aliases: ["nopx", "np"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 2,
		description: {
			en: "turn on/off no-prefix mode for bot admins"
		},
		category: "owner",
		guide: {
			en: "   {pn} [on | off]: turn no-prefix mode on/off"
				+ "\n   {pn}: show the current state"
		}
	},

	langs: {
		en: {
			turnedOn: "✅ Turned on no-prefix mode. Bot admins can now use commands without a prefix.",
			turnedOff: "✅ Turned off no-prefix mode.",
			status: "🌐 No-prefix mode is currently: %1",
			on: "on",
			off: "off"
		}
	},

	onStart: async function ({ args, message, getLang }) {
		const config = global.GoatBot.config;
		const noPrefix = config.noprefix || (config.noprefix = { enable: false });
		const action = (args[0] || "").toLowerCase();

		if (!action)
			return message.reply(getLang("status", getLang(noPrefix.enable ? "on" : "off")));

		if (action !== "on" && action !== "off")
			return message.SyntaxError();

		noPrefix.enable = action === "on";
		fs.writeFileSync(global.client.dirConfig, JSON.stringify(config, null, 2));
		return message.reply(getLang(noPrefix.enable ? "turnedOn" : "turnedOff"));
	}
};
