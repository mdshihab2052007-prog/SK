import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy, 
  getDocFromServer,
  serverTimestamp
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { SavingEntry, Language } from '../types';

// Initialize Firebase App
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth & Provider
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Initialize Firestore with custom database ID
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Test connection on boot as specified in the Firebase integration skill
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or connecting...');
    }
  }
}
testConnection();

// Google Sign-in
export async function signInWithGoogle(): Promise<User | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Firebase Google Sign-In error:', error);
    throw error;
  }
}

// Sign-out
export async function signOutUser(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Firebase sign-out error:', error);
    throw error;
  }
}

// Sync user profile to Firestore
export async function syncUserProfile(user: User, lang: Language = 'bn'): Promise<void> {
  try {
    const userRef = doc(db, 'users', user.uid);
    await setDoc(
      userRef,
      {
        uid: user.uid,
        displayName: user.displayName || 'Saver',
        email: user.email || '',
        photoURL: user.photoURL || '',
        lastLoginAt: new Date().toISOString(),
        lang,
      },
      { merge: true }
    );
  } catch (error) {
    console.error('Error syncing user profile:', error);
  }
}

// Save entry to Firestore for user
export async function persistSavingEntry(userId: string, entry: SavingEntry): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'savings', entry.id);
    await setDoc(entryRef, {
      id: entry.id,
      userId,
      amount: entry.amount,
      silverGrams: entry.silverGrams,
      category: entry.category || 'general',
      note: entry.note || '',
      timestamp: entry.timestamp,
    });
  } catch (error) {
    console.error('Error persisting saving entry to Firestore:', error);
    throw error;
  }
}

// Delete entry from Firestore
export async function removeSavingEntry(userId: string, entryId: string): Promise<void> {
  try {
    const entryRef = doc(db, 'users', userId, 'savings', entryId);
    await deleteDoc(entryRef);
  } catch (error) {
    console.error('Error deleting saving entry from Firestore:', error);
    throw error;
  }
}

// Fetch all saving entries for authenticated user
export async function loadUserSavings(userId: string): Promise<SavingEntry[]> {
  try {
    const savingsRef = collection(db, 'users', userId, 'savings');
    const q = query(savingsRef, orderBy('timestamp', 'desc'));
    const snapshot = await getDocs(q);
    
    const entries: SavingEntry[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      entries.push({
        id: data.id || docSnap.id,
        amount: Number(data.amount) || 0,
        silverGrams: Number(data.silverGrams) || 0,
        category: data.category || 'general',
        note: data.note || '',
        timestamp: Number(data.timestamp) || Date.now(),
      });
    });

    return entries;
  } catch (error) {
    console.error('Error loading savings from Firestore:', error);
    return [];
  }
}
