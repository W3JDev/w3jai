import { useState } from 'react';
import { resetPassword } from '../../services/supabase';

const ForgotPassword = ({ onLoginClick }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { error } = await resetPassword(email);
      
      if (error) {
        setError(error.message);
        return;
      }
      
      setSuccessMessage('Password reset instructions have been sent to your email.');
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Password reset error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-800/70 rounded-xl shadow-xl backdrop-blur-sm border border-gray-700/50">
      <h2 className="text-2xl font-bold text-white mb-6 text-center">Reset Password</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}
      
      {successMessage && (
        <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-200 text-sm">
          {successMessage}
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
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-3 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium transition-all duration-200 transform hover:translate-y-[-1px] hover:shadow-lg ${
            loading ? 'opacity-70 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Sending...' : 'Send Reset Instructions'}
        </button>
      </form>
      
      <div className="mt-6 text-center">
        <p className="text-gray-400 text-sm">
          Remember your password?{' '}
          <button
            onClick={onLoginClick}
            className="text-blue-400 hover:text-blue-300 transition-colors"
          >
            Back to Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
