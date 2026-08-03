"use client";

import { SubscriptionSettings } from "../SubscriptionSettings";

import type { PremiumStatus, UserProfile } from "../settings-types";

interface SubscriptionTabProps {
  handleManageSubscription: () => Promise<void>;
  isLoading: boolean;
  premium: PremiumStatus;
  profile: UserProfile;
}

export function SubscriptionTab({
  handleManageSubscription,
  isLoading,
  premium,
  profile,
}: SubscriptionTabProps) {

  return (
    (
          <div className="p-6 sm:p-8">
            <div className="max-w-6xl">
              <SubscriptionSettings
                premium={premium}
                isLoading={isLoading}
                onManage={handleManageSubscription}
                userEmail={profile.email}
              />
            </div>
          </div>
        )
  );
}
