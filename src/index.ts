import * as functions from '@google-cloud/functions-framework';
import { execute } from './domain/services/karuta/karutaScript';
import { Request, Response } from 'express';

console.info(`Running on Node.js version: ${process.version}`);

functions.http('helloHttp', async (req: Request, res: Response) => {
	console.info(`Request received.`);
	execute().then(() => {
		res.status(200).send('Success to post tweet.');
	}).catch((error: Error) => {
		res.status(500).send('Error: ' + error.message);
	});
}); 