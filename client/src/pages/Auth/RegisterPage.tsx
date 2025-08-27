import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, UserRole, ExperienceLevel } from '../../contexts/AuthContext';
import { useRouteTransition } from '../../hooks/useRouteTransition';

interface FormData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  timezone: string;
  terms: boolean;
}

const RegisterPage: React.FC = () => {
  const { register } = useAuth();
  const { navigateWithTransition } = useRouteTransition();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    timezone: '',
    terms: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Client-side validation
    if (!formData.firstName || !formData.lastName || !formData.username || 
        !formData.email || !formData.password || !formData.timezone) {
      setError('Please fill in all required fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (formData.username.length < 3) {
      setError('Username must be at least 3 characters long');
      return;
    }
    
    if (!formData.terms) {
      setError('You must agree to the Terms of Service and Privacy Policy');
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        email: formData.email,
        password: formData.password,
        timezone: formData.timezone,
        role: UserRole.PLAYER,
        experienceLevel: ExperienceLevel.BEGINNER,
        preferredSystems: [],
      });
      
      // Registration successful, redirect to dashboard
      navigateWithTransition('/dashboard', '🎲 Welcome to the realm! Your adventure begins now...', 2500);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-fantasy font-bold text-slate-900">
            JOIN THE ADVENTURE
          </h2>
          <p className="mt-2 text-center text-sm text-slate-600">
            Create your account and start your TRPG journey
          </p>
        </div>
        <div className="bg-white shadow-xl rounded-lg border border-slate-200 p-8">
          {error && (
            <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                  First Name
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="First name"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                  Last Name
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Choose a username"
                minLength={3}
                maxLength={30}
              />
              <p className="mt-1 text-xs text-slate-500">
                Username must be 3-30 characters long
              </p>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="input-field"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="input-field"
                placeholder="Create a strong password"
                minLength={6}
              />
              <p className="mt-1 text-xs text-slate-500">
                Password must be at least 6 characters long
              </p>
            </div>

            <div>
              <label htmlFor="timezone" className="block text-sm font-medium text-slate-700 mb-2">
                Timezone
              </label>
              <select
                id="timezone"
                name="timezone"
                required
                value={formData.timezone}
                onChange={handleInputChange}
                className="input-field"
              >
                <option value="">Select your timezone</option>
                <option value="America/New_York">Eastern Time (ET)</option>
                <option value="America/Chicago">Central Time (CT)</option>
                <option value="America/Denver">Mountain Time (MT)</option>
                <option value="America/Los_Angeles">Pacific Time (PT)</option>
                <option value="Europe/London">GMT</option>
                <option value="Europe/Paris">Central European Time</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                checked={formData.terms}
                onChange={handleInputChange}
                className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-slate-600">
                I agree to the{' '}
                <a href="/terms" className="text-blue-600 hover:text-blue-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="/privacy" className="text-blue-600 hover:text-blue-500">
                  Privacy Policy
                </a>
              </label>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Already have an account?</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                to="/login"
                className="btn-outline w-full"
              >
                Sign in instead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
