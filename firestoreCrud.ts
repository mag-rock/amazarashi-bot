import firestore from './firestore';
import { DocumentData, DocumentReference, QuerySnapshot } from '@google-cloud/firestore';

export async function createDocument(collection: string, docId: string, data: Record<string, any>): Promise<void> {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.set(data);
	console.log(`Document ${docId} created in collection ${collection}`);
}

export async function readDocument(collection: string, docId: string): Promise<DocumentData | null> {
	const docRef = firestore.collection(collection).doc(docId);
	const doc = await docRef.get();
	if (!doc.exists) {
		console.log(`No document found with ID ${docId} in collection ${collection}`);
		return null;
	}
	console.log(`Document data:`, doc.data());
	return doc.data() || null;
}

export async function updateDocument(collection: string, docId: string, data: Record<string, any>): Promise<void> {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.update(data);
	console.log(`Document ${docId} updated in collection ${collection}`);
}

export async function deleteDocument(collection: string, docId: string): Promise<void> {
	const docRef = firestore.collection(collection).doc(docId);
	await docRef.delete();
	console.log(`Document ${docId} deleted from collection ${collection}`);
}

export async function getAllDocuments(collection: string): Promise<Array<DocumentData & { id: string }>> {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.get();

	if (snapshot.empty) {
		console.log(`コレクション ${collection} にドキュメントが存在しません。`);
		return [];
	}

	const documents: Array<DocumentData & { id: string }> = [];
	snapshot.forEach(doc => {
		documents.push({ id: doc.id, ...doc.data() });
	});

	console.log(`コレクション ${collection} の全ドキュメントを取得しました。`);
	return documents;
}

export async function getDocumentsCreatedBy(collection: string, day: string): Promise<Array<DocumentData & { id: string }>> {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.where('date', '==', day).get();

	if (snapshot.empty) {
		console.log(`コレクション ${collection} に該当するドキュメントが存在しません。`);
		return [];
	}

	const documents: Array<DocumentData & { id: string }> = [];
	snapshot.forEach(doc => {
		documents.push({ id: doc.id, ...doc.data() });
	});

	console.log(`コレクション ${collection} の指定された日付のドキュメントを取得しました。`);
	return documents;
}

export async function deleteDocumentsCreatedBy(collection: string, day: string): Promise<void> {
	const collectionRef = firestore.collection(collection);
	const snapshot = await collectionRef.where('date', '==', day).get();
	const batch = firestore.batch();

	snapshot.forEach((doc) => {
		batch.delete(doc.ref);
	});

	await batch.commit();
	console.log(`コレクション ${collection} の指定された日付のドキュメントを削除しました。`);
} 