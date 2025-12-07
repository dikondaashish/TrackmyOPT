"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Timer, TrendingDown, Briefcase, Rocket, Building2, Heart, Zap } from "lucide-react";

interface UnemploymentClockProps {
  daysUsed: number;
  maxDays: number;
  title: string;
  subtitle?: string;
  gradient?: string;
  type?: 'opt' | 'stem';
}

export function UnemploymentClock({ 
  daysUsed, 
  maxDays,
  title, 
  subtitle,
  gradient = 'from-amber-500 via-orange-500 to-red-500',
  type = 'opt'
}: UnemploymentClockProps) {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  
  const remaining = Math.max(0, maxDays - daysUsed);
  const percentage = Math.min(100, (daysUsed / maxDays) * 100);
  
  useEffect(() => {
    setMounted(true);
    
    // Countdown until end of day in Eastern Time
    const updateCountdown = () => {
      // Get current time in Eastern Time
      const now = new Date();
      const etOptions = { timeZone: 'America/New_York' };
      const etTimeStr = now.toLocaleString('en-US', { ...etOptions, hour12: false });
      const etParts = etTimeStr.split(', ')[1].split(':');
      const etHours = parseInt(etParts[0]);
      const etMinutes = parseInt(etParts[1]);
      const etSeconds = parseInt(etParts[2]);
      
      // Calculate time remaining until midnight ET
      const hoursLeft = 23 - etHours;
      const minutesLeft = 59 - etMinutes;
      const secondsLeft = 59 - etSeconds;
      
      setCountdown({
        hours: hoursLeft,
        minutes: minutesLeft,
        seconds: secondsLeft
      });
    };
    
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return (
      <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradient} p-8 shadow-2xl`}>
        <div className="animate-pulse">
          <div className="h-8 bg-white/20 rounded w-48 mb-4"></div>
          <div className="h-24 bg-white/20 rounded"></div>
        </div>
      </div>
    );
  }

  const isUrgent = remaining <= 30;
  const isCritical = remaining <= 10;
  const StatusIcon = isCritical ? AlertTriangle : isUrgent ? TrendingDown : CheckCircle2;
  
  // Use consistent amber/orange gradient for OPT, purple/violet for STEM
  const baseGradient = type === 'opt' 
    ? 'from-amber-500 via-orange-500 to-orange-600'
    : 'from-purple-500 via-violet-500 to-violet-600';

  // Dynamic message based on days remaining - job search guidance
  const getTimelineMessage = () => {
    if (type === 'opt') {
      if (remaining <= 0) return { icon: AlertTriangle, message: "⚠️ Unemployment limit exceeded! Contact your DSO immediately.", color: "text-red-200" };
      if (remaining <= 10) return { icon: Zap, message: "⚡ CRITICAL! Apply to ANY job NOW - unpaid internships, volunteer work, anything OPT-eligible!", color: "text-red-200" };
      if (remaining <= 30) return { icon: Heart, message: "💼 Apply to unpaid internships & volunteer positions to stop your clock immediately!", color: "text-amber-200" };
      if (remaining <= 50) return { icon: Heart, message: "🚀 Time to expand your search! Apply to startups, unpaid internships & volunteer jobs.", color: "text-amber-200" };
      if (remaining <= 60) return { icon: Rocket, message: "🎯 Apply to startups from YC, Techstars & other accelerators - they hire quickly!", color: "text-white/90" };
      if (remaining <= 80) return { icon: Rocket, message: "💡 Great time for startups! Apply to early-stage companies - faster hiring process.", color: "text-white/90" };
      return { icon: Building2, message: "✨ You have good time! Apply to MNCs & big companies - you can wait for their process.", color: "text-white/80" };
    }
    // STEM type - 150 days limit
    if (remaining <= 0) return { icon: AlertTriangle, message: "⚠️ Aggregate unemployment limit exceeded! Contact DSO.", color: "text-red-200" };
    if (remaining <= 20) return { icon: Zap, message: "⚡ CRITICAL! Secure employment immediately to maintain status!", color: "text-red-200" };
    if (remaining <= 50) return { icon: Heart, message: "🚀 Apply broadly - startups, contract work, anything STEM-eligible!", color: "text-amber-200" };
    if (remaining <= 100) return { icon: Rocket, message: "💡 Keep applying actively - explore startups and growing companies.", color: "text-white/90" };
    return { icon: Building2, message: "✨ Good position! Apply to companies of all sizes - you have time.", color: "text-white/80" };
  };

  const timelineInfo = getTimelineMessage();

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${baseGradient} p-8 shadow-2xl`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
        
        {/* Animated rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
          <div className="absolute inset-0 rounded-full border-4 border-white/10 animate-ping" style={{ animationDuration: '3s' }}></div>
          <div className="absolute inset-4 rounded-full border-2 border-white/5 animate-ping" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
        </div>
        
        {/* Floating particles */}
        <div className="absolute top-10 left-20 w-2 h-2 bg-white/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
        <div className="absolute top-20 right-32 w-1.5 h-1.5 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '4s' }}></div>
        <div className="absolute bottom-16 left-40 w-1 h-1 bg-white/25 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '3.5s' }}></div>
      </div>
      
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Timer className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">{title}</h3>
              {subtitle && <p className="text-sm text-white/70">{subtitle}</p>}
            </div>
          </div>
          
          {/* Status indicator */}
          <div className={`px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 ${
            isCritical ? 'bg-red-900/40 text-red-100' :
            isUrgent ? 'bg-amber-900/40 text-amber-100' :
            'bg-white/20 text-white'
          }`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isCritical ? 'Critical!' : isUrgent ? 'Caution' : 'On Track'}
            </span>
          </div>
        </div>

        {/* Main display - Days Remaining with live clock */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Days Remaining - Big number */}
          <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className={`text-6xl sm:text-7xl font-bold text-white tabular-nums ${isCritical ? 'animate-pulse' : ''}`}>
              {remaining}
            </div>
            <div className="text-sm text-white/80 mt-2 uppercase tracking-wider">Days Left</div>
          </div>
          
          {/* Countdown Timer - Time left today (ET) */}
          <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
            <div className="flex items-center justify-center gap-1 text-white">
              <span className="text-4xl sm:text-5xl font-bold tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
              <span className="text-3xl font-bold animate-pulse">:</span>
              <span className="text-4xl sm:text-5xl font-bold tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
              <span className="text-3xl font-bold animate-pulse">:</span>
              <span className="text-3xl font-bold tabular-nums animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
            </div>
            <div className="text-sm text-white/80 mt-2 uppercase tracking-wider">Time Left Today (ET)</div>
          </div>
        </div>

        {/* Dynamic Timeline Message */}
        <div className="mb-6 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <timelineInfo.icon className="w-5 h-5 text-white" />
            </div>
            <p className={`text-sm leading-relaxed ${timelineInfo.color}`}>
              {timelineInfo.message}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div>
          <div className="flex justify-between text-xs text-white/80 mb-2">
            <span>{daysUsed} days used</span>
            <span>{remaining} days remaining</span>
          </div>
          <div className="h-4 bg-white/20 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-1000 relative overflow-hidden ${
                isCritical ? 'bg-red-300' : isUrgent ? 'bg-amber-300' : 'bg-white'
              }`}
              style={{ width: `${percentage}%` }}
            >
              {/* Animated shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <div className="flex justify-between text-xs text-white/60 mt-1">
            <span>0 days</span>
            <span>{maxDays} days max</span>
          </div>
        </div>
      </div>
      
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  );
}

// Compact version for sidebar with action items
export function UnemploymentClockCompact({ 
  daysUsed, 
  maxDays,
  title,
  type = 'opt'
}: Omit<UnemploymentClockProps, 'subtitle' | 'gradient'>) {
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);
  
  const remaining = Math.max(0, maxDays - daysUsed);
  const isCritical = remaining <= 10;
  const isUrgent = remaining <= 30;

  useEffect(() => {
    setMounted(true);
    // Countdown until end of day in Eastern Time
    const updateCountdown = () => {
      const now = new Date();
      const etOptions = { timeZone: 'America/New_York' };
      const etTimeStr = now.toLocaleString('en-US', { ...etOptions, hour12: false });
      const etParts = etTimeStr.split(', ')[1].split(':');
      const etHours = parseInt(etParts[0]);
      const etMinutes = parseInt(etParts[1]);
      const etSeconds = parseInt(etParts[2]);
      
      setCountdown({
        hours: 23 - etHours,
        minutes: 59 - etMinutes,
        seconds: 59 - etSeconds
      });
    };
    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!mounted) {
    return <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>;
  }

  // Use consistent amber/orange gradient for OPT, purple/violet for STEM
  const gradient = type === 'opt' 
    ? 'from-amber-500 to-orange-500'
    : 'from-purple-500 to-violet-500';

  // Get action items based on days remaining
  const getActionItems = () => {
    if (type === 'opt') {
      if (isCritical) return [
        "⚠️ URGENT - Find a job NOW!",
        "📞 Contact DSO immediately",
        "💼 Apply to any OPT-eligible job"
      ];
      if (isUrgent) return [
        "🚀 Actively apply for jobs!",
        "📝 Update resume & LinkedIn",
        "💼 Network and reach out to employers"
      ];
      if (remaining <= 60) return [
        "💼 Keep job searching active",
        "📋 Track your applications",
        "🔍 Apply for internships too"
      ];
      return [
        "✅ Great! Keep employed",
        "📊 Track employment gaps",
        "💼 Maintain job records"
      ];
    }
    // STEM type
    if (isCritical) return [
      "⚠️ 150-day limit critical!",
      "💼 Secure employment ASAP",
      "📞 Contact DSO for options"
    ];
    if (isUrgent) return [
      "🚀 Find employment quickly!",
      "📝 Apply to multiple jobs",
      "💼 Consider contract work"
    ];
    return [
      "✅ Track aggregate days",
      "💼 Maintain employment",
      "📊 Report changes to DSO"
    ];
  };

  const actionItems = getActionItems();

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Timer className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        
        <div className="flex items-baseline gap-2 text-white mb-3">
          <span className="text-4xl font-bold tabular-nums">{remaining}</span>
          <span className="text-sm opacity-70">days left</span>
        </div>
        
        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
          isCritical ? 'bg-red-500/30 text-red-100' :
          isUrgent ? 'bg-amber-900/30 text-amber-100' :
          'bg-white/20 text-white'
        }`}>
          {isCritical ? <AlertTriangle className="w-3 h-3" /> : isUrgent ? <TrendingDown className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
          {isCritical ? 'Critical!' : isUrgent ? 'Act Now!' : 'On Track'}
        </div>
        
        {/* Countdown Timer (ET) */}
        <div className="flex items-center gap-1 text-white/70 text-sm mb-3">
          <span className="tabular-nums">{String(countdown.hours).padStart(2, '0')}</span>
          <span className="animate-pulse">:</span>
          <span className="tabular-nums">{String(countdown.minutes).padStart(2, '0')}</span>
          <span className="animate-pulse">:</span>
          <span className="tabular-nums animate-pulse">{String(countdown.seconds).padStart(2, '0')}</span>
          <span className="text-xs ml-1 opacity-60">left today</span>
        </div>

        {/* Action Items */}
        <div className="space-y-1.5 pt-3 border-t border-white/20">
          <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Next Steps</p>
          {actionItems.map((item, index) => (
            <p key={index} className="text-xs text-white/90">{item}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
