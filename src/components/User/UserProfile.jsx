import { useState, useEffect } from 'react';
import userService from '../../services/userService';
import { updateProfile } from '../../services/supabase';
import { User, Mail, Save } from 'lucide-react';

const UserProfile = ({ user, onUpdate }) => {
  const [profile, setProfile] = useState({
    full_name: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    setLoading(true);
    try {
      const { data, error } = await userService.getUserProfile(user.id);
      if (error) throw error;
      
      setProfile({
        full_name: data?.full_name || user?.user_metadata?.full_name || '',
        avatar_url: data?.avatar_url || ''
      });
    } catch (err) {
      console.error('Error loading user profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Update auth metadata
      const { error: authError } = await updateProfile({
        full_name: profile.full_name
      });
      
      if (authError) throw authError;
      
      // Update profile in database
      const { error: dbError } = await userService.upsertProfile(user.id, {
        full_name: profile.full_name,
        avatar_url: profile.avatar_url
      });
      
      if (dbError) throw dbError;
      
      setSuccess('Profile updated successfully');
      
      if (onUpdate) {
        onUpdate(profile);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-12 bg-gray-700/50 rounded"></div>
          <div className="h-12 bg-gray-700/50 rounded"></div>
          <div className="h-10 bg-gray-700/50 rounded w-1/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-400" />
        Profile Settings
      </h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
          {success}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-gray-400 mr-2" />
            <input
              type="email"
              id="email"
              value={user?.email || ''}
              disabled
              className="w-full p-3 rounded-lg bg-gray-700/50 text-gray-300 border border-gray-600/50 focus:outline-none"
            />
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Email cannot be changed
          </p>
        </div>
        
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            value={profile.full_name}
            onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-200"
            placeholder="Enter your full name"
          />
        </div>
        
        <button
          type="submit"
          disabled={saving}
          className={`px-4 py-2 rounded-lg bg-blue-600 text-white font-medium transition-all duration-200 flex items-center gap-2 ${
            saving ? 'opacity-70 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
