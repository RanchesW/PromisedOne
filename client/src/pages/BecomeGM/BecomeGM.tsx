import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';

interface FormStep {
  id: string;
  title: string;
  completed: boolean;
}

const BecomeGM: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showApplication, setShowApplication] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<FormStep[]>([
    { id: 'personal', title: 'Personal Details', completed: false },
    { id: 'profile', title: 'Profile Image', completed: false },
    { id: 'experience', title: 'GM Experience', completed: false },
    { id: 'scenarios', title: 'Scenarios', completed: false },
    { id: 'terminology', title: 'KazRPG Terminology', completed: false },
    { id: 'terms', title: 'Terms and Conditions', completed: false },
  ]);
  const [formData, setFormData] = useState({
    // Personal Details
    name: '',
    birthdate: '',
    pronouns: '',
    country: '',
    city: '',
    zipcode: '',
    timezone: '',
    aboutYou: '',
    
    // Profile Image
    profileImage: null as File | null,
    
    // GM Experience
    yearsPlayingTTRPGs: '',
    yearsGMingTTRPGs: '',
    hasFivePlayers: '',
    ttrpgSystems: '',
    platforms: '',
    gmStyle: '',
    
    // Scenarios
    scenario1: '',
    scenario2: '',
    scenario3: '',
    
    // Terms
    agreeToTerms: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData(prev => ({ 
      ...prev, 
      profileImage: file 
    }));
  };

  const goToStep = (stepIndex: number) => {
    // Only allow going to completed steps or the next immediate step
    if (stepIndex <= currentStep || steps[stepIndex - 1]?.completed) {
      setCurrentStep(stepIndex);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const markStepCompleted = (stepIndex: number) => {
    setSteps(prev => prev.map((step, index) => 
      index === stepIndex ? { ...step, completed: true } : step
    ));
  };

  const validateStep = (stepIndex: number) => {
    const newErrors: Record<string, string> = {};

    switch (stepIndex) {
      case 0: // Personal Details
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.birthdate) {
          newErrors.birthdate = 'Birthdate is required';
        } else {
          const birthDate = new Date(formData.birthdate);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear() - 
            (today.getMonth() < birthDate.getMonth() || 
             (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate()) ? 1 : 0);
          
          if (age < 18) {
            newErrors.birthdate = 'You must be at least 18 years old to become a GM';
          }
          
          if (age > 100) {
            newErrors.birthdate = 'Please enter a valid birthdate';
          }
        }
        if (!formData.country.trim()) newErrors.country = 'Country is required';
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.timezone) newErrors.timezone = 'Timezone is required';
        if (!formData.aboutYou.trim()) newErrors.aboutYou = 'About you is required';
        break;
      case 1: // Profile Image
        if (!formData.profileImage) newErrors.profileImage = 'Profile image is required';
        break;
      case 2: // GM Experience
        if (!formData.yearsPlayingTTRPGs) newErrors.yearsPlayingTTRPGs = 'Years playing TTRPGs is required';
        if (!formData.yearsGMingTTRPGs) newErrors.yearsGMingTTRPGs = 'Years GMing TTRPGs is required';
        if (!formData.hasFivePlayers) newErrors.hasFivePlayers = 'This question is required';
        if (!formData.ttrpgSystems.trim()) newErrors.ttrpgSystems = 'TTRPG systems are required';
        if (!formData.platforms.trim()) newErrors.platforms = 'Platforms are required';
        if (!formData.gmStyle.trim()) newErrors.gmStyle = 'GM style is required';
        break;
      case 3: // Scenarios
        if (!formData.scenario1.trim()) newErrors.scenario1 = 'Scenario 1 answer is required';
        if (!formData.scenario2.trim()) newErrors.scenario2 = 'Scenario 2 answer is required';
        if (!formData.scenario3.trim()) newErrors.scenario3 = 'Scenario 3 answer is required';
        break;
      case 5: // Terms
        if (!formData.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        break;
    }

    if (stepIndex === currentStep) {
      setErrors(newErrors);
    }
    
    const isValid = Object.keys(newErrors).length === 0;
    
    if (isValid) {
      markStepCompleted(stepIndex);
    }
    
    return isValid;
  };

  const validateCurrentStep = () => {
    return validateStep(currentStep);
  };

  const handleNextStep = () => {
    if (validateCurrentStep()) {
      nextStep();
    }
  };

  const handleSubmit = async () => {
    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'You must agree to the terms and conditions' });
      return;
    }

    setIsSubmitting(true);

    // Validate all steps before submitting
    for (let step = 0; step < steps.length - 1; step++) {
      if (!validateStep(step)) {
        setIsSubmitting(false);
        setCurrentStep(step);
        alert(`Please complete all required fields in step: ${steps[step].title}`);
        return;
      }
    }

    try {
      // Format data to match the expected backend API structure
      const applicationData = {
        experience: `${formData.aboutYou}\n\nYears Playing TTRPGs: ${formData.yearsPlayingTTRPGs}\nYears GMing TTRPGs: ${formData.yearsGMingTTRPGs}\nHas 5 Players: ${formData.hasFivePlayers}\n\nGM Style: ${formData.gmStyle}\n\nPlatforms: ${formData.platforms}\n\nScenarios:\n1. ${formData.scenario1}\n2. ${formData.scenario2}\n3. ${formData.scenario3}`,
        preferredSystems: formData.ttrpgSystems.split(',').map(s => s.trim()).filter(Boolean),
        availability: `Timezone: ${formData.timezone}\nLocation: ${formData.city}, ${formData.country}`,
        sampleGameDescription: formData.gmStyle,
        references: `Name: ${formData.name}\nPronouns: ${formData.pronouns}\nBirthdate: ${formData.birthdate}`
      };

      const response = await apiService.users.submitDMApplication(applicationData);

      console.log('Application submitted successfully, navigating to confirmation page');
      navigate('/become-gm/confirmation');
    } catch (error) {
      console.error('Error submitting GM application:', error);
      alert('There was an error submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if user is already a GM
  if (user?.role === 'approved_gm') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">You're Already a Game Master!</h1>
            <p className="text-lg text-gray-600 mb-8">
              Congratulations! You're already an approved Game Master on KazRPG. You can create and manage games from your dashboard.
            </p>
            <button
              onClick={() => navigate('/create-game')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
            >
              Create Your First Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Landing page content
  if (!showApplication) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-white py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Become a</span>
                  <span className="block" style={{color: '#00334E'}}>Professional</span>
                  <span className="block">Dungeon Master</span>
                </h1>
                <p className="mt-6 text-base text-gray-500 sm:text-lg md:text-xl max-w-lg">
                  Join the largest professional GM service in the world.
                </p>
                <div className="mt-8">
                  <button
                    onClick={() => setShowApplication(true)}
                    className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white md:py-4 md:text-lg md:px-10 hover:opacity-90 transition-opacity"
                    style={{backgroundColor: '#0B7DB8'}}
                  >
                    Apply Now
                  </button>
                </div>
              </div>
              
              {/* Hero Image */}
              <div className="hidden lg:block ml-6">
                <img
                  className="w-[583px] h-[380px] object-cover"
                  src="/images/adventure-party.png"
                  alt="Fantasy adventure party around a table"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
              
              {/* Built-in Advertising & Discovery */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Built-in Advertising & Discovery</h3>
                </div>
                <p className="text-gray-600">
                  KazRPG is a discovery-first marketplace where players actively search for games like yours. You don't need to spend time or money on marketing. The platform helps new players find your audience without building a following from scratch.
                </p>
              </div>

              {/* Secure Payments with Stripe */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Secure Payments with Stripe</h3>
                </div>
                <p className="text-gray-600">
                  KazRPG handles all payments, so you don't have to chase invoices or navigate awkward money conversations. Your earnings are stored in your Stripe-connected account, and you can choose when to cash out—reliable, secure, and built to support your RPG.
                </p>
              </div>

              {/* Dedicated Trust & Safety */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Dedicated Trust & Safety</h3>
                </div>
                <p className="text-gray-600">
                  Our team works to ensure that every Game Master and player has a welcoming, safe, and fun experience running your game wrong, support is there to help resolve issues based on platform post track. Built-in safety and moderation features empower you to create a space that fits your style and standards.
                </p>
              </div>

              {/* Support & Resources */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Support & Resources</h3>
                </div>
                <p className="text-gray-600">
                  KazRPG gives you access to a growing library of resources designed to help you improve. Join onboarding calls, attend live webinars, explore articles and guides, and talk with top GMs. Whether you're refining your craft or learning how to grow your audience, you'll never feel alone.
                </p>
              </div>

              {/* Fraud Protection */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Fraud Protection</h3>
                </div>
                <p className="text-gray-600">
                  If a player ghosts on a Game Master, their payment habits are flagged so it doesn't happen to other GMs. KazRPG has your back. Reach out and report it so you can get paid for the session you ran.
                </p>
              </div>

              {/* Opportunities Beyond the Table */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Opportunities Beyond the Table</h3>
                </div>
                <p className="text-gray-600">
                  KazRPG opens doors to more than just game nights. Get invited to play corporate events, sponsored games, partnerships. Plus, GMs who are full-time or just starting out, build long-term credibility as a professional GM.
                </p>
              </div>

              {/* Join a Pro GM Community */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Join a Pro GM Community</h3>
                </div>
                <p className="text-gray-600">
                  You're not alone. Get support, advice, and inspiration from the active community of professional GMs. Share strategies, troubleshoot issues, and find camaraderie with like-minded GMs updated on the latest trends and player behavior.
                </p>
              </div>

              {/* Save Time on Admin */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Save Time on Admin</h3>
                </div>
                <p className="text-gray-600">
                  KazRPG handles the busywork, so you can focus on what you love. Built-in tools take care of scheduling, payment processing, and player reviews. Your system makes it easy to manage reminders, cancellations, and schedules—so you can spend less time coordinating and more time telling great stories.
                </p>
              </div>

              {/* Grow your Reputation */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <svg className="h-8 w-8 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg font-medium text-gray-900">Grow your Reputation</h3>
                </div>
                <p className="text-gray-600">
                  Every game you build builds your public profile. Collect reviews and testimonials from players. Whether you're full-time or just starting out, build long-term credibility as a professional GM.
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render individual step components
  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Personal Details</h2>
      
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
          Name
        </label>
        <p className="text-sm text-gray-500 mb-3">This name will be publicly listed on your GM Profile. Use your name or business' name.</p>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Name"
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.name ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="birthdate" className="block text-sm font-medium text-gray-700 mb-2">
          Birthdate
        </label>
        <p className="text-sm text-gray-500 mb-3">You must be at least 18 years old to GM on KazRPG. For more information, see our Terms of Service.</p>
        <input
          type="date"
          id="birthdate"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          min="1924-01-01"
          max={new Date(Date.now() - 18 * 365.25 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.birthdate ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.birthdate && <p className="mt-1 text-sm text-red-600">{errors.birthdate}</p>}
      </div>

      <div>
        <label htmlFor="pronouns" className="block text-sm font-medium text-gray-700 mb-2">
          Pronouns
        </label>
        <select
          id="pronouns"
          name="pronouns"
          value={formData.pronouns}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select pronouns</option>
          <option value="he/him">he/him</option>
          <option value="she/her">she/her</option>
          <option value="they/them">they/them</option>
          <option value="other">other</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.country ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            id="city"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.city ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="zipcode" className="block text-sm font-medium text-gray-700 mb-2">
          Zip code
        </label>
        <input
          type="text"
          id="zipcode"
          name="zipcode"
          value={formData.zipcode}
          onChange={handleChange}
          placeholder="Zip code"
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-2">
          Timezone
        </label>
        <select
          id="timezone"
          name="timezone"
          value={formData.timezone}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.timezone ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select your timezone</option>
          <option value="EST">Eastern Time (EST/EDT)</option>
          <option value="CST">Central Time (CST/CDT)</option>
          <option value="MST">Mountain Time (MST/MDT)</option>
          <option value="PST">Pacific Time (PST/PDT)</option>
          <option value="GMT">Greenwich Mean Time (GMT)</option>
          <option value="CET">Central European Time (CET)</option>
          <option value="JST">Japan Standard Time (JST)</option>
          <option value="AEST">Australian Eastern Time (AEST)</option>
        </select>
        {errors.timezone && <p className="mt-1 text-sm text-red-600">{errors.timezone}</p>}
      </div>

      <div>
        <label htmlFor="aboutYou" className="block text-sm font-medium text-gray-700 mb-2">
          About you
        </label>
        <p className="text-sm text-gray-500 mb-3">Share about who you are, your experience GM-ing, and your experience with tabletop games. This is a great chance for Players (and the KazRPG team) to learn more about you!</p>
        <textarea
          id="aboutYou"
          name="aboutYou"
          rows={4}
          value={formData.aboutYou}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.aboutYou ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.aboutYou && <p className="mt-1 text-sm text-red-600">{errors.aboutYou}</p>}
      </div>
    </div>
  );

  const renderProfileImage = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Image</h2>
      
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Guidelines</h3>
          <div className="text-sm text-gray-600 space-y-3">
            <p>Please use a clear, professional profile picture.</p>
            <p>If you are using a photo of yourself, you should be centered and upright in the image. You should be the only person in the photo, and the image should be high resolution.</p>
            <p>If you are using a brand logo or avatar, please make sure it is a legible, high resolution image.</p>
          </div>
        </div>

        {/* Remember section in gray container */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-sm font-medium text-gray-900 mb-2">Remember, this is the image you are using to represent your brand.</p>
          <p className="text-sm text-gray-600">This image displays across all of your consumer facing touchpoints on KazRPG.</p>
        </div>

        {/* Upload area */}
        <div>
          <div className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            errors.profileImage ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
          }`}>
            <div className="mx-auto w-12 h-12 text-gray-400 mb-4">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
              </svg>
            </div>
            
            {formData.profileImage ? (
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">File selected:</p>
                <p className="text-sm text-gray-600 mb-3">{formData.profileImage.name}</p>
                <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                  Change file
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              </div>
            ) : (
              <div>
                <label className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 cursor-pointer">
                  Click to upload
                  <input
                    type="file"
                    id="profileImage"
                    name="profileImage"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
                <p className="text-sm text-gray-500 mt-2">PNG or JPEG (max 2MB / 500x500px)</p>
              </div>
            )}
          </div>
          {errors.profileImage && <p className="mt-2 text-sm text-red-600">{errors.profileImage}</p>}
        </div>
      </div>
    </div>
  );

  const renderGMExperience = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">GM Experience</h2>
      
      <div>
        <label htmlFor="yearsPlayingTTRPGs" className="block text-sm font-medium text-gray-700 mb-2">
          How long have you been playing tabletop games?
        </label>
        <select
          id="yearsPlayingTTRPGs"
          name="yearsPlayingTTRPGs"
          value={formData.yearsPlayingTTRPGs}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.yearsPlayingTTRPGs ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select duration</option>
          <option value="less-than-1">Less than 1 year</option>
          <option value="1-2">1-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="more-than-10">More than 10 years</option>
        </select>
        {errors.yearsPlayingTTRPGs && <p className="mt-1 text-sm text-red-600">{errors.yearsPlayingTTRPGs}</p>}
      </div>

      <div>
        <label htmlFor="yearsGMingTTRPGs" className="block text-sm font-medium text-gray-700 mb-2">
          How long have you been GMing tabletop games?
        </label>
        <select
          id="yearsGMingTTRPGs"
          name="yearsGMingTTRPGs"
          value={formData.yearsGMingTTRPGs}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.yearsGMingTTRPGs ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select duration</option>
          <option value="less-than-1">Less than 1 year</option>
          <option value="1-2">1-2 years</option>
          <option value="3-5">3-5 years</option>
          <option value="5-10">5-10 years</option>
          <option value="more-than-10">More than 10 years</option>
        </select>
        {errors.yearsGMingTTRPGs && <p className="mt-1 text-sm text-red-600">{errors.yearsGMingTTRPGs}</p>}
      </div>

      <div>
        <label htmlFor="hasFivePlayers" className="block text-sm font-medium text-gray-700 mb-2">
          Do you have at least 5 past players who would vouch for you as a great Game Master?
        </label>
        <p className="text-sm text-gray-500 mb-3">Once your account is approved, you will need 5 reviews from past players in order to be listed on the Find Game Masters page.</p>
        <select
          id="hasFivePlayers"
          name="hasFivePlayers"
          value={formData.hasFivePlayers}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.hasFivePlayers ? 'border-red-300' : 'border-gray-300'
          }`}
        >
          <option value="">Select answer</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
          <option value="maybe">Maybe/Unsure</option>
        </select>
        {errors.hasFivePlayers && <p className="mt-1 text-sm text-red-600">{errors.hasFivePlayers}</p>}
      </div>

      <div>
        <label htmlFor="ttrpgSystems" className="block text-sm font-medium text-gray-700 mb-2">
          What TTRPG system(s) do you run?
        </label>
        <p className="text-sm text-gray-500 mb-3">What game systems do you like to run? You should be willing to run any systems you list for potential players.</p>
        <textarea
          id="ttrpgSystems"
          name="ttrpgSystems"
          rows={3}
          value={formData.ttrpgSystems}
          onChange={handleChange}
          placeholder="e.g., D&D 5e, Pathfinder 2e, Call of Cthulhu, etc."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.ttrpgSystems ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.ttrpgSystems && <p className="mt-1 text-sm text-red-600">{errors.ttrpgSystems}</p>}
      </div>

      <div>
        <label htmlFor="platforms" className="block text-sm font-medium text-gray-700 mb-2">
          What platforms are you proficient in?
        </label>
        <p className="text-sm text-gray-500 mb-3">Proficiency means you know enough about a platform to run a game with it and teach players how to use it. Platforms include your virtual tabletop (VTT), tool for video/voice, where you host character sheets, etc.</p>
        <textarea
          id="platforms"
          name="platforms"
          rows={3}
          value={formData.platforms}
          onChange={handleChange}
          placeholder="e.g., Roll20, Discord, D&D Beyond, Foundry VTT, etc."
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.platforms ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.platforms && <p className="mt-1 text-sm text-red-600">{errors.platforms}</p>}
      </div>

      <div>
        <label htmlFor="gmStyle" className="block text-sm font-medium text-gray-700 mb-2">
          GM Style
        </label>
        <p className="text-sm text-gray-500 mb-3">Tell potential players what kinds of things they can expect in your games! Do you love roleplay? Do you craft tactical, high-stakes combat? Every GM is different, so let players know what makes your GMing uniquely yours.</p>
        <textarea
          id="gmStyle"
          name="gmStyle"
          rows={4}
          value={formData.gmStyle}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.gmStyle ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.gmStyle && <p className="mt-1 text-sm text-red-600">{errors.gmStyle}</p>}
      </div>
    </div>
  );

  const renderScenarios = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Scenarios</h2>
      <p className="text-gray-600 mb-6">Answer these questions about scenarios you may encounter while GMing on KazRPG:</p>
      
      <div>
        <label htmlFor="scenario1" className="block text-sm font-medium text-gray-700 mb-2">
          Scenario 1
        </label>
        <p className="text-sm text-gray-500 mb-3">A player at your table is being disruptive and making other players uncomfortable. How would you handle this situation?</p>
        <textarea
          id="scenario1"
          name="scenario1"
          rows={4}
          value={formData.scenario1}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.scenario1 ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.scenario1 && <p className="mt-1 text-sm text-red-600">{errors.scenario1}</p>}
      </div>

      <div>
        <label htmlFor="scenario2" className="block text-sm font-medium text-gray-700 mb-2">
          Scenario 2
        </label>
        <p className="text-sm text-gray-500 mb-3">A player disagrees with you about how you interpreted the game's rules. How would you handle this situation?</p>
        <textarea
          id="scenario2"
          name="scenario2"
          rows={4}
          value={formData.scenario2}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.scenario2 ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.scenario2 && <p className="mt-1 text-sm text-red-600">{errors.scenario2}</p>}
      </div>

      <div>
        <label htmlFor="scenario3" className="block text-sm font-medium text-gray-700 mb-2">
          Scenario 3
        </label>
        <p className="text-sm text-gray-500 mb-3">A new player joins your table. After a few sessions, you determine they are not a good fit for your table based on their play style. How would you let them know you're removing them from the game?</p>
        <textarea
          id="scenario3"
          name="scenario3"
          rows={4}
          value={formData.scenario3}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            errors.scenario3 ? 'border-red-300' : 'border-gray-300'
          }`}
        />
        {errors.scenario3 && <p className="mt-1 text-sm text-red-600">{errors.scenario3}</p>}
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Terms and Conditions</h2>
      
      <div className="flex items-start">
        <input
          id="agreeToTerms"
          name="agreeToTerms"
          type="checkbox"
          checked={formData.agreeToTerms}
          onChange={handleChange}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
        />
        <label htmlFor="agreeToTerms" className="ml-3 block text-sm text-gray-700">
          I agree to the <span className="text-blue-600 hover:text-blue-800 cursor-pointer">KazRPG GM Terms and Conditions</span> and 
          <span className="text-blue-600 hover:text-blue-800 cursor-pointer"> Community Guidelines</span>. I understand that my application 
          will be reviewed and I may be contacted for additional information.
        </label>
      </div>
      {errors.agreeToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreeToTerms}</p>}
    </div>
  );


  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderPersonalDetails();
      case 1: return renderProfileImage();
      case 2: return renderGMExperience();
      case 3: return renderScenarios();
      case 4: return <div>KazRPG Terminology step coming soon...</div>;
      case 5: return renderTerms();
      default: return renderPersonalDetails();
    }
  };

  // Application form content
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        {(
          <div className="w-80 bg-white shadow-lg flex flex-col h-screen">
          <div className="flex-1 p-6">
            <div className="flex items-center mb-8">
              <button
                onClick={() => setShowApplication(false)}
                className="mr-3 p-1 rounded-full hover:bg-gray-100"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
              </button>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                </svg>
                <span className="text-xl font-bold text-gray-900">GM Application</span>
              </div>
            </div>

            {/* Step Navigation */}
            <nav className="space-y-2">
              {steps.map((step, index) => {
                const isAccessible = index <= currentStep || steps[index - 1]?.completed;
                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(index)}
                    disabled={!isAccessible}
                    className={`w-full flex items-center px-3 py-2 rounded-lg text-left transition-colors ${
                      index === currentStep
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : isAccessible
                        ? 'text-gray-600 hover:bg-gray-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                  >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 ${
                    step.completed
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }`}>
                    {step.completed ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"/>
                      </svg>
                    ) : (
                      <span className="text-xs font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className="text-sm font-medium">{step.title}</span>
                </button>
                );
              })}
            </nav>
          </div>

          {/* Action Buttons */}
          <div className="p-6 bg-white border-t border-gray-200">
            <div className="flex justify-between">
              {currentStep === steps.length - 1 ? (
                <>
                  <button
                    onClick={prevStep}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-400"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Continue
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="p-8 flex justify-center flex-1">
          <div className="w-full max-w-2xl">
            {renderCurrentStep()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeGM;
