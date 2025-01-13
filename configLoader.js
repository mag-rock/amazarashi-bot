function getDayJsWithTimeZone() {
	const dayjs = require('dayjs');
	const utc = require('dayjs/plugin/utc');
	const timezone = require('dayjs/plugin/timezone');
	dayjs.extend(utc);
	dayjs.extend(timezone);
	return dayjs().tz('Asia/Tokyo');
}

function getTwitterCredentials() {
	const consumerKey = process.env.API_KEY;
	const consumerSecret = process.env.API_KEY_SECRET;
	const accessToken = process.env.ACCESS_TOKEN;
	const accessTokenSecret = process.env.ACCESS_TOKEN_SECRET;
	return {
		consumerKey,
		consumerSecret,
		accessToken,
		accessTokenSecret,
	};
}

module.exports = { getDayJsWithTimeZone, getTwitterCredentials };