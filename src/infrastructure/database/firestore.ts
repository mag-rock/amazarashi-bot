import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import * as process from 'process';

let firestore: Firestore;
const CREDENTIALS_PATH = path.join(process.cwd(), 'config/amazarashi-bot-credentials.json');

if (process.env.ENVIRONMENT === 'local') {
	firestore = new Firestore({
		keyFilename: CREDENTIALS_PATH,
		projectId: process.env.FIREBASE_PROJECT_ID,
		databaseId: process.env.FIRESTORE_DATABASE_ID
	});
} else {
	// Cloud Run環境では環境変数から自動的にプロジェクトIDを取得
	firestore = new Firestore({
		projectId: process.env.FIREBASE_PROJECT_ID,
		databaseId: process.env.FIRESTORE_DATABASE_ID
	});
}

export default firestore; 