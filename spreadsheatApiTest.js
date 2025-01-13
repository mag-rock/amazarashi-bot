const { authorizeGoogleApis, getSheats } = require('./spreadsheatApi');

console.log(`Running on Node.js version: ${process.version}`);

const params = {
	spreadsheetId: '18sYgADWuSJKYeA7NiCvDaGaSLhovBiTd5KIrC9yLz8E',
	targetRange: '歌詞一覧!A2:J',
};

async function doGetSheats() {
	const auth = await authorizeGoogleApis();
	const sheat = await getSheats(auth, params);

	if (sheat) {
		const rows = sheat;
		rows.forEach((row) => {
			let rowlogText = "";
			row.forEach((cell) => rowlogText += cell + ", ");
			// Print columns A and E, which correspond to indices 0 and 4.
			console.log(rowlogText);
		});
	}
}

doGetSheats();