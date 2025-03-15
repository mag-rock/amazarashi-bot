import { Firestore } from '@google-cloud/firestore';
import * as path from 'path';
import * as process from 'process';

let firestore: Firestore;
const CREDENTIALS_PATH = path.join(process.cwd(), 'amazarashi-bot-credentials.json');

if (process.env.ENVIRONMENT === 'local') {
	firestore = new Firestore({
		keyFilename: CREDENTIALS_PATH,
	});
} else {
	firestore = new Firestore();
}

export default firestore; 