const { authorize, getSheats } = require('./spreadsheatApi');

console.log(`Running on Node.js version: ${process.version}`);

const params = {
	spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
	targetRange: '歌詞一覧!A2:O',
};
authorize()
	.then(auth => getSheats(auth, params))
	.catch(console.error);
