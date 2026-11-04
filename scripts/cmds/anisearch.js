const axios = require("axios");

const API_BASE = "https://pin.neokex.xyz";
const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

const SEARCH_LIMIT = 50;
const DOWNLOAD_LIMIT = 83 * 1024 * 1024;
const VIDEO_WIDTHS = [720, 540, 360, 240];
const MAX_ATTEMPTS = 5;
const RECENT_CAP = 25;

const recent = new Map();

function react(api, messageID, emoji) {
	if (messageID)
		api.setMessageReaction(emoji, messageID, () => { }, true);
}

function cleanText(text) {
	return String(text || "").replace(/\s+/g, " ").trim();
}

function mp4Urls(hlsUrl) {
	const match = String(hlsUrl || "").match(/^(https?:\/\/[^/]+\/videos\/(?:iht|mc))\/hls\/(.+)\.m3u8$/);
	if (!match)
		return [];
	const base = match[1];
	const hash = match[2];
	const urls = [];
	for (const width of VIDEO_WIDTHS) {
		urls.push(`${base}/expMp4/${hash}_${width}w.mp4`);
		urls.push(`${base}/${width}p/${hash}.mp4`);
	}
	return urls;
}

async function searchVideos(query) {
	const { data } = await axios.get(`${API_BASE}/api/videos`, {
		params: { q: query, limit: SEARCH_LIMIT },
		timeout: 45000,
		headers: { "user-agent": USER_AGENT, "accept": "application/json" }
	});
	if (!data || data.success === false || !Array.isArray(data.results))
		throw new Error((data && data.error && data.error.message) || "The Pinterest API returned an invalid response");
	return data.results
		.filter(result => result && result.video && result.video.url)
		.map(result => ({
			id: result.id,
			title: cleanText(result.title) || cleanText(result.description) || cleanText(result.alt_text) || "Anime Video",
			videoUrl: result.video.url
		}));
}

function pickRandom(items, query) {
	const seen = recent.get(query) || [];
	let pool = items.filter(item => !seen.includes(item.id));
	if (!pool.length) {
		seen.length = 0;
		pool = items;
	}
	const item = pool[Math.floor(Math.random() * pool.length)];
	seen.push(item.id);
	while (seen.length > RECENT_CAP)
		seen.shift();
	recent.set(query, seen);
	return item;
}

async function fetchVideo(item) {
	for (const url of mp4Urls(item.videoUrl)) {
		try {
			const response = await axios({
				url,
				method: "GET",
				responseType: "stream",
				timeout: 120000,
				maxRedirects: 5,
				headers: { "user-agent": USER_AGENT, "range": "bytes=0-" }
			});
			const contentType = String(response.headers["content-type"] || "");
			if (!/video|octet-stream/i.test(contentType)) {
				response.data.destroy();
				continue;
			}
			const size = Number(response.headers["content-length"]) || 0;
			if (size > DOWNLOAD_LIMIT) {
				response.data.destroy();
				continue;
			}
			response.data.path = `anisearch_${Date.now()}.mp4`;
			return response.data;
		}
		catch (err) {
		}
	}
	return null;
}

module.exports = {
	config: {
		name: "anisearch",
		aliases: ["anivid", "anime", "pinvid"],
		version: "1.0",
		author: "Neoaz 🐊",
		countDown: 5,
		role: 0,
		description: {
			en: "Send a random anime video from Pinterest for a keyword"
		},
		category: "media",
		guide: {
			en: "   {pn} <keyword>"
				+ "\n   Example: {pn} naruto"
				+ "\n   Sends a random anime video matching the keyword."
		}
	},

	langs: {
		en: {
			error: "An error occurred: %1",
			noResult: "No anime video found for \"%1\"",
			busy: "Pinterest is not responding right now, please try again in a few minutes."
		}
	},

	onStart: async function ({ api, args, event, message, getLang }) {
		const query = args.join(" ").trim();
		if (!query)
			return message.SyntaxError();

		react(api, event.messageID, "⏳");

		let candidates;
		try {
			candidates = await searchVideos(query);
		}
		catch (err) {
			react(api, event.messageID, "❌");
			return message.reply(getLang("busy"));
		}

		if (!candidates.length) {
			react(api, event.messageID, "❌");
			return message.reply(getLang("noResult", query));
		}

		const tried = new Set();
		for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
			const pool = candidates.filter(item => !tried.has(item.id));
			if (!pool.length)
				break;
			const item = pickRandom(pool, query);
			tried.add(item.id);
			const attachment = await fetchVideo(item);
			if (!attachment)
				continue;
			try {
				await message.reply({ body: item.title, attachment });
				react(api, event.messageID, "✅");
				return;
			}
			catch (err) {
				react(api, event.messageID, "❌");
				return message.reply(getLang("error", err.message || JSON.stringify(err)));
			}
		}

		react(api, event.messageID, "❌");
		return message.reply(getLang("noResult", query));
	}
};
