import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import * as supabaseService from '../../services/supabase';

// Mock the supabase service
vi.mock('../../services/supabase', () => ({
  signInWithEmail: vi.fn()
}));

describe('Login Component', () => {
  const mockOnSuccess = vi.fn();
  const mockOnRegisterClick = vi.fn();
  const mockOnForgotPasswordClick = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it('renders correctly', () => {
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Forgot password?')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });
  
  it('handles form input changes', () => {
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });
  
  it('calls signInWithEmail on form submission', async () => {
    supabaseService.signInWithEmail.mockResolvedValue({ 
      data: { user: { id: '123' } }, 
      error: null 
    });
    
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(supabaseService.signInWithEmail).toHaveBeenCalledWith(
        'test@example.com',
        'password123'
      );
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });
  
  it('displays error message when login fails', async () => {
    supabaseService.signInWithEmail.mockResolvedValue({ 
      data: null, 
      error: { message: 'Invalid login credentials' } 
    });
    
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    const submitButton = screen.getByRole('button', { name: 'Sign In' });
    
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText('Invalid login credentials')).toBeInTheDocument();
      expect(mockOnSuccess).not.toHaveBeenCalled();
    });
  });
  
  it('calls onRegisterClick when Sign Up is clicked', () => {
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    const registerLink = screen.getByText('Sign Up');
    fireEvent.click(registerLink);
    
    expect(mockOnRegisterClick).toHaveBeenCalled();
  });
  
  it('calls onForgotPasswordClick when Forgot password is clicked', () => {
    render(
      <Login 
        onSuccess={mockOnSuccess}
        onRegisterClick={mockOnRegisterClick}
        onForgotPasswordClick={mockOnForgotPasswordClick}
      />
    );
    
    const forgotPasswordLink = screen.getByText('Forgot password?');
    fireEvent.click(forgotPasswordLink);
    
    expect(mockOnForgotPasswordClick).toHaveBeenCalled();
  });
});
