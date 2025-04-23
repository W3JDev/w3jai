import { createContext, useContext, useState, useEffect } from 'react';
import supabase from '../services/supabase';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const useAdmin = () => useContext(AdminContext);

export const AdminProvider = ({ children }) => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authorizedUsers, setAuthorizedUsers] = useState([]);

  useEffect(() => {
    if (user) {
      checkAdminStatus();
      loadAuthorizedUsers();
    } else {
      setIsAdmin(false);
      setLoading(false);
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      setLoading(true);
      console.log('Checking admin status for user:', user?.id);
      
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error checking admin status:', error);
      }
      
      setIsAdmin(!!data);
      console.log('User admin status:', !!data);
    } catch (error) {
      console.error('Exception checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAuthorizedUsers = async () => {
    try {
      if (!user) return;
      
      // First check if the current user is an admin
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (!adminData) return;
      
      // If user is admin, load authorized users
      const { data, error } = await supabase
        .from('authorized_users')
        .select('*');
      
      if (error) {
        console.error('Error loading authorized users:', error);
        return;
      }
      
      setAuthorizedUsers(data || []);
    } catch (error) {
      console.error('Exception loading authorized users:', error);
    }
  };

  const addAuthorizedUser = async (email) => {
    try {
      if (!isAdmin) return { error: { message: 'Unauthorized' } };
      
      // First check if user exists
      const { data: userData, error: userError } = await supabase.auth.admin.getUserByEmail(email);
      
      if (userError) {
        return { error: { message: 'User not found' } };
      }
      
      // Add user to authorized_users table
      const { data, error } = await supabase
        .from('authorized_users')
        .upsert({
          email: email,
          added_by: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error adding authorized user:', error);
        return { error };
      }
      
      // Refresh the list
      await loadAuthorizedUsers();
      
      return { data };
    } catch (error) {
      console.error('Exception adding authorized user:', error);
      return { error };
    }
  };

  const removeAuthorizedUser = async (email) => {
    try {
      if (!isAdmin) return { error: { message: 'Unauthorized' } };
      
      const { error } = await supabase
        .from('authorized_users')
        .delete()
        .eq('email', email);
      
      if (error) {
        console.error('Error removing authorized user:', error);
        return { error };
      }
      
      // Refresh the list
      await loadAuthorizedUsers();
      
      return { success: true };
    } catch (error) {
      console.error('Exception removing authorized user:', error);
      return { error };
    }
  };

  const value = {
    isAdmin,
    loading,
    authorizedUsers,
    addAuthorizedUser,
    removeAuthorizedUser
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export default AdminContext;
