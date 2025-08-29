import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRouteTransition } from '../../hooks/useRouteTransition';
import { useNotification } from '../../contexts/NotificationContext';

const VerifyEmailPage: React.FC = () => {
  const { verifyEmail, resendVerification } = useAuth();
  const { navigateWithTransition } = useRouteTransition();
  const navigate = useNavigate();
  const location = useLocation();
  const { showNotification } = useNotification();
  
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes in seconds

  // Get email and token from location state (passed from registration)
  const email = location.state?.email || '';
  const verificationToken = location.state?.verificationToken || '';

  // Redirect if no email or token
  useEffect(() => {
    if (!email || !verificationToken) {
      navigate('/register');
    }
  }, [email, verificationToken, navigate]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Please enter a valid 6-character verification code');
      return;
    }

    setIsLoading(true);
    
    try {
      await verifyEmail(verificationToken, verificationCode);
      setSuccess('Email verified successfully! Redirecting...');
      
      // Redirect to games page after successful verification
      setTimeout(() => {
        navigateWithTransition('/games', '🎲 Welcome to KazRPG! Your adventure begins...', 2500);
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setSuccess('');
    setIsResending(true);
    
    try {
      await resendVerification(email);
      setSuccess('New verification code sent to your email!');
      setTimeLeft(15 * 60); // Reset timer
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification code');
    } finally {
      setIsResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^A-Z0-9]/gi, '').toUpperCase(); // Only letters and numbers, convert to uppercase
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  if (!email || !verificationToken) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <svg className="h-10 w-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-3xl font-fantasy font-bold text-slate-900">
            Verify Your Email
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We've sent a 6-character verification code to
          </p>
          <p className="font-medium text-slate-900">{email}</p>
        </div>

        <div className="bg-white shadow-xl rounded-lg border border-slate-200 p-8">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700">
              {success}
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-slate-700 mb-2">
                Verification Code
              </label>
              <input
                id="verificationCode"
                name="verificationCode"
                type="text"
                required
                value={verificationCode}
                onChange={handleCodeChange}
                className="input-field text-center text-2xl font-mono tracking-widest"
                placeholder="X4AA0Z"
                maxLength={6}
                autoComplete="one-time-code"
              />
              <p className="mt-2 text-xs text-slate-500 text-center">
                Enter the 6-character code from your email
              </p>
              
              {timeLeft > 0 && (
                <p className="mt-1 text-xs text-orange-600 text-center">
                  Code expires in: {formatTime(timeLeft)}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading || verificationCode.length !== 6}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Verifying...' : 'Verify Email'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600 mb-3">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResendCode}
              disabled={isResending || timeLeft > 13 * 60} // Allow resend after 2 minutes
              className="text-blue-600 hover:text-blue-500 font-medium text-sm disabled:text-slate-400 disabled:cursor-not-allowed"
            >
              {isResending ? 'Sending...' : 'Resend Code'}
            </button>
            
            {timeLeft > 13 * 60 && (
              <p className="text-xs text-slate-500 mt-1">
                You can request a new code in {formatTime(timeLeft - 13 * 60)}
              </p>
            )}
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Need help?</span>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link
                to="/register"
                className="text-blue-600 hover:text-blue-500 text-sm"
              >
                ← Back to Registration
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage;