import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Track Your OPT Timeline
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
              With Precision
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Never miss an important OPT deadline. Get real-time countdown, date tracking, and alerts right in your browser.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition shadow-lg hover:shadow-xl"
            >
              Get Started →
            </Link>
            <a
              href="#install"
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white rounded-xl hover:bg-gray-50 transition shadow-lg"
            >
              How to Install
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">⏱️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Real-Time Countdown
            </h3>
            <p className="text-gray-600">
              Track days remaining on your OPT with precision. Never lose track of critical deadlines.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">📅</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              All Your Dates
            </h3>
            <p className="text-gray-600">
              Store program end date, DSO recommendation, OPT EAD end date, and STEM extension dates.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="text-4xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Secure & Private
            </h3>
            <p className="text-gray-600">
              Your data is encrypted and protected with industry-standard security practices.
            </p>
          </div>
        </div>
      </div>

      {/* Installation Section */}
      <div id="install" className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">🧩</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Install the Extension
            </h2>
            <p className="text-gray-600">
              Get TrackMyOPT directly in your Chrome browser
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Install from Chrome Web Store
                </h3>
                <p className="text-gray-600 mb-3">
                  Click the button below to add TrackMyOPT to Chrome
                </p>
                <a
                  href="https://chrome.google.com/webstore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition shadow-lg"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.372 0 0 5.372 0 12s5.372 12 12 12 12-5.372 12-12S18.628 0 12 0zm0 2.182c5.423 0 9.818 4.395 9.818 9.818 0 5.423-4.395 9.818-9.818 9.818-5.423 0-9.818-4.395-9.818-9.818 0-5.423 4.395-9.818 9.818-9.818z" />
                  </svg>
                  Add to Chrome
                  <span className="text-xs opacity-80">(Coming Soon)</span>
                </a>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Sign in or Create Account
                </h3>
                <p className="text-gray-600">
                  Click the extension icon and authenticate with Google or email
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Enter Your OPT Dates
                </h3>
                <p className="text-gray-600">
                  Add your program end date, OPT dates, and optional STEM extension dates
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  Track Your Timeline
                </h3>
                <p className="text-gray-600">
                  View your OPT countdown anytime by clicking the extension icon
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              💡 <strong>Tip:</strong> Pin the extension to your toolbar for quick access
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="container mx-auto px-4 py-8 text-center text-gray-600">
        <p>Made with 💙 for international students</p>
      </div>
    </div>
  );
}
