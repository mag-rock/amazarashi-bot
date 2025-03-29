import { createNotFoundError, tryCatchRethrow } from '@/utils/errorHandler';
import { info } from '@/utils/logger';
import { DocumentData } from '@google-cloud/firestore';
import firestore from './firestore';

/**
 * Firestoreにドキュメントを作成する
 * @param collection コレクション名
 * @param docId ドキュメントID
 * @param data ドキュメントデータ
 */
export async function createDocument(
  collection: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  return tryCatchRethrow(async () => {
    const docRef = firestore.collection(collection).doc(docId);
    await docRef.set(data);
    info(`ドキュメントを作成しました`, { collection, docId });
  }, `ドキュメント作成中にエラーが発生しました: ${collection}/${docId}`);
}

/**
 * Firestoreからドキュメントを読み取る
 * @param collection コレクション名
 * @param docId ドキュメントID
 * @returns ドキュメントデータまたはnull（存在しない場合）
 */
export async function readDocument(
  collection: string,
  docId: string
): Promise<DocumentData | null> {
  return tryCatchRethrow(async () => {
    const docRef = firestore.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      info(`ドキュメントが見つかりませんでした`, { collection, docId });
      return null;
    }

    info(`ドキュメントを取得しました`, { collection, docId });
    return doc.data() || null;
  }, `ドキュメント読み取り中にエラーが発生しました: ${collection}/${docId}`);
}

/**
 * Firestoreのドキュメントを更新する
 * @param collection コレクション名
 * @param docId ドキュメントID
 * @param data 更新データ
 */
export async function updateDocument(
  collection: string,
  docId: string,
  data: Record<string, any>
): Promise<void> {
  return tryCatchRethrow(async () => {
    const docRef = firestore.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw createNotFoundError(`ドキュメントが存在しません: ${collection}/${docId}`);
    }

    await docRef.update(data);
    info(`ドキュメントを更新しました`, { collection, docId });
  }, `ドキュメント更新中にエラーが発生しました: ${collection}/${docId}`);
}

/**
 * Firestoreからドキュメントを削除する
 * @param collection コレクション名
 * @param docId ドキュメントID
 */
export async function deleteDocument(collection: string, docId: string): Promise<void> {
  return tryCatchRethrow(async () => {
    const docRef = firestore.collection(collection).doc(docId);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw createNotFoundError(`ドキュメントが存在しません: ${collection}/${docId}`);
    }

    await docRef.delete();
    info(`ドキュメントを削除しました`, { collection, docId });
  }, `ドキュメント削除中にエラーが発生しました: ${collection}/${docId}`);
}

/**
 * コレクション内の全ドキュメントを取得する
 * @param collection コレクション名
 * @returns ドキュメントの配列
 */
export async function getAllDocuments(
  collection: string
): Promise<Array<DocumentData & { id: string }>> {
  return tryCatchRethrow(async () => {
    const collectionRef = firestore.collection(collection);
    const snapshot = await collectionRef.get();

    if (snapshot.empty) {
      info(`コレクションにドキュメントが存在しません`, { collection });
      return [];
    }

    const documents: Array<DocumentData & { id: string }> = [];
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    info(`コレクションの全ドキュメントを取得しました`, { collection, count: documents.length });
    return documents;
  }, `コレクションの全ドキュメント取得中にエラーが発生しました: ${collection}`);
}

/**
 * 指定された日付で作成されたドキュメントを取得する
 * @param collection コレクション名
 * @param day 日付文字列
 * @returns ドキュメントの配列
 */
export async function getDocumentsCreatedBy(
  collection: string,
  day: string
): Promise<Array<DocumentData & { id: string }>> {
  return tryCatchRethrow(async () => {
    const collectionRef = firestore.collection(collection);
    const snapshot = await collectionRef.where('date', '==', day).get();

    if (snapshot.empty) {
      info(`指定された日付のドキュメントが存在しません`, { collection, day });
      return [];
    }

    const documents: Array<DocumentData & { id: string }> = [];
    snapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() });
    });

    info(`指定された日付のドキュメントを取得しました`, {
      collection,
      day,
      count: documents.length,
    });
    return documents;
  }, `指定された日付のドキュメント取得中にエラーが発生しました: ${collection}/${day}`);
}

/**
 * 指定された日付で作成されたドキュメントを削除する
 * @param collection コレクション名
 * @param day 日付文字列
 */
export async function deleteDocumentsCreatedBy(collection: string, day: string): Promise<void> {
  return tryCatchRethrow(async () => {
    const collectionRef = firestore.collection(collection);
    const snapshot = await collectionRef.where('date', '==', day).get();

    if (snapshot.empty) {
      info(`指定された日付のドキュメントが存在しません`, { collection, day });
      return;
    }

    const batch = firestore.batch();
    let count = 0;

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
      count++;
    });

    await batch.commit();
    info(`指定された日付のドキュメントを削除しました`, { collection, day, count });
  }, `指定された日付のドキュメント削除中にエラーが発生しました: ${collection}/${day}`);
}
