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
	await createDocument('your_collection', 'testDoc', { field1: 'value1', date: '2023-10-15' });
	console.log('Document created.');

	// updateDocument
	await updateDocument('your_collection', 'testDoc', { field1: 'updatedValue' });
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