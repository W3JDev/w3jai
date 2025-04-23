import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserProfile from '../components/User/UserProfile';
import UserPreferences from '../components/User/UserPreferences';
import ApiKeyManager from '../components/User/ApiKeyManager';
import AccessibilitySettings from '../components/Accessibility/AccessibilitySettings';
import AnalyticsDashboard from '../components/Analytics/AnalyticsDashboard';
import { User, Settings, Key, LogOut, Eye, BarChart2 } from 'lucide-react';

const Dashboard = () => {
  const { user, profile, signOut, updateUserProfile, updateUserPreferences } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Please Sign In</h2>
          <p className="text-gray-400 mb-6">You need to be signed in to access the dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <div className="w-full md:w-64 bg-gray-800/70 rounded-xl shadow-lg backdrop-blur-sm border border-gray-700/50 p-4">
          <div className="mb-6 text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold mb-2">
              {profile?.full_name ? profile.full_name.charAt(0) : user.email.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-white font-semibold">{profile?.full_name || 'User'}</h2>
            <p className="text-gray-400 text-sm truncate">{user.email}</p>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'profile'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <User size={18} />
              <span>Profile</span>
            </button>

            <button
              onClick={() => setActiveTab('preferences')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'preferences'
                  ? 'bg-purple-600/20 text-purple-400 border border-purple-500/30'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Settings size={18} />
              <span>Preferences</span>
            </button>

            <button
              onClick={() => setActiveTab('apikeys')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'apikeys'
                  ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-500/30'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Key size={18} />
              <span>API Keys</span>
            </button>

            <button
              onClick={() => setActiveTab('accessibility')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'accessibility'
                  ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                  : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
              }`}
            >
              <Eye size={18} />
              <span>Accessibility</span>
            </button>

            {profile?.is_admin && (
              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'analytics'
                    ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                    : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                <BarChart2 size={18} />
                <span>Analytics</span>
              </button>
            )}

            <button
              onClick={signOut}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-red-600/20 hover:text-red-400 transition-colors mt-6"
            >
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1">
          {activeTab === 'profile' && (
            <UserProfile user={user} onUpdate={updateUserProfile} />
          )}

          {activeTab === 'preferences' && (
            <UserPreferences user={user} onUpdate={updateUserPreferences} />
          )}

          {activeTab === 'apikeys' && (
            <ApiKeyManager user={user} />
          )}

          {activeTab === 'accessibility' && (
            <AccessibilitySettings />
          )}

          {activeTab === 'analytics' && profile?.is_admin && (
            <AnalyticsDashboard />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
