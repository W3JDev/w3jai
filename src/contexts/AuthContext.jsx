import { createContext, useContext, useState, useEffect } from 'react';
import supabase, { getCurrentUser } from '../services/supabase';
import userService from '../services/userService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    // Check for current session
    checkUser();

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', { event, session });

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          console.log('User signed in or token refreshed:', session?.user);
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserData(session.user);
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out');
          setUser(null);
          setProfile(null);
          setPreferences(null);
        } else if (event === 'USER_UPDATED') {
          console.log('User updated:', session?.user);
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserData(session.user);
          }
        }
      }
    );

    return () => {
      console.log('Cleaning up auth listener');
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    try {
      setLoading(true);
      console.log('Checking current user...');
      const currentUser = await getCurrentUser();
      console.log('Current user:', currentUser);
      setUser(currentUser);

      if (currentUser) {
        console.log('Loading user data for:', currentUser.id);
        await loadUserData(currentUser);
      } else {
        console.log('No current user found');
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserData = async (user) => {
    try {
      // Load user profile
      console.log('Loading profile for user:', user.id);
      const { data: profileData, error: profileError } = await userService.getUserProfile(user.id);

      if (profileError) {
        console.error('Error loading user profile:', profileError);
      } else {
        console.log('User profile loaded:', profileData);
        setProfile(profileData);
      }

      // Load user preferences
      console.log('Loading preferences for user:', user.id);
      const { data: preferencesData, error: preferencesError } = await userService.getUserPreferences(user.id);

      if (preferencesError) {
        console.error('Error loading user preferences:', preferencesError);
      } else {
        console.log('User preferences loaded:', preferencesData);
        setPreferences(preferencesData?.preferences || null);
      }
    } catch (error) {
      console.error('Exception loading user data:', error);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setProfile(null);
      setPreferences(null);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const openAuthModal = () => {
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const updateUserProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const updateUserPreferences = (newPreferences) => {
    setPreferences(newPreferences);
  };

  const value = {
    user,
    profile,
    preferences,
    loading,
    authModalOpen,
    openAuthModal,
    closeAuthModal,
    signOut,
    updateUserProfile,
    updateUserPreferences
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
