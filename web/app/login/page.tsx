'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type Mode = 'signin' | 'signup';

function LoginPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const errorParam = searchParams.get('error');
  
  // Get redirect URL from query params (set by middleware for protected routes)
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(errorParam);
  const [rememberMe, setRememberMe] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  
  // OTP Verification
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [countdown, setCountdown] = useState(180); // 3 minutes = 180 seconds
  const [canResend, setCanResend] = useState(false);
  const [signupEmail, setSignupEmail] = useState('');
  const [lastUsedMethod, setLastUsedMethod] = useState<'email' | 'google' | null>(null);
  
  // Password visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Sign In/Up Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Password validation
  const validatePassword = (pwd: string) => ({
    hasMinLength: pwd.length >= 8,
    hasUpperCase: /[A-Z]/.test(pwd),
    hasLowerCase: /[a-z]/.test(pwd),
    hasNumber: /\d/.test(pwd),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  });

  const passwordCriteria = validatePassword(password);
  const isPasswordValid = Object.values(passwordCriteria).every(Boolean);

  // Load saved email and last used method on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('trackmyopt_remember_email');
    if (savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    
    const savedMethod = localStorage.getItem('trackmyopt_last_method') as 'email' | 'google' | null;
    if (savedMethod) {
      setLastUsedMethod(savedMethod);
    }
  }, []);

  // Countdown timer for OTP
  useEffect(() => {
    if (showOTPModal && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [showOTPModal, countdown]);

  // Format countdown as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Auto-scroll images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % 3);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Don't auto-redirect if already logged in - let user choose
  // This prevents redirect loops if session check is inconsistent

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    
    // Save last used method
    localStorage.setItem('trackmyopt_last_method', 'google');
    
    try {
      const redirectUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
      
      // Use auth callback route for proper session handling
      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (oauthError) {
        throw oauthError;
      }
      
      // OAuth will redirect automatically, don't set loading to false
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed');
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Check if email is blocked (previously deleted account)
      const blockedRes = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const blockedData = await blockedRes.json();
      
      if (blockedData.blocked) {
        throw new Error('This email has been permanently blocked. Previously deleted accounts cannot be recreated or used to sign in.');
      }

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        throw signInError;
      }


      // Save email if remember me
      if (rememberMe) {
        localStorage.setItem('trackmyopt_remember_email', email);
      } else {
        localStorage.removeItem('trackmyopt_remember_email');
      }
      
      // Save last used method
      localStorage.setItem('trackmyopt_last_method', 'email');
      
      // Redirect to intended page or dashboard - session is now in cookies
      window.location.href = redirectTo;
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetLoading(true);
    setError(null);

    try {
      // Validate email format first
      if (!resetEmail || !resetEmail.includes('@')) {
        throw new Error('Please enter a valid email address');
      }

      // Check if user exists in the profiles table
      // This is safe to do as we're only checking existence, not exposing sensitive data
      const { data: userProfile, error: profileError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', resetEmail.toLowerCase())
        .maybeSingle();

      // If no user found in profiles, they're not registered
      if (!userProfile && !profileError) {
        throw new Error('This email is not registered with TrackMyOPT. Please create an account first.');
      }

      // User exists, send the reset email
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        throw resetError;
      }

      // Success
      setResetSuccess(true);
      setTimeout(() => {
        setShowForgotPassword(false);
        setResetSuccess(false);
        setResetEmail('');
      }, 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset link');
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    setOtpError('');

    try {
      // Resend OTP by calling signUp again
      const { error } = await supabase.auth.signUp({
        email: signupEmail,
        password, // Use the same password
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      // Reset timer
      setCountdown(180);
      setCanResend(false);
      setOtpError('');
    } catch (err: any) {
      setOtpError(err.message || 'Failed to resend code');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpLoading(true);
    setOtpError('');

    try {
      // Verify OTP token
      const { data, error } = await supabase.auth.verifyOtp({
        email: signupEmail,
        token: otpCode,
        type: 'signup',
      });

      if (error) throw error;

      
      // Redirect to intended page or dashboard
      window.location.href = redirectTo;
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired code. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!isPasswordValid) {
      setError('Password does not meet all security criteria');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Check if email is blocked (previously deleted account)
      const blockedRes = await fetch('/api/auth/check-blocked', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const blockedData = await blockedRes.json();
      
      if (blockedData.blocked) {
        throw new Error('This email has been permanently blocked. Previously deleted accounts cannot be recreated.');
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            fullName: `${firstName} ${lastName}`,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signUpError) {
        throw signUpError;
      }


      // Show OTP modal
      setSignupEmail(email);
      setShowOTPModal(true);
      setCountdown(180); // Reset to 3 minutes
      setCanResend(false);
      setLoading(false);
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
      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
              <p className="text-gray-600 text-sm">
                We've sent a 6-digit verification code to <strong>{signupEmail}</strong>. Please check your inbox and enter the code below.
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  disabled={otpLoading}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-center text-2xl font-mono tracking-widest focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                  placeholder="Enter 6-digit code"
                />
              </div>

              <div className="text-center">
                <p className="text-sm text-gray-500">
                  Code expires in <span className="font-semibold text-gray-700">{formatTime(countdown)}</span>
                </p>
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
                  {otpError}
                </div>
              )}

              <button
                type="submit"
                disabled={otpLoading || otpCode.length !== 6}
                className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {otpLoading ? 'Verifying...' : 'Verify & Create Account'}
              </button>

              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtpCode('');
                    setOtpError('');
                  }}
                  className="text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={!canResend || otpLoading}
                  className={`font-medium ${
                    canResend
                      ? 'text-blue-600 hover:text-blue-700 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Resend Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
            <button
              onClick={() => {
                setShowForgotPassword(false);
                setError(null);
                setResetEmail('');
              }}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600 mb-6">
              Enter your email address and we'll send you a link to reset your password.
            </p>

            {resetSuccess ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
                ✓ Password reset link sent! Check your email.
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    disabled={resetLoading}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                    placeholder="your@email.com"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {error}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPassword(false);
                      setError(null);
                      setResetEmail('');
                    }}
                    disabled={resetLoading}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition disabled:opacity-50"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* Left Side - Images Carousel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 relative overflow-hidden p-16">
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
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-3xl p-12 shadow-2xl">
                <div className="relative mb-12">
                  <div className={`w-full aspect-square max-w-sm mx-auto rounded-2xl bg-gradient-to-br ${img.gradient} opacity-30 shadow-xl`}></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${img.gradient} animate-pulse shadow-2xl`}></div>
                  </div>
                </div>
                
                <div className="text-center text-white space-y-4">
                  <h2 className="text-3xl font-bold">{img.title}</h2>
                  <p className="text-lg text-blue-100 leading-relaxed">{img.description}</p>
                </div>
              </div>
            </div>
          ))}

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

        <div className="absolute bottom-6 left-8 right-8 text-center">
          <p className="text-white/60 text-sm">Private, secure, and reliable.</p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">TrackMyOPT</h1>
            <p className="text-gray-600 text-sm mt-1">Your OPT Timeline Companion</p>
          </div>

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
            <form onSubmit={handleSignIn} className="space-y-4">
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
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
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
                  onClick={() => {
                    setShowForgotPassword(true);
                    setResetEmail(email); // Auto-fill with current email
                    setError(null); // Clear any previous errors
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </button>
                {lastUsedMethod === 'email' && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                    Last used
                  </span>
                )}
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">or login with</span>
                </div>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                {lastUsedMethod === 'google' && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full shadow-lg">
                    Last used
                  </span>
                )}
              </div>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signup');
                      setError(null);
                      setPassword('');
                      setConfirmPassword('');
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    create account
                  </button>
                </p>
              </div>

              <div className="text-center mt-4">
                <p className="text-xs text-gray-500">
                  <a href="/privacy" className="hover:text-blue-600">Privacy Policy</a>
                  {' · '}
                  <a href="/terms" className="hover:text-blue-600">Terms & Conditions</a>
                </p>
              </div>
            </form>
          )}

          {/* Sign Up Form */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-4">
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
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
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                
                {/* Password criteria - only show when typing */}
                {password.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs text-gray-600 font-medium mb-2">Password must contain:</p>
                    {[
                      { label: 'At least 8 characters', valid: passwordCriteria.hasMinLength },
                      { label: 'One uppercase letter (A-Z)', valid: passwordCriteria.hasUpperCase },
                      { label: 'One lowercase letter (a-z)', valid: passwordCriteria.hasLowerCase },
                      { label: 'One number (0-9)', valid: passwordCriteria.hasNumber },
                      { label: 'One special character (!@#$%^&*...)', valid: passwordCriteria.hasSpecialChar },
                    ].map(({ label, valid }) => (
                      <div key={label} className="flex items-center text-xs">
                        <span className={valid ? 'text-green-600' : 'text-gray-400'}>
                          {valid ? '✓' : '○'}
                        </span>
                        <span className={`ml-2 ${valid ? 'text-green-600' : 'text-gray-500'}`}>
                          {label}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:bg-gray-100"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Terms and Privacy Policy Agreement */}
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    id="terms-checkbox"
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    disabled={loading}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
                <label htmlFor="terms-checkbox" className="text-sm text-gray-600 cursor-pointer select-none">
                  I agree to the{' '}
                  <a 
                    href="/privacy" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Privacy Policy
                  </a>
                  {' '}and{' '}
                  <a 
                    href="/terms" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700 hover:underline font-medium"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !isPasswordValid || !agreedToTerms}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </button>

              <div className="text-center mt-6">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setMode('signin');
                      setError(null);
                      setPassword('');
                      setConfirmPassword('');
                      setAgreedToTerms(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    sign in
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
