import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, collection, doc, setDoc, deleteDoc, onSnapshot, query, where, auth, serverTimestamp } from './firebase';

interface WishlistContextType {
  wishlist: string[]; // Array of product IDs
  toggleWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribe = () => {};

    const setupListener = () => {
      if (!auth.currentUser) {
        setWishlist([]);
        setLoading(false);
        return;
      }

      const q = query(
        collection(db, 'wishlists'),
        where('userId', '==', auth.currentUser.uid)
      );

      unsubscribe = onSnapshot(q, (snapshot) => {
        const productIds = snapshot.docs.map(doc => doc.data().productId);
        setWishlist(productIds);
        setLoading(false);
      }, (error) => {
        console.error("Wishlist listener error:", error);
        setLoading(false);
      });
    };

    const authUnsubscribe = auth.onAuthStateChanged(() => {
      unsubscribe();
      setupListener();
    });

    return () => {
      unsubscribe();
      authUnsubscribe();
    };
  }, []);

  const toggleWishlist = async (productId: string) => {
    if (!auth.currentUser) {
      // Could prompt for login here, but for now just return
      return;
    }

    const userId = auth.currentUser.uid;
    const wishlistId = `${userId}_${productId}`;
    const docRef = doc(db, 'wishlists', wishlistId);

    if (wishlist.includes(productId)) {
      try {
        await deleteDoc(docRef);
      } catch (error) {
        console.error("Error removing from wishlist:", error);
      }
    } else {
      try {
        await setDoc(docRef, {
          userId,
          productId,
          createdAt: serverTimestamp()
        });
      } catch (error) {
        console.error("Error adding to wishlist:", error);
      }
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist, loading }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
