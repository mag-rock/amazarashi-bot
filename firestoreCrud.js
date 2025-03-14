const firestore = require('./firestore');

async function createDocument(collection, docId, data) {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.set(data);
	console.log(`Document ${docId} created in collection ${collection}`);
}

async function readDocument(collection, docId) {
	const docRef = firestore.collection(collection).doc(docId);
	const doc = await docRef.get();
	if (!doc.exists) {
		console.log(`No document found with ID ${docId} in collection ${collection}`);
		return null;
	}
	console.log(`Document data:`, doc.data());
	return doc.data();
}

async function updateDocument(collection, docId, data) {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.update(data);
	console.log(`Document ${docId} updated in collection ${collection}`);
}

async function deleteDocument(collection, docId) {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.delete();
	console.log(`Document ${docId} deleted from collection ${collection}`);
}


async function getAllDocuments(collection) {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.get();

	if (snapshot.empty) {
		console.log(`コレクション ${collection} にドキュメントが存在しません。`);
		return [];
	}

	const documents = [];
	snapshot.forEach(doc => {
		documents.push({ id: doc.id, ...doc.data() });
	});

	console.log(`コレクション ${collection} の全ドキュメントを取得しました。`);
	return documents;
}

async function getDocumentsCreatedBy(collection, day) {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.where('date', '==', day).get();

	if (snapshot.empty) {
		console.log(`コレクション ${collection} に該当するドキュメントが存在しません。`);
		return [];
	}

	const documents = [];
	snapshot.forEach(doc => {
		documents.push({ id: doc.id, ...doc.data() });
	});

	console.log(`コレクション ${collection} の指定された日付のドキュメントを取得しました。`);
	return documents;
}

async function deleteDocumentsCreatedBy(collection, day) {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.where('date', '==', day).get();
	const batch = firestore.batch();

	snapshot.forEach(async (doc) => {
		batch.delete(doc.ref);
	});

	batch.commit();
	console.log(`コレクション ${collection} の指定された日付のドキュメントを削除しました。`);
}

module.exports = {
	createDocument,
	readDocument,
	updateDocument,
	deleteDocument,
	getAllDocuments,
	getDocumentsCreatedBy,
	deleteDocumentsCreatedBy,
};