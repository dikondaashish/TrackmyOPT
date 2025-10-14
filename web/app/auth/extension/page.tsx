'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { mmddyyyyToISO } from '@/lib/date';

type Mode = 'signin' | 'signup';

export default function ExtensionAuthPage() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Sign In/Up Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Sign Up OPT Fields
  const [programEnd, setProgramEnd] = useState('');
  const [dsoReco, setDsoReco] = useState('');
  const [optEadEnd, setOptEadEnd] = useState('');
  const [optStart, setOptStart] = useState('');
  const [stemStart, setStemStart] = useState('');
  const [isStem, setIsStem] = useState(false);

  // Date validation
  const [dateErrors, setDateErrors] = useState<Record<string, string>>({});
  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;

  const formatDateInput = (value: string): string => {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8);
  };

  const validateDate = (val: string, field: string, required = false) => {
    if (!val && !required) {
      setDateErrors((prev) => ({ ...prev, [field]: '' }));
      return true;
    }
    if (!val && required) {
      setDateErrors((prev) => ({ ...prev, [field]: 'Required' }));
      return false;
    }
    if (!dateRegex.test(val)) {
      setDateErrors((prev) => ({ ...prev, [field]: 'Use MM/DD/YYYY' }));
      return false;
    }
    setDateErrors((prev) => ({ ...prev, [field]: '' }));
    return true;
  };

  // Auto-scroll images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  if (!redirectUri || !state) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Login Link</h1>
            <p className="text-gray-600 mb-4">
              This authentication page must be accessed from the TrackMyOPT extension.
            </p>
            <p className="text-sm text-gray-500">
              Missing required parameters: redirect_uri or state
            </p>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/extension/callback?redirect_uri=${encodeURIComponent(redirectUri)}&state=${encodeURIComponent(state)}`;
      
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: callbackUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
          skipBrowserRedirect: false,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const res = await fetch('/api/manual/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      
      if (!data.ok || !data.token) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Show success message briefly, then redirect
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
      successMessage.innerHTML = `
        <div class="text-center p-8">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Signed In!</h2>
          <p class="text-gray-600 mb-4">Redirecting to extension...</p>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        window.location.href = `${redirectUri}#id_token=${encodeURIComponent(data.token)}&state=${encodeURIComponent(state)}`;
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const v1 = validateDate(programEnd, 'programEnd', true);
    const v2 = validateDate(dsoReco, 'dsoReco', false);
    const v3 = validateDate(optEadEnd, 'optEadEnd', true);
    const v4 = validateDate(optStart, 'optStart', true);
    const v5 = validateDate(stemStart, 'stemStart', false);

    if (!v1 || !v3 || !v4) {
      setError('Please fix date errors above');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/manual/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          programEnd,
          dsoReco,
          optEadEnd,
          optStart,
          stemStart,
          isStem,
        }),
      });
      const data = await res.json();
      
      if (!data.ok || !data.token) {
        throw new Error(data.error || 'Signup failed');
      }
      
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed inset-0 bg-white flex items-center justify-center z-50';
      successMessage.innerHTML = `
        <div class="text-center p-8">
          <div class="text-6xl mb-4">✅</div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Account Created!</h2>
          <p class="text-gray-600 mb-4">Signing you in to the extension...</p>
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      `;
      document.body.appendChild(successMessage);
      
      setTimeout(() => {
        window.location.href = `${redirectUri}#id_token=${encodeURIComponent(data.token)}&state=${encodeURIComponent(state)}`;
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
      setLoading(false);
    }
  };

  const images = [
    {
      title: 'Track Your OPT Timeline',
      description: 'Never miss a deadline with real-time countdown and alerts',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Calculate Filing Windows',
      description: 'Know exactly when to apply for OPT and STEM extension',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      title: 'Stay Compliant',
      description: 'Automatic reminders for unemployment days and deadlines',
      gradient: 'from-orange-500 to-red-500'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Images Carousel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden p-16">
        {/* Sliding Image Cards */}
        <div className="flex-1 flex items-center justify-center relative">
          {images.map((img, index) => (
            <div
              key={index}
              className={`absolute w-full max-w-lg transition-all duration-1000 ${
                index === currentImageIndex
                  ? 'opacity-100 transform translate-x-0 scale-100'
                  : index < currentImageIndex
                  ? 'opacity-0 transform -translate-x-full scale-95'
                  : 'opacity-0 transform translate-x-full scale-95'
              }`}
            >
              {/* Image Card with Border and Padding */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl">
                {/* Icon/Illustration with Border */}
                <div className="relative mb-12">
                  <div className={`w-full aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br ${img.gradient} opacity-30 shadow-xl`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${img.gradient} animate-pulse shadow-2xl`}></div>
                  </div>
                </div>
                
                {/* Text Content */}
                <div className="text-center text-white space-y-4">
                  <h2 className="text-3xl font-bold">{img.title}</h2>
                  <p className="text-lg text-blue-100 leading-relaxed">{img.description}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Dots Indicator */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentImageIndex
                    ? 'bg-white w-12 shadow-lg'
                    : 'bg-white/40 w-2 hover:bg-white/60'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Bottom Text */}
        <div className="absolute bottom-6 left-8 right-8 text-center">
          <p className="text-white/60 text-sm">  Private, secure, and reliable.</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">TrackMyOPT</h1>
            <p className="text-gray-600 text-sm mt-1">Your OPT Timeline Companion</p>
          </div>

          {/* Welcome Message */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              TrackMyOPT
            </h2>
            <p className="text-gray-600">
              Calculate filing windows, track unemployment days, and get reminders.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleManualSignIn} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">or login with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-sm text-gray-600"
                >
                  Don't have an account?{' '}
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">create account</span>
                </button>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleManualSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={programEnd}
                  onChange={(e) => setProgramEnd(formatDateInput(e.target.value))}
                  onBlur={() => validateDate(programEnd, 'programEnd', true)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                />
                {dateErrors.programEnd && (
                  <p className="text-xs text-red-600 mt-1">{dateErrors.programEnd}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OPT EAD End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optEadEnd}
                  onChange={(e) => setOptEadEnd(formatDateInput(e.target.value))}
                  onBlur={() => validateDate(optEadEnd, 'optEadEnd', true)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                />
                {dateErrors.optEadEnd && (
                  <p className="text-xs text-red-600 mt-1">{dateErrors.optEadEnd}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OPT Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={optStart}
                  onChange={(e) => setOptStart(formatDateInput(e.target.value))}
                  onBlur={() => validateDate(optStart, 'optStart', true)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="MM/DD/YYYY"
                  maxLength={10}
                />
                {dateErrors.optStart && (
                  <p className="text-xs text-red-600 mt-1">{dateErrors.optStart}</p>
                )}
              </div>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={isStem}
                  onChange={(e) => setIsStem(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">I'm STEM-eligible</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center mt-6">
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  className="text-sm text-gray-600"
                >
                  Already have an account?{' '}
                  <span className="text-blue-600 hover:text-blue-700 font-semibold">sign in</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <a href="/privacy" target="_blank" className="hover:text-gray-700">Privacy Policy</a>
            {' · '}
            <a href="/terms" target="_blank" className="hover:text-gray-700">Terms & Conditions</a>
          </div>
        </div>
      </div>
    </div>
  );
}

