const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
        config: {
                name: "pfp",
                aliases: ["profilepic", "pp"],
                version: "1.2",
                author: "Neoaz 🐊",
                countDown: 5,
                role: 0,
                description: {
                        en: "Fetch user's profile picture"
                },
                category: "utility",
                guide: {
                        en: "   {pn}: Fetch your profile picture"
                                + "\n   {pn} <@tag>: Fetch tagged user's profile picture"
                                + "\n   {pn} <uid>: Fetch profile picture from UID"
                                + "\n   (Or reply to someone's message)"
                }
        },

        langs: {
                en: {
                        error: "× Could not fetch profile picture: %1",
                        invalidUID: "! Invalid UID"
                }
        },

        onStart: async function ({ api, message, args, event, getLang }) {
                try {
                        let uid = event.senderID;

                        if (event.messageReply) {
                                uid = event.messageReply.senderID;
                        } else if (Object.keys(event.mentions).length > 0) {
                                uid = Object.keys(event.mentions)[0];
                        } else if (args[0] && !isNaN(args[0])) {
                                uid = args[0];
                        }

                        if (!uid || isNaN(uid))
                                return message.reply(getLang("invalidUID"));

                        const cachePath = path.join(__dirname, "cache", `pfp_${uid}.jpg`);
                        await fs.ensureDir(path.dirname(cachePath));

                        let fetched = false;
                        try {
                                const userInfo = (await api.getUserInfo(String(uid)))[String(uid)];
                                const url = userInfo && userInfo.thumbSrc;
                                if (url) {
                                        const response = await axios.get(url, { responseType: "arraybuffer" });
                                        await fs.writeFile(cachePath, Buffer.from(response.data));
                                        fetched = true;
                                }
                        }
                        catch (e) { }

                        if (!fetched) {
                                const fallback = `https://graph.facebook.com/${uid}/picture?width=720&height=720`;
                                const response = await axios.get(fallback, { responseType: "arraybuffer" });
                                await fs.writeFile(cachePath, Buffer.from(response.data));
                        }

                        await message.reply({ attachment: fs.createReadStream(cachePath) });
                        await fs.remove(cachePath);
                } catch (err) {
                        return message.reply(getLang("error", err.message));
                }
        }
};
