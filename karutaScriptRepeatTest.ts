import { execute } from './karutaScript';
import { deleteDocumentsCreatedBy } from './firestoreCrud';
import { getDayJsWithTimeZone } from './configLoader';

console.log(`Running on Node.js version: ${process.version}`);

async function doTest(): Promise<void> {
	if (process.env.USE_TWITTER_MOCK !== 'true') {
		console.log('USE_TWITTER_MOCK is not true.');
		return;
	} else {
		for (let i = 0; i < 30; i++) {
			try {
				const result = await execute();
				if (result === 'FINISHED') {
					const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
					await deleteDocumentsCreatedBy('quiz', todayStr);
				}
				console.log('Success to post tweet.');
			} catch (error) {
				console.error('Error: ' + (error as Error).message);
			}
		}
	}
}

doTest(); 