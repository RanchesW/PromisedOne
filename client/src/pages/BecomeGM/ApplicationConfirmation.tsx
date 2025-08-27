import React from 'react';
import { useNavigate } from 'react-router-dom';

const ApplicationConfirmation: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center space-y-8">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl font-bold text-gray-900">Application Submitted Successfully!</h1>
              <p className="text-xl text-gray-600">
                Thank you for your interest in becoming a Game Master on KazRPG.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left space-y-4">
              <h2 className="text-lg font-semibold text-blue-900">What happens next?</h2>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-medium text-blue-900">Application Review</p>
                    <p className="text-blue-700 text-sm">Our team will carefully review your application within 3-5 business days. We'll evaluate your experience, GM style, and scenario responses.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-medium text-blue-900">Interview Process</p>
                    <p className="text-blue-700 text-sm">If your application is promising, we may reach out for a brief interview or ask for additional information about your GMing experience.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-medium text-blue-900">Welcome to the Team</p>
                    <p className="text-blue-700 text-sm">Once approved, you'll receive access to GM tools, guidelines, and can start creating and hosting games immediately!</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>Important:</strong> We receive many applications and review each one carefully. Please be patient during the review process. 
                  We'll contact you via email with updates on your application status.
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-gray-600">Questions about your application?</p>
                <p className="text-sm text-gray-500">
                  Contact our support team at <span className="text-blue-600 font-medium">support@kazrpg.com</span> or join our Discord community for updates.
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/')}
                  className="px-8 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
                >
                  Return to Home Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationConfirmation;