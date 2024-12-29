const {
	createDocument,
	readDocument,
	updateDocument,
	deleteDocument,
	getAllDocuments,
	getDocumentsCreatedBy,
} = require('./firestoreCrud');

async function testScenario() {
	// getAllDocuments
	let documents = await getAllDocuments('your_collection');
	console.log('All documents:', documents);

	// createDocument
	await createDocument('your_collection', 'testDoc',
		{
			origin_post_id: 'value1',
			date: '2023-10-15',
			quiz_posts: [{ level: 0, post_id: 'value1' }]
		});
	console.log('Document created.');

	// updateDocument
	await updateDocument('your_collection', 'testDoc',
		{
			quiz_posts: [{ level: 0, post_id: 'value1' }, { level: 1, post_id: 'value2' }]
		}
	);
	console.log('Document updated.');

	// getDocumentsCreatedBy
	documents = await getDocumentsCreatedBy('your_collection', '2023-10-15');
	console.log('Documents created on date:', documents);

	// deleteDocument
	await deleteDocument('your_collection', 'testDoc');
	console.log('Document deleted.');

	// getAllDocuments
	documents = await getAllDocuments('your_collection');
	console.log('All documents after deletion:', documents);
}

testScenario().catch(console.error);