const axios = require("axios");

const baseApiUrl = async () => {
        const base = await axios.get("https://raw.githubusercontent.com/aura-mahmud/HINATA/main/baseApiUrl.json");
        return base.data.mahmud;
};

module.exports = {
        config: {
                name: "anisearch",
                aliases: ["anisr", "amv"],
                version: "4.7",
                author: "MahMUD",
                countDown: 10,
                role: 0,
                description: {
                        en: "Search and download anime videos",
                        vi: "Tìm kiếm và tải xuống video anime"
                },
                category: "anime",
                guide: {
                        en: '   {pn} <anime name>: Type anime name to search'
                                + '\n   Example: {pn} naruto',
                        vi: '   {pn} <tên anime>: Nhập tên anime để tìm kiếm'
                                + '\n   Ví dụ: {pn} naruto'
                }
        },

        langs: {
                en: {
                        noQuery: "• Baby, please provide a search query.",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                },
                vi: {
                        noQuery: "• Vui lòng nhập tên anime cần tìm.",
                        success: "• 𝐇𝐞𝐫𝐞'𝐬 𝐲𝐨𝐮𝐫 𝐚𝐧𝐢𝐦𝐞 𝐯𝐢𝐝𝐞𝐨 <😘\n• 𝐒𝐞𝐚𝐫𝐜𝐡: %1",
                        error: "× API error: %1. Contact MahMUD for help.\n•WhatsApp: 01836298139"
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                const authorName = String.fromCharCode(77, 97, 104, 77, 85, 68);
                if (this.config.author !== authorName) {
                        return api.sendMessage("You are not authorized to change the author name.", event.threadID, event.messageID);
                }

                if (!args.length) return message.reply(getLang("noQuery"));

                const search = args.join(" ");

                try { 
                        api.setMessageReaction("⏳", event.messageID, () => {}, true); 
                } catch (e) {}

                try {
                        const videoUrl = `${await baseApiUrl()}/api/anisr?search=${encodeURIComponent(search)}`;
                        const stream = await global.utils.getStreamFromURL(videoUrl);

                        api.setMessageReaction("🪽", event.messageID, () => {}, true);

                        return message.reply({ 
                                body: getLang("success", search),
                                attachment: stream
                        });

                } catch (err) {
                        console.error(err);
                        api.setMessageReaction("❌", event.messageID, () => {}, true);
                        return message.reply(getLang("error", err.message));
                }
        }
};
