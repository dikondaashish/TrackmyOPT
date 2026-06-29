'use client';

/**
 * Premium Upsell Modal
 * 
 * Shown to non-premium users when accessing premium features
 */

interface PremiumUpsellModalProps {
  open: boolean;
  onClose: () => void;
  feature: string;
}

export function PremiumUpsellModal({ open, onClose, feature }: PremiumUpsellModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-8">
        {/* Premium Badge */}
        <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Title */}
        <h2 className="text-3xl font-bold text-center mb-2">
          {feature} is a Premium Feature
        </h2>
        <p className="text-gray-600 text-center mb-8">
          Upgrade to Premium to unlock secure document storage with AI-powered analysis
        </p>

        {/* Features */}
        <div className="space-y-4 mb-8">
          <Feature
            icon="🔐"
            title="Secure Document Storage"
            description="Store all your immigration documents in one encrypted vault"
          />
          <Feature
            icon="🤖"
            title="AI-Powered Analysis"
            description="Automatic document classification and metadata extraction using Gemini AI"
          />
          <Feature
            icon="⏰"
            title="Expiry Reminders"
            description="Never miss a renewal with automatic expiry notifications"
          />
          <Feature
            icon="📊"
            title="Smart Organization"
            description="Search, filter, and categorize all your documents effortlessly"
          />
          <Feature
            icon="🔒"
            title="Passcode Protection"
            description="Extra security layer with 6-digit PIN and lockout protection"
          />
          <Feature
            icon="📧"
            title="Email Notifications"
            description="Get notified about expiring documents and status changes"
          />
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-lg p-6 mb-6 text-center">
          <div className="text-4xl font-bold text-gray-900 mb-2">
            $9.99<span className="text-lg text-gray-600">/month</span>
          </div>
          <p className="text-gray-600">or $99.99/year (save 17%)</p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Maybe Later
          </button>
          <button
            onClick={() => window.location.href = '/dashboard/premium'}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-colors font-medium"
          >
            Upgrade to Premium
          </button>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-3xl flex-shrink-0">{icon}</div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}

