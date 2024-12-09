const { Firestore } = require('@google-cloud/firestore');
const path = require('path');

let firestore;
const CREDENTIALS_PATH = path.join(process.cwd(), 'amazarashi-bot-credentials.json');

if (process.env.ENVIRONMENT === 'local') {
	firestore = new Firestore({
		keyFilename: CREDENTIALS_PATH,
	});
} else {
	firestore = new Firestore();
}

module.exports = firestore;
