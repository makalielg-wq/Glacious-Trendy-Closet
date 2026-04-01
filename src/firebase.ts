import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, getDocFromServer, Timestamp, serverTimestamp, runTransaction, deleteField } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';
import { Review } from './types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Auth Helpers
export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const logOut = () => signOut(auth);

// Error Handling
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string;
    email?: string | null;
    emailVerified?: boolean;
    isAnonymous?: boolean;
    tenantId?: string | null;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Connection Test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

export { 
  collection, doc, setDoc, getDoc, getDocs, onSnapshot, query, where, orderBy, limit, addDoc, updateDoc, deleteDoc, Timestamp, onAuthStateChanged, serverTimestamp, runTransaction, deleteField
};

// Review Functions
export const getProductReviews = (productId: string, callback: (reviews: Review[]) => void) => {
  const q = query(
    collection(db, 'reviews'),
    where('productId', '==', productId),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const reviews = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Review[];
    callback(reviews);
  }, (error) => {
    handleFirestoreError(error, OperationType.GET, 'reviews');
  });
};

export const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
  const reviewRef = doc(collection(db, 'reviews'));
  const productRef = doc(db, 'products', reviewData.productId);

  try {
    await runTransaction(db, async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      // Add the review
      transaction.set(reviewRef, {
        ...reviewData,
        id: reviewRef.id,
        createdAt: serverTimestamp()
      });

      if (productDoc.exists()) {
        const productData = productDoc.data();
        const currentRating = productData.rating || 0;
        const currentCount = productData.reviewsCount || 0;
        
        const newCount = currentCount + 1;
        const newRating = ((currentRating * currentCount) + reviewData.rating) / newCount;

        transaction.update(productRef, {
          rating: Number(newRating.toFixed(1)),
          reviewsCount: newCount
        });
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'reviews');
  }
};
export type { User };
