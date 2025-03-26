import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { TwitterCredentials } from '@/types';
import { getAppConfig } from '@/config/appConfig';
import { info } from '@/utils/logger';

/**
 * タイムゾーンを設定したdayjsインスタンスを取得する
 * @returns タイムゾーン設定済みのdayjsインスタンス
 */
function getDayJsWithTimeZone() {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  const config = getAppConfig();
  info(`タイムゾーンを設定: ${config.timezone}`);
  return dayjs().tz(config.timezone);
}

/**
 * Twitter API認証情報を取得する
 * @returns Twitter API認証情報
 */
function getTwitterCredentials(): TwitterCredentials {
  const consumerKey = process.env.TWITTER_API_KEY ?? '';
  const consumerSecret = process.env.TWITTER_API_KEY_SECRET ?? '';
  const accessToken = process.env.TWITTER_ACCESS_TOKEN ?? '';
  const accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET ?? '';

  // 認証情報が設定されているか確認
  if (!consumerKey || !consumerSecret || !accessToken || !accessTokenSecret) {
    info('Twitter認証情報の一部が設定されていません');
  }

  return {
    consumerKey,
    consumerSecret,
    accessToken,
    accessTokenSecret,
  };
}

export { getDayJsWithTimeZone, getTwitterCredentials };
