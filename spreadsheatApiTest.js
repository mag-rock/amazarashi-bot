const { authorizeGoogleApis, getSheets } = require('./spreadsheetApi');

console.log(`Running on Node.js version: ${process.version}`);

const params = {
	spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
	targetRange: '歌詞一覧!A2:J',
};

async function doGetSheets() {
	const auth = await authorizeGoogleApis();
	const sheet = await getSheets(auth, params);

	if (sheet) {
		const rows = sheet;
		rows.forEach((row) => {
			let rowlogText = "";
			row.forEach((cell) => rowlogText += cell + ", ");
			// Print columns A and E, which correspond to indices 0 and 4.
			console.log(rowlogText);
		});
	}
}

doGetSheets();