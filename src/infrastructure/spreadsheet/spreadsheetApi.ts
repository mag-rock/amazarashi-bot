import { isLocalEnvironment } from '@/config/appConfig';
import { SheetRows, SpreadsheetsParams } from '@/types';
import { tryCatchRethrow } from '@/utils/errorHandler';
import { error, info } from '@/utils/logger';
import { authenticate } from '@google-cloud/local-auth';
import * as fs from 'fs/promises';
import { GoogleAuth, JWT } from 'google-auth-library';
import { google } from 'googleapis';
import * as path from 'path';
import * as process from 'process';

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = path.join(process.cwd(), 'config/token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'config/credentials.json');

/**
 * 保存された認証情報を読み込む
 * @returns 認証クライアント
 */
async function loadSavedCredentialsIfExist(): Promise<JWT> {
  try {
    const content = await fs.readFile(TOKEN_PATH, 'utf-8');
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials) as JWT;
  } catch (err) {
    throw error('認証情報の読み込みに失敗しました', { error: String(err) });
  }
}

/**
 * 認証情報をファイルに保存する
 * @param client 認証クライアント
 */
async function saveCredentials(client: any): Promise<void> {
  try {
    const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
    info('認証情報を保存しました');
  } catch (err) {
    error('認証情報の保存に失敗しました', { error: String(err) });
  }
}

/**
 * ローカル環境での認証を行う
 * @returns 認証クライアント
 */
async function authorizeAtLocal(): Promise<JWT> {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    info('保存された認証情報を使用します');
    return client;
  }

  info('新しい認証フローを開始します');
  client = (await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  })) as any;

  if (client && client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

/**
 * Google APIの認証を行う
 * @returns 認証クライアント
 */
export async function authorizeGoogleApis(): Promise<JWT> {
  return tryCatchRethrow(async () => {
    if (isLocalEnvironment()) {
      info('ローカル環境用の認証を使用します');
      return await authorizeAtLocal();
    } else {
      info('本番環境用の認証を使用します');
      const auth = new GoogleAuth({
        scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      });
      return (await auth.getClient()) as JWT;
    }
  }, 'Google API認証中にエラーが発生しました');
}

/**
 * スプレッドシートからデータを取得する
 * @param auth 認証クライアント
 * @param params スプレッドシートパラメータ
 * @returns スプレッドシートデータ
 */
export async function getSheets(auth: JWT, params: SpreadsheetsParams): Promise<SheetRows> {
  return tryCatchRethrow(async () => {
    info('スプレッドシートからデータを取得します', {
      spreadsheetId: params.spreadsheetId,
      range: params.targetRange,
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: params.spreadsheetId,
      range: params.targetRange,
    });

    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      info('スプレッドシートにデータがありません');
      return [];
    } else {
      info('スプレッドシートからデータを取得しました', { rowCount: rows.length });
      return rows;
    }
  }, 'スプレッドシートデータ取得中にエラーが発生しました');
}
