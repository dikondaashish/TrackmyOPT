'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Mode = 'signin' | 'signup';

export default function ExtensionAuthPage() {
  const searchParams = useSearchParams();
  const redirectUri = searchParams.get('redirect_uri');
  const state = searchParams.get('state');
  const redirect = searchParams.get('redirect') || '/dashboard'; // For web-only flow
  const errorParam = searchParams.get('error');

  // Determine if this is an extension flow or web-only flow
  // Extension flow: Must have redirect_uri AND it must be a chrome extension URL
  const isExtensionFlow = !!(
    redirectUri && 
    state && 
    (redirectUri.includes('chromiumapp.org') || redirectUri.includes('chrome-extension://'))
  );
  const isWebFlow = !!redirect && !isExtensionFlow;

  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Password Reset States
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);

  // OTP Verification States
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);

  // Sign In/Up Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  
  // Password validation
  const [showPasswordCriteria, setShowPasswordCriteria] = useState(false);
  
  const validatePassword = (pwd: string) => {
    return {
      minLength: pwd.length >= 8,
      hasUpperCase: /[A-Z]/.test(pwd),
      hasLowerCase: /[a-z]/.test(pwd),
      hasNumber: /[0-9]/.test(pwd),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
    };
  };

  const passwordCriteria = validatePassword(password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Load saved email on mount (Remember me functionality)
  useEffect(() => {
    const savedEmail = localStorage.getItem('trackmyopt_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
  }, []);

  // Auto-scroll images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Only show error if it's not a valid extension flow OR web flow
  if (!isExtensionFlow && !isWebFlow) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Login Link</h1>
            <p className="text-gray-600 mb-4">
              This authentication page requires proper authentication parameters.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Please access this page from the TrackMyOPT extension or with a valid redirect URL.
            </p>
            <a 
              href="/?redirect=/dashboard" 
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-6 py-3 transition"
            >
              Go to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isExtensionFlow) {
        // Extension flow: use client callback to capture hash tokens and forward to server
        const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/extension/callback/client?redirect_uri=${encodeURIComponent(redirectUri!)}&state=${encodeURIComponent(state!)}`;
        
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
      } else {
        // Web flow: redirect to client callback page which handles hash tokens
        const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/auth/extension/callback/client?redirect=${encodeURIComponent(redirect)}`;
        
        console.log('🌐 Web OAuth flow - Callback URL:', callbackUrl);
        
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
      }
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
      if (isExtensionFlow) {
        // Extension flow: get JWT and redirect through completing page
        const res = await fetch('/api/manual/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        
        if (!data.ok || !data.token) {
          throw new Error(data.error || 'Login failed');
        }
        
        // Save email if "Remember me" is checked
        if (rememberMe) {
          localStorage.setItem('trackmyopt_remember_email', email);
        } else {
          localStorage.removeItem('trackmyopt_remember_email');
        }
        
        // Redirect to intermediate page that will handle the extension redirect
        const completingUrl = new URL('/auth/completing', window.location.origin);
        completingUrl.searchParams.set('token', data.token);
        completingUrl.searchParams.set('state', state!);
        completingUrl.searchParams.set('redirect_uri', redirectUri!);
        completingUrl.searchParams.set('redirect', '/dashboard');
        
        window.location.href = completingUrl.toString();
      } else {
        // Web flow: establish server-side session via API route
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // CRITICAL: Ensure cookies are included in request/response
        });

        const sessionData = await sessionRes.json();

        if (!sessionData.ok) {
          throw new Error(sessionData.error || 'Failed to establish session');
        }

        // Save email if "Remember me" is checked
        if (rememberMe) {
          localStorage.setItem('trackmyopt_remember_email', email);
        } else {
          localStorage.removeItem('trackmyopt_remember_email');
        }

        // Wait for cookies to be fully set before redirecting
        await new Promise(resolve => setTimeout(resolve, 300));

        // Session is now established on server, redirect to dashboard
        // Use replace to avoid back button issues
        window.location.replace(redirect);
      }
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate password
    if (!isPasswordValid) {
      setError('Password does not meet all security criteria');
      setLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Send OTP to email via Supabase
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, firstName, lastName }),
      });
      const data = await res.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to send verification code');
      }
      
      // Show OTP modal
      setLoading(false);
      setShowOTPModal(true);
      setOtpSent(true);
      setOtpError(null);
      setOtpCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please try again.');
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    setOtpLoading(true);
    setOtpError(null);

    try {
      // Verify OTP and create account
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          otp: otpCode,
          firstName,
          lastName,
          password,
        }),
      });
      const data = await res.json();
      
      if (!data.ok || !data.token) {
        throw new Error(data.error || 'Invalid verification code');
      }
      
      // Close modal
      setShowOTPModal(false);
      
      if (isExtensionFlow) {
        // Extension flow: redirect through completing page
        const completingUrl = new URL('/auth/completing', window.location.origin);
        completingUrl.searchParams.set('token', data.token);
        completingUrl.searchParams.set('state', state!);
        completingUrl.searchParams.set('redirect_uri', redirectUri!);
        completingUrl.searchParams.set('redirect', '/dashboard');
        
        window.location.href = completingUrl.toString();
      } else {
        // Web flow: establish server-side session for the new account
        const sessionRes = await fetch('/api/auth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
          credentials: 'include', // CRITICAL: Ensure cookies are included
        });

        const sessionData = await sessionRes.json();

        if (!sessionData.ok) {
          console.error('Auto sign-in error:', sessionData.error);
          // If auto sign-in fails, redirect to login page
          window.location.href = '/auth/extension?redirect=' + encodeURIComponent(redirect);
        } else {
          // Wait for cookies to be fully set before redirecting
          await new Promise(resolve => setTimeout(resolve, 300));
          
          // Session established, redirect to dashboard
          // Use replace to avoid back button issues
          window.location.replace(redirect);
        }
      }
    } catch (err: any) {
      setOtpError(err.message || 'Invalid verification code. Please try again.');
      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError(null);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      
      if (!data.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }
      
      setOtpError(null);
      setOtpCode('');
      setOtpLoading(false);
      // Show success feedback
      alert('Verification code resent to your email!');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code. Please try again.');
      setOtpLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setResetError(null);

    try {
      // First, check if user exists
      const checkRes = await fetch('/api/auth/check-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
      const checkData = await checkRes.json();

      if (!checkData.ok) {
        throw new Error('Failed to verify email address');
      }

      if (!checkData.exists) {
        setResetError(
          "This email is not registered with TrackMyOPT. Please create an account first by clicking 'create account' below."
        );
        setResetLoading(false);
        return;
      }

      // User exists, send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
      });

      if (error) {
        throw error;
      }

      setResetSuccess(true);
      setResetLoading(false);
    } catch (err: any) {
      setResetError(err.message || 'Failed to send reset email. Please try again.');
      setResetLoading(false);
    }
  };

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setResetEmail(email); // Pre-fill with current email if available
    setShowResetModal(true);
    setResetSuccess(false);
    setResetError(null);
  };

  const closeResetModal = () => {
    setShowResetModal(false);
    setResetEmail('');
    setResetSuccess(false);
    setResetError(null);
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
            <form onSubmit={handleManualSignIn} className="space-y-4" method="post">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter your email address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  autoComplete="username email"
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
                  name="password"
                  id="password"
                  autoComplete="current-password"
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
                <button
                  type="button"
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
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
            <form onSubmit={handleManualSignUp} className="space-y-4" method="post">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    autoComplete="given-name"
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
                    name="lastName"
                    autoComplete="family-name"
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
                  name="email"
                  id="signup-email"
                  autoComplete="username email"
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
                  name="password"
                  id="signup-password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setShowPasswordCriteria(true)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                
                {/* Password Criteria */}
                {showPasswordCriteria && password.length > 0 && (
                  <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                    <p className="text-xs font-semibold text-gray-700 mb-2">Password must contain:</p>
                    <ul className="space-y-1 text-xs">
                      <li className={`flex items-center ${passwordCriteria.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordCriteria.minLength ? '✓' : '○'}</span>
                        At least 8 characters
                      </li>
                      <li className={`flex items-center ${passwordCriteria.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordCriteria.hasUpperCase ? '✓' : '○'}</span>
                        One uppercase letter (A-Z)
                      </li>
                      <li className={`flex items-center ${passwordCriteria.hasLowerCase ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordCriteria.hasLowerCase ? '✓' : '○'}</span>
                        One lowercase letter (a-z)
                      </li>
                      <li className={`flex items-center ${passwordCriteria.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordCriteria.hasNumber ? '✓' : '○'}</span>
                        One number (0-9)
                      </li>
                      <li className={`flex items-center ${passwordCriteria.hasSpecialChar ? 'text-green-600' : 'text-gray-500'}`}>
                        <span className="mr-2">{passwordCriteria.hasSpecialChar ? '✓' : '○'}</span>
                        One special character (!@#$%^&*...)
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirm-password"
                  id="signup-confirm-password"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                {confirmPassword.length > 0 && (
                  <p className={`text-xs mt-1 ${doPasswordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                    {doPasswordsMatch ? '✓ Passwords match' : '✗ Passwords do not match'}
                  </p>
                )}
              </div>

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

      {/* Password Reset Modal */}
      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            {!resetSuccess ? (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Reset Password</h2>
                  <button
                    onClick={closeResetModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                    aria-label="Close modal"
                  >
                    ×
                  </button>
                </div>

                <p className="text-gray-600 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {resetError && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    <p>{resetError}</p>
                    {resetError.includes('not registered') && (
                      <button
                        type="button"
                        onClick={() => {
                          closeResetModal();
                          setMode('signup');
                        }}
                        className="mt-3 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition text-sm"
                      >
                        Create Account Now
                      </button>
                    )}
                  </div>
                )}

                <form onSubmit={handlePasswordReset} className="space-y-4" method="post">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="reset-email"
                      autoComplete="email"
                      value={resetEmail}
                      onChange={(e) => setResetEmail(e.target.value)}
                      required
                      disabled={resetLoading}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                      placeholder="your@email.com"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeResetModal}
                      disabled={resetLoading}
                      className="flex-1 py-3 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={resetLoading}
                      className="flex-1 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <>
                <div className="text-center">
                  <div className="text-6xl mb-4">📧</div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                  <p className="text-gray-600 mb-6">
                    We've sent a password reset link to <strong>{resetEmail}</strong>. 
                    Please check your inbox and follow the instructions to reset your password.
                  </p>
                  <button
                    onClick={closeResetModal}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                  >
                    Got it!
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">📧</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-600 mb-6">
                We've sent a 6-digit verification code to <strong>{email}</strong>. 
                Please check your inbox and enter the code below.
              </p>

              {otpError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {otpError}
                </div>
              )}

              <div className="mb-6">
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  disabled={otpLoading}
                  className="w-full px-4 py-3 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100 tracking-widest"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2">Code expires in 10 minutes</p>
              </div>

              <button
                onClick={handleVerifyOTP}
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed mb-3"
              >
                {otpLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtpCode('');
                    setOtpError(null);
                  }}
                  disabled={otpLoading}
                  className="text-gray-600 hover:text-gray-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={otpLoading}
                  className="text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                >
                  Resend Code
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

