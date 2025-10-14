'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type AuthMode = 'signin' | 'signup';

export default function ExtensionAuthPage() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');

  const [mode, setMode] = useState<AuthMode>('signin');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [rememberMe, setRememberMe] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [programEnd, setProgramEnd] = useState('');
  const [dsoReco, setDsoReco] = useState('');
  const [optEadEnd, setOptEadEnd] = useState('');
  const [optStart, setOptStart] = useState('');
  const [stemStart, setStemStart] = useState('');
  const [isStem, setIsStem] = useState(false);

  // Image carousel
  const slides = [
    {
      title: "Track Your OPT Timeline",
      description: "Never miss important deadlines with real-time countdown tracking",
      gradient: "from-blue-600 via-blue-500 to-indigo-600"
    },
    {
      title: "Stay Compliant",
      description: "Calculate filing windows and manage unemployment days effortlessly",
      gradient: "from-purple-600 via-purple-500 to-pink-600"
    },
    {
      title: "Peace of Mind",
      description: "Get reminders and stay on top of your OPT requirements",
      gradient: "from-indigo-600 via-blue-500 to-cyan-600"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  const formatDateInput = (value: string): string => {
    const nums = value.replace(/\D/g, '');
    if (nums.length <= 2) return nums;
    if (nums.length <= 4) return nums.slice(0, 2) + '/' + nums.slice(2);
    return nums.slice(0, 2) + '/' + nums.slice(2, 4) + '/' + nums.slice(4, 8);
  };

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

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Carousel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-90`} />
            <div className="relative h-full flex flex-col items-center justify-center p-12 text-white">
              <div className="max-w-md text-center">
                <h2 className="text-4xl font-bold mb-6">{slide.title}</h2>
                <p className="text-xl text-white/90">{slide.description}</p>
              </div>
            </div>
          </div>
        ))}
        
        {/* Carousel Indicators */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md">
          {/* Logo/Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">TrackMyOPT</h1>
            <p className="text-gray-600">
              Calculate filing windows, track unemployment days, and get reminders.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Form */}
          {mode === 'signin' && (
            <form onSubmit={handleManualSignIn} className="space-y-4">
              <div>
                <input
                  type="email"
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div>
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 disabled:cursor-not-allowed"
                />
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Remember me</span>
                </label>
                <a href="#" className="text-blue-600 hover:underline">
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">or login with</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3 px-4 border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  disabled={loading}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  create account
                </button>
              </p>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleManualSignUp} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
                />
              </div>

              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
              />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
              />

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Program End (MM/DD/YYYY)"
                  value={programEnd}
                  onChange={(e) => setProgramEnd(formatDateInput(e.target.value))}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 text-sm"
                />
                <input
                  type="text"
                  placeholder="OPT EAD End (MM/DD/YYYY)"
                  value={optEadEnd}
                  onChange={(e) => setOptEadEnd(formatDateInput(e.target.value))}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50 text-sm"
                />
              </div>

              <input
                type="text"
                placeholder="OPT Start Date (MM/DD/YYYY)"
                value={optStart}
                onChange={(e) => setOptStart(formatDateInput(e.target.value))}
                required
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition disabled:bg-gray-50"
              />

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isStem}
                  onChange={(e) => setIsStem(e.target.checked)}
                  disabled={loading}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">I'm STEM-eligible</span>
              </label>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signin')}
                  disabled={loading}
                  className="text-blue-600 hover:underline font-semibold"
                >
                  sign in
                </button>
              </p>
            </form>
          )}

          {/* Footer Links */}
          <div className="mt-8 text-center text-sm text-gray-500">
            <a href="/privacy" target="_blank" className="hover:text-blue-600 hover:underline">
              Privacy Policy
            </a>
            {' · '}
            <a href="/terms" target="_blank" className="hover:text-blue-600 hover:underline">
              Terms & Conditions
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

