"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, Timer, Zap, Coffee, Rocket, FileText, Upload, CheckSquare } from "lucide-react";

interface TickingClockProps {
  targetDate: Date;
  title: string;
  subtitle?: string;
  type?: 'deadline' | 'countdown' | 'remaining';
  gradient?: string;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export function TickingClock({ 
  targetDate, 
  title, 
  subtitle,
  type = 'deadline',
  gradient = 'from-blue-600 via-indigo-600 to-purple-600'
}: TickingClockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

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

  const isUrgent = timeLeft.days <= 14;
  const isCritical = timeLeft.days <= 7;
  const isPassed = timeLeft.total <= 0;

  const StatusIcon = isPassed ? CheckCircle2 : isCritical ? AlertTriangle : Clock;

  // Dynamic message based on time remaining
  const getTimelineMessage = () => {
    if (isPassed) return { icon: CheckCircle2, message: "Deadline has passed. Check your application status.", color: "text-green-200" };
    if (isCritical) return { icon: Zap, message: "⚡ Hurry up! Time is running out. Submit your application immediately!", color: "text-red-200" };
    if (isUrgent) return { icon: Rocket, message: "🚀 Act fast! You should finalize and submit your documents soon.", color: "text-amber-200" };
    if (timeLeft.days <= 30) return { icon: FileText, message: "📋 Good pace! Start gathering your documents and prepare for submission.", color: "text-blue-200" };
    if (timeLeft.days <= 60) return { icon: Coffee, message: "☕ You have time. Begin organizing your documents at a comfortable pace.", color: "text-white/80" };
    return { icon: CheckSquare, message: "✨ Plenty of time! Plan ahead and gather all required documents systematically.", color: "text-white/70" };
  };

  const timelineInfo = getTimelineMessage();

  return (
    <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-r ${gradient} p-8 shadow-2xl`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full translate-y-32 -translate-x-32"></div>
        <div className="absolute top-1/2 left-1/2 w-32 h-32 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        
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
            isPassed ? 'bg-green-500/30 text-green-100' :
            isCritical ? 'bg-red-500/30 text-red-100' :
            isUrgent ? 'bg-amber-500/30 text-amber-100' :
            'bg-white/20 text-white'
          }`}>
            <StatusIcon className="w-4 h-4" />
            <span className="text-sm font-medium">
              {isPassed ? 'Completed' : isCritical ? 'Critical' : isUrgent ? 'Urgent' : 'On Track'}
            </span>
          </div>
        </div>

        {/* Main countdown display */}
        <div className="grid grid-cols-4 gap-4">
          <TimeBlock value={timeLeft.days} label="Days" highlight={isCritical} />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Seconds" pulse />
        </div>

        {/* Dynamic Timeline Message */}
        <div className={`mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 ${timelineInfo.color}`}>
          <div className="flex items-center gap-3">
            <timelineInfo.icon className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{timelineInfo.message}</p>
          </div>
        </div>

        {/* Progress bar */}
        {!isPassed && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-white/60 mb-2">
              <span>Time remaining</span>
              <span>{timeLeft.days} days left</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isCritical ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-white'
                }`}
                style={{ width: `${Math.max(5, Math.min(100, (timeLeft.days / 90) * 100))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TimeBlock({ value, label, highlight = false, pulse = false }: { 
  value: number; 
  label: string; 
  highlight?: boolean;
  pulse?: boolean;
}) {
  return (
    <div className={`text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${
      highlight ? 'ring-2 ring-red-400/50' : ''
    }`}>
      <div className={`text-4xl sm:text-5xl font-bold text-white tabular-nums ${pulse ? 'animate-pulse' : ''}`}>
        {String(value).padStart(2, '0')}
      </div>
      <div className="text-xs sm:text-sm text-white/70 mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

// Compact version for sidebar or smaller spaces
export function TickingClockCompact({ 
  targetDate, 
  title,
  gradient = 'from-blue-600 to-indigo-600'
}: Omit<TickingClockProps, 'subtitle' | 'type'>) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds, total: difference });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!mounted) {
    return <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>;
  }

  const isUrgent = timeLeft.days <= 14;
  const isCritical = timeLeft.days <= 7;
  const isPassed = timeLeft.total <= 0;

  // Get action items based on time remaining
  const getActionItems = () => {
    if (isPassed) return [];
    if (isCritical) return [
      "⚡ Submit application NOW",
      "📞 Contact DSO if needed",
      "✅ Double-check all forms"
    ];
    if (isUrgent) return [
      "📄 Finalize all documents",
      "💳 Prepare filing fee",
      "📮 Choose mailing method"
    ];
    if (timeLeft.days <= 30) return [
      "📋 Gather required documents",
      "📸 Get passport photos",
      "✍️ Complete I-765 form"
    ];
    if (timeLeft.days <= 60) return [
      "📖 Review requirements",
      "📁 Organize documents",
      "💼 Update employment info"
    ];
    return [
      "📅 Mark deadline in calendar",
      "📝 Create document checklist",
      "🔍 Research filing process"
    ];
  };

  const actionItems = getActionItems();

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradient} p-5 shadow-lg`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-white/80" />
          <span className="text-sm font-medium text-white/80">{title}</span>
        </div>
        
        <div className="flex items-baseline gap-1 text-white mb-4">
          <span className="text-3xl font-bold tabular-nums">{timeLeft.days}</span>
          <span className="text-sm opacity-70">d</span>
          <span className="text-2xl font-bold tabular-nums ml-1">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="text-sm opacity-70">h</span>
          <span className="text-2xl font-bold tabular-nums ml-1">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="text-sm opacity-70">m</span>
          <span className="text-xl font-bold tabular-nums ml-1 animate-pulse">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="text-sm opacity-70">s</span>
        </div>

        {/* Status Badge */}
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${
          isPassed ? 'bg-green-500/30 text-green-100' :
          isCritical ? 'bg-red-500/30 text-red-100' :
          isUrgent ? 'bg-amber-500/30 text-amber-100' :
          'bg-white/20 text-white'
        }`}>
          {isPassed ? <CheckCircle2 className="w-3 h-3" /> : isCritical ? <AlertTriangle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
          {isPassed ? 'Done' : isCritical ? 'Critical!' : isUrgent ? 'Act Now!' : 'On Track'}
        </div>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-white/20">
            <p className="text-xs text-white/60 uppercase tracking-wider mb-2">Next Steps</p>
            {actionItems.map((item, index) => (
              <p key={index} className="text-xs text-white/90">{item}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
