'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuroraBackground } from '@/components/ui/aurora-background';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section with Aurora Background */}
      <AuroraBackground>
        <motion.div
          initial={{ opacity: 0.0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="relative flex flex-col gap-6 items-center justify-center px-4 max-w-4xl mx-auto text-center"
        >
          <h1 className="text-5xl md:text-7xl font-bold dark:text-white text-gray-900">
            Track Your OPT Timeline
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 mt-2">
              With Precision
            </span>
          </h1>
          <p className="text-lg md:text-2xl dark:text-neutral-200 text-gray-600 max-w-2xl font-light">
            Never miss an important OPT deadline. Get real-time countdown, date tracking, and alerts right in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
            <Link
              href="/login"
              className="bg-black dark:bg-white rounded-full w-fit text-white dark:text-black px-8 py-4 text-lg font-semibold hover:scale-105 transition-transform shadow-lg"
            >
              Get Started →
            </Link>
            <a
              href="#features"
              className="bg-transparent border-2 border-black/20 dark:border-white/20 rounded-full w-fit dark:text-white text-gray-900 px-8 py-4 text-lg font-semibold hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              How to Install
            </a>
          </div>
        </motion.div>
      </AuroraBackground>

      {/* Features Section */}
      <div id="features" className="bg-white dark:bg-zinc-900 py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features to manage your OPT timeline
            </p>
          </motion.div>

          <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 rounded-2xl p-8 border border-blue-100 dark:border-blue-800 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">⏱️</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Real-Time Countdown
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Track days remaining on your OPT with precision. Never lose track of critical deadlines.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 rounded-2xl p-8 border border-purple-100 dark:border-purple-800 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                All Your Dates
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Store program end date, DSO recommendation, OPT EAD end date, and STEM extension dates.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 rounded-2xl p-8 border border-green-100 dark:border-green-800 hover:shadow-xl transition-shadow"
            >
              <div className="text-5xl mb-4">🔒</div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">
                Secure & Private
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Your data is encrypted and protected with industry-standard security practices.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Installation Section */}
      <div id="install" className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-900 py-24">
        <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto bg-white dark:bg-zinc-800 rounded-2xl shadow-2xl p-8 md:p-12 border border-gray-100 dark:border-zinc-700"
        >
          <div className="text-center mb-12">
            <div className="text-6xl mb-6">🧩</div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Install the Extension
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Get TrackMyOPT directly in your Chrome browser
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex gap-5 group">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Install from Chrome Web Store
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Click the button below to add TrackMyOPT to Chrome
                </p>
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold hover:scale-105 transition-transform shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818z" />
                  </svg>
                  Add to Chrome
                  <span className="text-xs opacity-80">(Coming Soon)</span>
                </a>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Sign in or Create Account
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Click the extension icon and authenticate with Google or email
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-indigo-600 to-blue-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Enter Your OPT Dates
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Add your program end date, OPT dates, and optional STEM extension dates
                </p>
              </div>
            </div>

            <div className="flex gap-5">
              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-600 to-emerald-600 text-white rounded-full flex items-center justify-center font-bold text-lg shadow-lg">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Track Your Timeline
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  View your OPT countdown anytime by clicking the extension icon
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/50 dark:to-indigo-950/50 border border-blue-200 dark:border-blue-800 rounded-xl">
            <p className="text-base text-blue-900 dark:text-blue-200">
              💡 <strong>Tip:</strong> Pin the extension to your toolbar for quick access
            </p>
          </div>
        </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
        <div className="container mx-auto px-4 py-12 text-center">
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            Made with 💙 for international students
          </p>
        </div>
      </div>
    </div>
  );
}
