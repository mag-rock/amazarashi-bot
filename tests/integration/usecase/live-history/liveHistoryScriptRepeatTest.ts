import { execute } from '@/application/usecase/live-history/liveHistoryScript';
import { getDayJsWithTimeZone } from '@/infrastructure/config/configLoader';
import { deleteDocumentsCreatedBy } from '@/infrastructure/database/firestoreCrud';

console.log(`Running on Node.js version: ${process.version}`);

async function doTest(): Promise<void> {
	if (process.env.USE_TWITTER_MOCK !== 'true') {
		console.log('USE_TWITTER_MOCK is not true.');
		return;
	} else {
		for (let i = 0; i < 30; i++) {
			try {
				const result = await execute();
				if (result === 'ALREADY_POSTED') {
					const todayStr = getDayJsWithTimeZone().format('YYYY-MM-DD');
					await deleteDocumentsCreatedBy('live_history', todayStr);
				}
				console.log('Success to post tweet.');
			} catch (error) {
				console.error('Error: ' + (error as Error).message);
			}
		}
	}
}

doTest(); 