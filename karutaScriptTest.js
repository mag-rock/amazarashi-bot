const { execute } = require('./karutaScript');

console.log(`Running on Node.js version: ${process.version}`);

execute().then(() => {
	console.log('Success to post tweet.');
}).catch((error) => {
	console.error(error);
	console.log('Error: ' + error.message);
});
