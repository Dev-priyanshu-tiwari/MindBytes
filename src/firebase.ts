import { initializeApp } from 'firebase/app';
import { doc, getDoc, getFirestore, setDoc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { EncryptedDataset } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');

const ACTIVE_RESULTS_DOC = 'active_results';
const QUIZ_COLLECTION = 'quiz_data';

/**
 * Fetches the shared active dataset from Firestore cloud database.
 * Every device opening the Vercel live link reads from this same document!
 */
export async function fetchActiveDatasetFromCloud(): Promise<EncryptedDataset | null> {
  try {
    const docRef = doc(db, QUIZ_COLLECTION, ACTIVE_RESULTS_DOC);
    const snap = await getDoc(docRef);

    if (snap.exists()) {
      const data = snap.data();
      if (data && data.v === 1 && Array.isArray(data.records)) {
        return {
          v: data.v,
          salt: data.salt,
          iter: data.iter,
          meta: data.meta,
          records: data.records,
        };
      }
    }
    return null;
  } catch (error) {
    console.warn('Could not fetch dataset from cloud Firestore, falling back to local/file:', error);
    return null;
  }
}

/**
 * Saves the active dataset to Firestore cloud database.
 * When an admin uploads an Excel sheet from any device, it is updated
 * in Firestore and immediately available to all devices visiting the Vercel link!
 */
export async function saveActiveDatasetToCloud(dataset: EncryptedDataset): Promise<boolean> {
  try {
    const docRef = doc(db, QUIZ_COLLECTION, ACTIVE_RESULTS_DOC);
    await setDoc(docRef, {
      v: dataset.v,
      salt: dataset.salt,
      iter: dataset.iter,
      meta: dataset.meta,
      records: dataset.records,
      updatedAt: new Date().toISOString(),
    });
    return true;
  } catch (error) {
    console.error('Failed to save dataset to Firestore:', error);
    return false;
  }
}
