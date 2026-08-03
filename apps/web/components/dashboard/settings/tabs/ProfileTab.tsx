"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Moon,
  Sun,
  Loader2,
  AlertCircle,
  Globe,
  GraduationCap,
  CheckCircle2} from "lucide-react";
import type { Dispatch, SetStateAction } from "react";
import type { UserProfile } from "../settings-types";
import { Toggle } from "../SettingsToggle";
import { COMMON_MAJORS, STEM_KEYWORDS } from "../settings-constants";

interface ProfileTabProps {
  darkMode: boolean;
  handleDarkModeToggle: () => void;
  handleSaveProfile: () => Promise<void>;
  hasReferralAccess: boolean;
  isSaving: boolean;
  profile: UserProfile;
  setProfile: Dispatch<SetStateAction<UserProfile>>;
  setShowMajorDropdown: Dispatch<SetStateAction<boolean>>;
  showMajorDropdown: boolean;
}

export function ProfileTab({
  darkMode,
  handleDarkModeToggle,
  handleSaveProfile,
  hasReferralAccess,
  isSaving,
  profile,
  setProfile,
  setShowMajorDropdown,
  showMajorDropdown,
}: ProfileTabProps) {
  const filteredMajors = profile.majorName 
      ? COMMON_MAJORS.filter(m => m.toLowerCase().includes(profile.majorName!.toLowerCase()))
      : COMMON_MAJORS;

  const checkStemEligibility = (major: string | null) => {
      if (!major) return false;
      const lowerMajor = major.toLowerCase();
      return STEM_KEYWORDS.some(keyword => lowerMajor.includes(keyword));
    };

  const timezones = [
      { value: "America/New_York", label: "Eastern Time (ET)" },
      { value: "America/Chicago", label: "Central Time (CT)" },
      { value: "America/Denver", label: "Mountain Time (MT)" },
      { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
      { value: "America/Anchorage", label: "Alaska Time (AKT)" },
      { value: "Pacific/Honolulu", label: "Hawaii Time (HT)" },
      { value: "UTC", label: "UTC" },
    ];

  return (
    (
          <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 mb-8 text-center sm:text-left">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                {profile.fullName ? profile.fullName.charAt(0).toUpperCase() : profile.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  {profile.fullName || 'Your Name'}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email}</p>
              </div>
            </div>

            <div className="space-y-6 max-w-xl">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={profile.fullName}
                  onChange={(e) => setProfile({ ...profile, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="h-11"
                />
              </div>

              {/* Email (Read Only) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={profile.email}
                  disabled
                  className="h-11 bg-gray-50 dark:bg-gray-900 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Timezone
                  </div>
                </label>
                <select
                  value={profile.timezone}
                  onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                  className="w-full h-11 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {timezones.map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-1">Education Profile</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Please check the <strong>CIP Code</strong> on your Form I-20 to confirm official STEM OPT eligibility with DHS.</p>

                <div className="space-y-6">
                  {/* Degree Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Degree Level
                      </div>
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['Associate', "Bachelor's", "Master's", 'Doctorate'].map((level) => (
                        <button
                          key={level}
                          onClick={() => setProfile({ ...profile, degreeLevel: level })}
                          className={`p-2 rounded-lg border text-sm font-medium transition-colors ${
                            profile.degreeLevel === level
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Major */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Major / Course Name
                    </label>
                    <Input
                      type="text"
                      value={profile.majorName || ''}
                      onChange={(e) => {
                        const newMajor = e.target.value;
                        setProfile({
                          ...profile,
                          majorName: newMajor,
                          isStemEligible: checkStemEligibility(newMajor)
                        });
                        setShowMajorDropdown(true);
                      }}
                      onFocus={() => setShowMajorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMajorDropdown(false), 200)}
                      placeholder="e.g. Computer Science"
                      className="h-11"
                    />

                    {showMajorDropdown && filteredMajors.length > 0 && (
                      <ul className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {filteredMajors.map((major) => (
                          <li 
                            key={major}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 transition-colors"
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={() => {
                              setProfile({
                                ...profile,
                                majorName: major,
                                isStemEligible: checkStemEligibility(major)
                              });
                              setShowMajorDropdown(false);
                            }}
                          >
                            {major}
                          </li>
                        ))}
                      </ul>
                    )}

                    {/* STEM Status indicator */}
                    {(profile.majorName || '').length > 2 && (
                      <div className="mt-3">
                        <div className={`p-3 rounded-lg flex items-center justify-between transition-colors ${
                          profile.isStemEligible 
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/50 dark:text-emerald-300' 
                            : 'bg-amber-50 border border-amber-200 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/50 dark:text-amber-300'
                        }`}>
                          <div className="flex items-center gap-2">
                            {profile.isStemEligible ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                            )}
                            <span className="text-sm font-medium">
                              {profile.isStemEligible ? 'STEM Extension Eligible' : 'Non-STEM Program'}
                            </span>
                          </div>
                          
                          {/* Force toggle toggle */}
                          <div className="flex items-center gap-2">
                            <span className="text-xs opacity-70">Force override:</span>
                            <button 
                              onClick={() => setProfile({...profile, isStemEligible: !profile.isStemEligible})}
                              className={`text-xs px-2 py-1 rounded transition-colors ${
                                profile.isStemEligible 
                                  ? 'bg-emerald-200 text-emerald-900 hover:bg-emerald-300 dark:bg-emerald-800 dark:text-emerald-100'
                                  : 'bg-amber-200 text-amber-900 hover:bg-amber-300 dark:bg-amber-800 dark:text-amber-100'
                              }`}
                            >
                              {profile.isStemEligible ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className="bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 h-11 px-6"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>

              {/* Appearance Section (Moved from separate tab) */}
              <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Appearance</h3>
                <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                      {darkMode ? (
                        <Moon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      ) : (
                        <Sun className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Dark Mode</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {darkMode ? 'Currently using dark theme' : 'Currently using light theme'}
                      </p>
                    </div>
                  </div>
                  <Toggle enabled={darkMode} onToggle={handleDarkModeToggle} />
                </div>
              </div>

              {/* Referral Program Access (shown only for users with a referral code) */}
              {hasReferralAccess && (
                <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Referral Program</h3>
                  <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-gray-100">Referral Stats</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        View clicks, signups, and premium conversions for your referral code.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => window.location.href = "/dashboard/referrals"}
                      className="h-10"
                    >
                      View Referral Stats
                    </Button>
                  </div>
                </div>
              )}

            </div>
          </div>
        )
  );
}
