const functions = require('@google-cloud/functions-framework');
const { execute } = require('./karutaScript');
console.info(`Running on Node.js version: ${process.version}`);

functions.http('helloHttp', async (req, res) => {
	console.info(`Request recieved.`);
	execute().then(() => {
		res.status(200).send('Success to post tweet.');
	}).catch((error) => {
		res.status(500).send('Error: ' + error.message);
	});
});
