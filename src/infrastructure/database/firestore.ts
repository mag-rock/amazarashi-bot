import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import * as process from 'process';
import { isLocalEnvironment } from '@/config/appConfig';
import { info } from '@/utils/logger';

let firestore: Firestore;
const CREDENTIALS_PATH = path.join(process.cwd(), 'config/amazarashi-bot-credentials.json');

/**
 * Firestoreインスタンスを初期化
 * 環境に応じて適切な認証方法を選択
 */
if (isLocalEnvironment()) {
  info('ローカル環境用のFirestore設定を使用します', { credentialsPath: CREDENTIALS_PATH });
  firestore = new Firestore({
    keyFilename: CREDENTIALS_PATH,
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseId: process.env.FIRESTORE_DATABASE_ID,
  });
} else {
  // Cloud Run環境では環境変数から自動的にプロジェクトIDを取得
  info('本番環境用のFirestore設定を使用します');
  firestore = new Firestore({
    projectId: process.env.FIREBASE_PROJECT_ID,
    databaseId: process.env.FIRESTORE_DATABASE_ID,
  });
}

export default firestore;
