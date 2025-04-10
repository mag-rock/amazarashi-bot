import { execute } from '@/application/usecase/live-history/liveHistoryScript';

console.log(`Running on Node.js version: ${process.version}`);

execute().then(() => {
	console.log('Success to post tweet.');
}).catch((error: Error) => {
	console.error('Error: ' + error.message);
}); 