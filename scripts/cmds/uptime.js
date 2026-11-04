const os = require("os");

module.exports = {
	config: {
		name: "uptime",
		aliases: ["up", "runtime", "status"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "show how long the bot has been running and its system stats"
		},
		category: "info",
		guide: {
			en: "{pn}"
		}
	},

	langs: {
		en: {
			format: "╭─────────────⭓"
				+ "\n│ ⏱️ UPTIME"
				+ "\n├─────⭔"
				+ "\n│ %1"
				+ "\n│ Days: %2 | Hours: %3"
				+ "\n│ Minutes: %4 | Seconds: %5"
				+ "\n├─────⭔"
				+ "\n│ 💻 SYSTEM"
				+ "\n│ CPU: %6 (%7 cores)"
				+ "\n│ RAM: %8 / %9 (%10%)"
				+ "\n│ Platform: %11 %12"
				+ "\n│ Node: %13"
				+ "\n├─────⭔"
				+ "\n│ 🐑 Bot: %14"
				+ "\n│ 🧩 Commands: %15"
				+ "\n│ 👥 Users: %16"
				+ "\n│ 💬 Threads: %17"
				+ "\n╰─────────────⭓"
		}
	},

	onStart: async function ({ message, api, event, getLang }) {
		const avatarEffects = ["avatar_love", "avatar_anger", "avatar_laugh", "avatar_cry"];
		const startTime = (global.GoatBot && global.GoatBot.startTime) || (Date.now() - process.uptime() * 1000);

		const uptimeMs = Date.now() - startTime;
		const totalSec = Math.floor(uptimeMs / 1000);
		const days = Math.floor(totalSec / 86400);
		const hours = Math.floor((totalSec % 86400) / 3600);
		const minutes = Math.floor((totalSec % 3600) / 60);
		const seconds = totalSec % 60;

		const cpus = os.cpus();
		const cpuModel = (cpus[0] && cpus[0].model || "Unknown").trim();
		const cores = cpus.length;

		const totalMem = os.totalmem();
		const freeMem = os.freemem();
		const usedMem = totalMem - freeMem;
		const memPercent = ((usedMem / totalMem) * 100).toFixed(1);

		const human = (bytes) => {
			const units = ["B", "KB", "MB", "GB", "TB"];
			let i = 0;
			let value = bytes;
			while (value >= 1024 && i < units.length - 1) {
				value /= 1024;
				i++;
			}
			return `${value.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
		};

		const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;
		const botName = (global.GoatBot && global.GoatBot.config && global.GoatBot.config.nickNameBot) || "Goat Bot";
		const commandCount = global.GoatBot && global.GoatBot.commands ? global.GoatBot.commands.size : 0;
		const userCount = global.db && global.db.allUserData ? global.db.allUserData.length : 0;
		const threadCount = global.db && global.db.allThreadData ? global.db.allThreadData.length : 0;

		const body = getLang(
			"format",
			uptimeString, days, hours, minutes, seconds,
			cpuModel, cores,
			human(usedMem), human(totalMem), memPercent,
			os.platform(), os.arch(),
			process.version,
			botName, commandCount, userCount, threadCount
		);

		const effect = avatarEffects[Math.floor(Math.random() * avatarEffects.length)];

		api.setMessageReaction("⏳", event.messageID, () => { }, true);
		try {
			await message.reply({ body, effect });
			api.setMessageReaction("✅", event.messageID, () => { }, true);
		}
		catch (err) {
			api.setMessageReaction("❌", event.messageID, () => { }, true);
			return message.reply(body);
		}
	}
};
