import React from 'react';

const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-fantasy font-bold text-white">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-slate-400">
            Enter your email and we'll send you a reset link
          </p>
        </div>
        <div className="card p-8">
          <form className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="input-field"
                placeholder="Enter your email"
              />
            </div>

            <div>
              <button
                type="submit"
                className="btn-primary w-full"
              >
                Send reset link
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a
              href="/login"
              className="text-orange-400 hover:text-orange-300 text-sm"
            >
              Back to sign in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
