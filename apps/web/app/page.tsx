import Link from 'next/link';
import { Metadata } from 'next';

// SEO Metadata
export const metadata: Metadata = {
  title: 'TrackMyOPT — The #1 OPT Timeline Tracker for International Students',
  description: 'Track your OPT deadlines, unemployment days, USCIS case status, and find H-1B sponsors. Join 15,000+ international students managing their OPT with confidence.',
  keywords: 'OPT tracker, STEM OPT, F-1 visa, international students, USCIS case status, H-1B sponsors, unemployment clock, OPT deadline, EAD tracking',
  openGraph: {
    title: 'TrackMyOPT — Never Miss an OPT Deadline Again',
    description: 'The all-in-one platform for international students on OPT. Track timelines, manage documents, find H-1B sponsors.',
    type: 'website',
    locale: 'en_US',
    siteName: 'TrackMyOPT',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackMyOPT — OPT Timeline Tracker',
    description: 'Join 15,000+ international students tracking their OPT with precision.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

// Feature data
const features = [
  {
    icon: '⏱️',
    title: 'OPT Timeline',
    description: 'Real-time countdown to every critical deadline. Never miss a filing window.',
    gradient: 'from-blue-500 to-cyan-500',
    bgGradient: 'from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
  },
  {
    icon: '📊',
    title: 'Unemployment Clock',
    description: 'Track your 90/150-day limit with color-coded alerts before it\'s too late.',
    gradient: 'from-amber-500 to-orange-500',
    bgGradient: 'from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30',
  },
  {
    icon: '🔍',
    title: 'Case Status Tracker',
    description: 'Monitor your USCIS case in real-time. Get notified on every status change.',
    gradient: 'from-purple-500 to-pink-500',
    bgGradient: 'from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
  },
  {
    icon: '📁',
    title: 'Document Vault',
    description: 'Secure, encrypted storage for all your immigration documents with AI analysis.',
    gradient: 'from-green-500 to-emerald-500',
    bgGradient: 'from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
  },
  {
    icon: '📝',
    title: 'Resume Generator',
    description: 'Upload, parse, and manage resumes with OCR support for scanned documents.',
    gradient: 'from-rose-500 to-red-500',
    bgGradient: 'from-rose-50 to-red-50 dark:from-rose-950/30 dark:to-red-950/30',
  },
  {
    icon: '💼',
    title: 'Job Tracker',
    description: 'Kanban-style board to manage applications from wishlist to offer.',
    gradient: 'from-indigo-500 to-violet-500',
    bgGradient: 'from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30',
  },
  {
    icon: '🏢',
    title: 'H-1B Sponsor Database',
    description: '80,000+ verified companies that sponsor H-1B visas, searchable and filterable.',
    gradient: 'from-teal-500 to-cyan-500',
    bgGradient: 'from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30',
  },
  {
    icon: '📋',
    title: 'Tax & Insurance Guide',
    description: 'Interactive guides for tax filing and health insurance requirements.',
    gradient: 'from-slate-500 to-gray-500',
    bgGradient: 'from-slate-50 to-gray-50 dark:from-slate-950/30 dark:to-gray-950/30',
  },
];

const stats = [
  { value: '15,000+', label: 'Active Users' },
  { value: '80,000+', label: 'H-1B Sponsors' },
  { value: '50,000+', label: 'Cases Tracked' },
  { value: '100+', label: 'Countries' },
];

const testimonials = [
  {
    quote: "TrackMyOPT saved me from missing my 90-day employment deadline. The alerts are a lifesaver!",
    name: "Priya S.",
    role: "Software Engineer",
    school: "UC Berkeley",
    avatar: "🎓",
  },
  {
    quote: "The H-1B sponsor database helped me find companies I never knew sponsored visas. Got my H-1B on first attempt!",
    name: "Wei L.",
    role: "Data Scientist",
    school: "MIT",
    avatar: "🎯",
  },
  {
    quote: "Document Vault gives me peace of mind. All my I-20s and EADs are secure and organized in one place.",
    name: "Carlos M.",
    role: "Product Manager",
    school: "Stanford",
    avatar: "📚",
  },
];

const faqs = [
  {
    q: "Is TrackMyOPT free to use?",
    a: "Yes! Our core features including OPT timeline tracking, unemployment clock, and case status monitoring are completely free. Premium features like Document Vault and unlimited tracking are available for a one-time $19.99 lifetime purchase."
  },
  {
    q: "How does the unemployment clock work?",
    a: "The unemployment clock tracks your cumulative unemployment days during OPT. You get 90 days for regular OPT and 150 days for STEM OPT. Our system calculates this automatically based on your employment history and alerts you when you're approaching the limit."
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use AES-256 encryption for all stored documents, SSL/TLS for data in transit, and follow industry-standard security practices. Your data is your own — we never share or sell it."
  },
  {
    q: "Can I track multiple USCIS cases?",
    a: "Free users can track 1 case. Premium users get unlimited case tracking with priority notifications for status changes."
  },
  {
    q: "Do you have a mobile app?",
    a: "TrackMyOPT is a fully responsive web application that works beautifully on mobile, tablet, and desktop. A native mobile app is on our roadmap for 2026."
  },
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up in Seconds",
    description: "Create your free account with Google or email. No credit card required.",
    icon: "✨",
    color: "from-blue-500 to-purple-500",
  },
  {
    step: 2,
    title: "Enter Your Dates",
    description: "Add your program end date, OPT dates, and STEM extension dates if applicable.",
    icon: "📅",
    color: "from-purple-500 to-pink-500",
  },
  {
    step: 3,
    title: "Track Everything",
    description: "Get your personalized timeline, case tracking, and alerts delivered automatically.",
    icon: "🚀",
    color: "from-pink-500 to-red-500",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-navbar">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl md:text-3xl font-bold gradient-text group-hover:scale-105 transition-transform">
                TrackMyOPT
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Features
              </a>
              <a href="#how-it-works" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                How It Works
              </a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                Pricing
              </a>
              <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium">
                FAQ
              </a>
            </div>

            {/* CTA Buttons */}
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="hidden sm:inline-flex text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                Get Started
                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50/50 to-pink-50 dark:from-zinc-950 dark:via-purple-950/20 dark:to-zinc-950" />

        {/* Animated Background Circles */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-float delay-500" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-8 animate-fade-in-down">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Trusted by 15,000+ International Students
          </div>

          {/* Main Headline */}
          <h1 className="text-hero text-gray-900 dark:text-white mb-6 animate-fade-in-up">
            Never Miss an
            <span className="block gradient-text-hero animate-gradient-x bg-[length:200%_auto]">
              OPT Deadline Again
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10 animate-fade-in-up delay-200 font-light">
            The all-in-one platform to track your OPT timeline, unemployment days,
            USCIS case status, and find H-1B sponsors — all in one beautiful dashboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
            <Link
              href="/login"
              className="group relative inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Tracking Free
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center px-8 py-4 text-gray-700 dark:text-gray-200 text-lg font-semibold rounded-full border-2 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-all duration-300"
            >
              See All Features
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </a>
          </div>

          {/* Trust Badges */}
          <div className="mt-16 animate-fade-in-up delay-500">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Trusted by students from</p>
            <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-60">
              {['MIT', 'Stanford', 'Harvard', 'UC Berkeley', 'Carnegie Mellon', 'Georgia Tech'].map((school) => (
                <span key={school} className="text-lg md:text-xl font-semibold text-gray-600 dark:text-gray-400">
                  {school}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce-subtle">
          <div className="w-6 h-10 rounded-full border-2 border-gray-300 dark:border-gray-600 p-1">
            <div className="w-1.5 h-2.5 bg-gray-400 dark:bg-gray-500 rounded-full mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-blue-100 text-sm md:text-base font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-20 md:py-32 section-gradient-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Managing OPT Shouldn't Be This Hard
            </h2>
            <p className="text-section-subtitle max-w-3xl mx-auto">
              Every year, international students lose OPT status because of missed deadlines,
              unemployment violations, or lost documents. We built TrackMyOPT to solve this.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              { icon: '😰', title: 'Missed Deadlines', desc: 'Filing windows are confusing and easy to miss' },
              { icon: '📋', title: 'Tracking Chaos', desc: 'Spreadsheets and sticky notes don\'t cut it' },
              { icon: '😟', title: 'Constant Worry', desc: 'Is my case approved? Am I over 90 days?' },
            ].map((problem, i) => (
              <div key={problem.title} className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-2xl p-8 text-center">
                <div className="text-5xl mb-4">{problem.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{problem.title}</h3>
                <p className="text-gray-600 dark:text-gray-400">{problem.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <div className="inline-flex items-center gap-3 text-xl md:text-2xl font-semibold text-green-600 dark:text-green-400">
              <span className="text-3xl">✅</span>
              TrackMyOPT solves all of this — automatically.
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm font-semibold mb-4">
              FEATURES
            </span>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Everything You Need, <br className="hidden sm:block" />
              <span className="gradient-text">All in One Place</span>
            </h2>
            <p className="text-section-subtitle max-w-2xl mx-auto">
              From deadline tracking to career tools, we've got you covered at every step of your OPT journey.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className={`group bg-gradient-to-br ${feature.bgGradient} rounded-2xl p-6 border border-gray-100 dark:border-gray-800 card-hover-glow`}
              >
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-32 section-gradient-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-sm font-semibold mb-4">
              HOW IT WORKS
            </span>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Get Started in <span className="gradient-text">3 Simple Steps</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {howItWorks.map((step, index) => (
              <div key={step.step} className="relative text-center">
                {/* Connector Line */}
                {index < howItWorks.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 dark:from-purple-800 dark:to-pink-800" />
                )}

                <div className={`inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br ${step.color} text-5xl mb-6 shadow-lg`}>
                  {step.icon}
                </div>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br ${step.color} text-white text-sm font-bold mb-4 -mt-2`}>
                  {step.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              href="/login"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-full shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              Create Free Account
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 md:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-semibold mb-4">
              TESTIMONIALS
            </span>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Loved by Students <span className="gradient-text">Worldwide</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={testimonial.name}
                className="bg-gray-50 dark:bg-zinc-900 rounded-2xl p-8 border border-gray-100 dark:border-zinc-800 card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 mb-6 italic">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 flex items-center justify-center text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.school}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 md:py-32 section-gradient-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full text-sm font-semibold mb-4">
              PRICING
            </span>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Simple, Transparent <span className="gradient-text">Pricing</span>
            </h2>
            <p className="text-section-subtitle max-w-2xl mx-auto">
              Start free, upgrade when you need more. One-time payment, lifetime access.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-8 border-2 border-gray-200 dark:border-zinc-800 card-hover">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                <div className="text-5xl font-bold text-gray-900 dark:text-white mb-2">$0</div>
                <p className="text-gray-500 dark:text-gray-400">Forever free</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'OPT Timeline Tracking',
                  'Unemployment Clock',
                  '1 USCIS Case Tracking',
                  '3 Document Storage',
                  'H-1B Sponsor Search',
                  'Tax & Insurance Guides',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-gray-700 dark:text-gray-300">
                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/login"
                className="block w-full py-4 text-center bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Get Started Free
              </Link>
            </div>

            {/* Premium Plan */}
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl p-8 border-2 border-transparent shadow-2xl card-hover">
              {/* Popular Badge */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center px-4 py-1.5 bg-amber-400 text-amber-900 rounded-full text-sm font-bold shadow-lg">
                  ⭐ MOST POPULAR
                </span>
              </div>
              <div className="text-center mb-8 text-white">
                <h3 className="text-2xl font-bold mb-2">Premium</h3>
                <div className="text-5xl font-bold mb-2">$19.99</div>
                <p className="text-blue-100">One-time, lifetime access</p>
              </div>
              <ul className="space-y-4 mb-8">
                {[
                  'Everything in Free',
                  'Unlimited Case Tracking',
                  'Document Vault (Unlimited)',
                  'AI Document Analysis',
                  'Expiry Reminders',
                  'Priority Support',
                  'Data Export',
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-3 text-white">
                    <svg className="w-5 h-5 text-green-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                href="/premium/checkout"
                className="block w-full py-4 text-center bg-white text-purple-600 font-bold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
              >
                Upgrade to Premium
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 md:py-32 bg-white dark:bg-zinc-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-sm font-semibold mb-4">
              FAQ
            </span>
            <h2 className="text-section-title text-gray-900 dark:text-white mb-6">
              Frequently Asked <span className="gradient-text">Questions</span>
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <details
                key={index}
                className="group bg-gray-50 dark:bg-zinc-900 rounded-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
              >
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors">
                  {faq.q}
                  <svg className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <div className="px-6 pb-6 text-gray-600 dark:text-gray-400">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Take Control of Your OPT?
          </h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join 15,000+ international students who never miss a deadline.
            Start tracking in under 60 seconds.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-white text-purple-600 text-lg font-bold rounded-full shadow-2xl hover:bg-gray-100 hover:scale-105 transition-all duration-300"
            >
              Start Free Now
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <Link
              href="/premium/checkout"
              className="inline-flex items-center justify-center px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-full hover:bg-white/10 transition-all duration-300"
            >
              View Premium Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-4 gap-12 md:gap-8">
            {/* Brand */}
            <div className="md:col-span-1">
              <Link href="/" className="text-2xl font-bold gradient-text">
                TrackMyOPT
              </Link>
              <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm">
                The #1 OPT timeline tracker for international students in the USA.
              </p>
              <div className="mt-6 flex gap-4">
                {/* Social Icons */}
                {['twitter', 'linkedin', 'instagram'].map((social) => (
                  <a
                    key={social}
                    href={`https://${social}.com/trackmyopt`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-200 dark:bg-zinc-800 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    aria-label={social}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2z" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Product</h4>
              <ul className="space-y-3">
                {['Features', 'Pricing', 'FAQ', 'Changelog'].map((link) => (
                  <li key={link}>
                    <a href={`#${link.toLowerCase()}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Resources</h4>
              <ul className="space-y-3">
                {['OPT Guide', 'STEM OPT', 'H-1B Sponsors', 'Tax Filing'].map((link) => (
                  <li key={link}>
                    <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                {[
                  { name: 'Privacy Policy', href: '/privacy' },
                  { name: 'Terms of Service', href: '/terms' },
                  { name: 'Cookie Policy', href: '/privacy' },
                ].map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} TrackMyOPT. Made with 💙 for international students.
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">
              Not affiliated with USCIS. For informational purposes only.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
