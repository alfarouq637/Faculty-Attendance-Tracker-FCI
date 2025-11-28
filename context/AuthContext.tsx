import React, { createContext, useContext, useEffect, useState } from 'react';
import firebase from 'firebase/compat/app';
import { auth, db, googleProvider } from '../services/firebase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: firebase.User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  promoteToSuperAdmin: (secret: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<firebase.User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (uid: string) => {
    try {
      const docRef = db.collection('users').doc(uid);
      const docSnap = await docRef.get();
      
      let currentProfile: UserProfile;

      if (docSnap.exists) {
        currentProfile = docSnap.data() as UserProfile;
      } else {
        // Create default student profile on first login
        currentProfile = {
          uid,
          email: auth.currentUser?.email || '',
          displayName: auth.currentUser?.displayName || 'User',
          role: 'student',
          courses: []
        };
        await docRef.set(currentProfile);
      }

      // CHECK FOR PENDING SUPER ADMIN PROMOTION
      const pendingAdmin = localStorage.getItem('FCI_PENDING_SUPER_ADMIN');
      if (pendingAdmin === 'true') {
        currentProfile.role = 'super_admin';
        await docRef.set({ role: 'super_admin' }, { merge: true });
        localStorage.removeItem('FCI_PENDING_SUPER_ADMIN'); // Clear flag
        console.log("User promoted to Super Admin via recovery key.");
      }

      setProfile(currentProfile);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.uid);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await auth.signInWithPopup(googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = async () => {
    await auth.signOut();
  };

  const promoteToSuperAdmin = async (secret: string): Promise<boolean> => {
    const cleanSecret = secret.trim();
    
    // Hardcoded check for the secret key
    if (cleanSecret === "ALFAPRO1000") {
      if (user) {
        // If logged in, update immediately
        try {
          const docRef = db.collection('users').doc(user.uid);
          await docRef.set({ role: 'super_admin' }, { merge: true });
          if (profile) setProfile({ ...profile, role: 'super_admin' });
          return true;
        } catch (e) {
          console.error("Error promoting user", e);
          return false;
        }
      } else {
        // If NOT logged in, save intent to localStorage
        localStorage.setItem('FCI_PENDING_SUPER_ADMIN', 'true');
        return true;
      }
    }
    return false;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, promoteToSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};