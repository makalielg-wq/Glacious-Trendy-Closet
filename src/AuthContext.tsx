import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, signInWithGoogle, logOut, onAuthStateChanged, db, doc, getDoc, setDoc, updateDoc, User } from './firebase';
import { UserProfile } from './types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create profile
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        const isAdminEmail = currentUser.email === 'makalielg@gmail.com';
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserProfile;
          // If it's the admin email but role is not admin, update it
          if (isAdminEmail && data.role !== 'admin') {
            const updatedProfile = { ...data, role: 'admin' as const };
            await updateDoc(userDocRef, { role: 'admin' });
            setProfile(updatedProfile);
          } else {
            setProfile(data);
          }
        } else {
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Trendy User',
            photoURL: currentUser.photoURL || '',
            role: isAdminEmail ? 'admin' : 'user'
          };
          await setDoc(userDocRef, newProfile);
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  const signOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
