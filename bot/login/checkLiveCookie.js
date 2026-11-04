const axios = require("axios");

/**
 *
 * @param {string} cookie Cookie string as `c_user=123;xs=123;datr=123;` format
 * @param {string} userAgent User agent string
 * @returns {Promise<Boolean|null>} true when the cookie looks live, false when Facebook clearly rejected it, null when the result is inconclusive
 */
module.exports = async function (cookie, userAgent) {
	try {
		const response = await axios({
			url: 'https://mbasic.facebook.com/settings',
			method: "GET",
			headers: {
				cookie,
				"user-agent": userAgent || 'Mozilla/5.0 (Linux; Android 12; M2102J20SG) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.0.0 Mobile Safari/537.36',
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
				"accept-language": "vi,en-US;q=0.9,en;q=0.8",
				"sec-ch-prefers-color-scheme": "dark",
				"sec-ch-ua": "\"Chromium\";v=\"112\", \"Microsoft Edge\";v=\"112\", \"Not:A-Brand\";v=\"99\"",
				"sec-ch-ua-mobile": "?0",
				"sec-ch-ua-platform": "\"Windows\"",
				"sec-fetch-dest": "document",
				"sec-fetch-mode": "navigate",
				"sec-fetch-site": "none",
				"sec-fetch-user": "?1",
				"upgrade-insecure-requests": "1"
			}
		});

		const html = response.data || "";
		if (html.includes('/privacy/xcs/action/logging/') || html.includes('/notifications.php?') || html.includes('href="/login/save-password-interstitial'))
			return true;
		if (html.includes('id="login_form"') || html.includes('name="login"') || html.includes('/login/device-based/'))
			return false;
		// The page markup changed or a challenge page was served: let the real login decide.
		return null;
	}
	catch (e) {
		// Network failure or blocked host: not proof that the cookie is dead.
		return null;
	}
};
