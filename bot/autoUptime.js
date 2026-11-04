const axios = require('axios');
const { config } = global.GoatBot;
const { log, getText } = global.utils;

if (global.timeOutUptime) {
	clearTimeout(global.timeOutUptime);
	global.timeOutUptime = null;
}
if (global.intervalUptime) {
	clearInterval(global.intervalUptime);
	global.intervalUptime = null;
}
if (!config.autoUptime?.enable)
	return;

const PORT = process.env.PORT || config.serverUptime?.port || config.dashBoard?.port || 3001;

let myUrl = config.autoUptime.url || process.env.RENDER_EXTERNAL_URL || `https://${process.env.REPL_OWNER
	? `${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
	: process.env.API_SERVER_EXTERNAL == "https://api.glitch.com"
		? `${process.env.PROJECT_DOMAIN}.glitch.me`
		: `localhost:${PORT}`}`;
myUrl.includes('localhost') && (myUrl = myUrl.replace('https', 'http'));
myUrl += '/uptime';

let status = 'ok';
async function autoUptime() {
	try {
		await axios.get(myUrl);
		if (status != 'ok') {
			status = 'ok';
			log.info("UPTIME", "Bot is online");
		}
	}
	catch (e) {
		const err = e.response?.data || e;
		if (status != 'ok')
			return;
		status = 'failed';

		if (err.statusAccountBot == "can't login") {
			log.err("UPTIME", "Can't login account bot");
		}
		else if (err.statusAccountBot == "block spam") {
			log.err("UPTIME", "Your account is blocked");
		}
	}
}

// First ping after one interval, then keep pinging on a stable interval.
const interval = (config.autoUptime.timeInterval || 180) * 1000;
global.timeOutUptime = setTimeout(() => {
	autoUptime();
	global.intervalUptime = setInterval(autoUptime, interval);
}, interval);

log.info("AUTO UPTIME", getText("autoUptime", "autoUptimeTurnedOn", myUrl));
