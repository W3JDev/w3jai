import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase URL or Anon Key. Please check your environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export default supabase;

/**
 * Get the current authenticated user
 * @returns {Promise<Object|null>} The user object or null if not authenticated
 */
export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Result of the sign in operation
 */
export const signInWithEmail = async (email, password) => {
  try {
    console.log('Supabase signInWithPassword called with:', { email });
    console.log('Supabase URL:', supabaseUrl);
    console.log('Supabase Anon Key exists:', !!supabaseAnonKey);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      console.error('Supabase auth error:', error);
      return { data: null, error };
    }

    console.log('Supabase auth success:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception during sign in:', error);
    return {
      data: null,
      error: {
        message: error.message || 'An unexpected error occurred during sign in'
      }
    };
  }
};

/**
 * Sign up with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @param {Object} metadata - Additional user metadata
 * @returns {Promise<Object>} Result of the sign up operation
 */
export const signUpWithEmail = async (email, password, metadata = {}) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error signing up:', error);
    return { data: null, error };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} Result of the sign out operation
 */
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error signing out:', error);
    return { error };
  }
};

/**
 * Update user profile
 * @param {Object} profile - Profile data to update
 * @returns {Promise<Object>} Result of the update operation
 */
export const updateProfile = async (profile) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      data: profile
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating profile:', error);
    return { data: null, error };
  }
};

/**
 * Reset password
 * @param {string} email - User's email
 * @returns {Promise<Object>} Result of the reset password operation
 */
export const resetPassword = async (email) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error resetting password:', error);
    return { data: null, error };
  }
};
