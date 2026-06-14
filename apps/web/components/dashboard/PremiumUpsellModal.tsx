'use client';

/**
 * Premium Upsell Modal
 * 
 * Shown to non-premium users when accessing premium features
 */

import type { LucideIcon } from "lucide-react";
import { BarChart3, Clock, Crown, Key, Lock, Mail, ScanLine } from "lucide-react";

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
          <Crown className="w-10 h-10 text-white" />
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
            icon={Lock}
            title="Secure Document Storage"
            description="Store all your immigration documents in one encrypted vault"
          />
          <Feature
            icon={ScanLine}
            title="AI-Powered Analysis"
            description="Automatic document classification and metadata extraction using Gemini AI"
          />
          <Feature
            icon={Clock}
            title="Expiry Reminders"
            description="Never miss a renewal with automatic expiry notifications"
          />
          <Feature
            icon={BarChart3}
            title="Smart Organization"
            description="Search, filter, and categorize all your documents effortlessly"
          />
          <Feature
            icon={Key}
            title="Passcode Protection"
            description="Extra security layer with 6-digit PIN and lockout protection"
          />
          <Feature
            icon={Mail}
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
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4 items-start">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-cyan-700">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
    </div>
  );
}
