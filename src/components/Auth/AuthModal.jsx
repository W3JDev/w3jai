import { useState } from 'react';
import Login from './Login';
import Register from './Register';
import ForgotPassword from './ForgotPassword';

const AuthModal = ({ isOpen, onClose, onAuthSuccess }) => {
  const [view, setView] = useState('login'); // login, register, forgotPassword

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md">
        <div className="relative">
          <button
            onClick={onClose}
            className="absolute -top-12 right-0 text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          {view === 'login' && (
            <Login
              onSuccess={onAuthSuccess}
              onRegisterClick={() => setView('register')}
              onForgotPasswordClick={() => setView('forgotPassword')}
            />
          )}
          
          {view === 'register' && (
            <Register
              onSuccess={onAuthSuccess}
              onLoginClick={() => setView('login')}
            />
          )}
          
          {view === 'forgotPassword' && (
            <ForgotPassword
              onLoginClick={() => setView('login')}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
