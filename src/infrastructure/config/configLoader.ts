import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

function getDayJsWithTimeZone() {
	dayjs.extend(utc);
	dayjs.extend(timezone);
	return dayjs().tz('Asia/Tokyo');
}

interface TwitterCredentials {
	consumerKey: string;
	consumerSecret: string;
	accessToken: string;
	accessTokenSecret: string;
}

function getTwitterCredentials(): TwitterCredentials {
	const consumerKey = process.env.TWITTER_API_KEY ?? '';
	const consumerSecret = process.env.TWITTER_API_KEY_SECRET ?? '';
	const accessToken = process.env.TWITTER_ACCESS_TOKEN ?? '';
	const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '';

	return {
		consumerKey,
		consumerSecret,
		accessToken,
		accessTokenSecret,
	};
}

export { getDayJsWithTimeZone, getTwitterCredentials }; 