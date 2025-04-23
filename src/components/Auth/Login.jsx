import { useState } from 'react';
import { signInWithEmail } from '../../services/supabase';

const Login = ({ onSuccess, onRegisterClick, onForgotPasswordClick }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('Attempting to sign in with:', { email });
      const { data, error } = await signInWithEmail(email, password);

      console.log('Sign in response:', { data, error });

      if (error) {
        console.error('Sign in error:', error);
        setError(error.message || 'Invalid login credentials');
        setLoading(false);
        return;
      }

      if (data?.user) {
        console.log('Sign in successful, user:', data.user);
        if (onSuccess) {
          onSuccess(data);
        }
      } else {
        console.error('No user data returned from sign in');
        setError('Failed to retrieve user data. Please try again.');
      }
    } catch (err) {
      console.error('Unexpected login error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800/70 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Sign In</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-200"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <button
              type="button"
              onClick={onForgotPasswordClick}
              className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full p-3 rounded-lg bg-gray-700/90 text-white border border-gray-600/50 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 focus:outline-none transition-all duration-200"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-lg ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Don't have an account?{' '}
          <button
            onClick={onRegisterClick}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default Login;
