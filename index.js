const functions = require('@google-cloud/functions-framework');
const { execute } = require('./karutaScript');
console.info(`Running on Node.js version: ${process.version}`);

functions.http('helloHttp', async (req, res) => {
	console.info(`Request recieved.`);
	execute();
});
