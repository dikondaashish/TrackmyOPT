"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle, CheckCircle2, Timer, Zap, Rocket, FileText, CheckSquare, Circle } from "lucide-react";

interface TickingClockProps {
  targetDate: Date;
  title: string;
  subtitle?: string;
  type?: 'deadline' | 'countdown' | 'remaining';
  gradient?: string;
  toolType?: 'opt-apply' | 'opt-clock' | 'stem-apply' | 'stem-clock';
  startDate?: Date; // When the period starts (to check if not started yet)
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
  gradient = 'from-blue-600 via-indigo-600 to-purple-600',
  startDate,
  toolType = 'opt-apply'
}: TickingClockProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [mounted, setMounted] = useState(false);
  const [isNotStarted, setIsNotStarted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      // Use Eastern Time for all OPT calculations
      const now = new Date();
      const etOptions = { timeZone: 'America/New_York' };

      // Get current time in ET
      const nowET = new Date(now.toLocaleString('en-US', etOptions));

      // Check if start date hasn't arrived yet
      if (startDate) {
        const startET = new Date(startDate.toLocaleString('en-US', etOptions));
        startET.setHours(0, 0, 0, 0);
        setIsNotStarted(nowET < startET);
      }

      // Target date at end of day in ET (11:59:59 PM)
      const targetET = new Date(targetDate.toLocaleString('en-US', etOptions));
      targetET.setHours(23, 59, 59, 999);

      const difference = targetET.getTime() - nowET.getTime();

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
  }, [targetDate, startDate]);

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

  // Dynamic message based on time remaining - always encourage early filing
  const getTimelineMessage = () => {
    // If dates haven't started yet
    if (isNotStarted) {
      if (toolType === 'opt-apply') return { icon: Clock, message: "Your OPT application window hasn't opened yet. Be prepared with your documents - I-20, passport photos, I-765 form. Check your earliest filing date below!", color: "text-blue-200" };
      if (toolType === 'stem-apply') return { icon: Clock, message: "Your STEM OPT application window hasn't opened yet. Be prepared with your docs - I-983 training plan, updated I-20, employer's E-Verify info!", color: "text-emerald-200" };
      return { icon: Clock, message: "Your dates haven't started yet. Check your start date below and prepare your documents!", color: "text-blue-200" };
    }

    // If deadline has passed
    if (isPassed) {
      if (toolType === 'opt-apply' || toolType === 'stem-apply') {
        return { icon: AlertTriangle, message: "Deadline has passed! Contact your DSO immediately, talk to an immigration attorney, or check your application status on USCIS.gov", color: "text-red-200" };
      }
      return { icon: AlertTriangle, message: "Period has ended. Contact your DSO or an immigration attorney if you have concerns about your status.", color: "text-red-200" };
    }

    if (isCritical) return { icon: Zap, message: "URGENT! Submit your application TODAY! You're at risk of missing the deadline!", color: "text-red-200" };
    if (isUrgent) return { icon: Rocket, message: "Time is running short! Submit now to avoid last-minute issues. USCIS processing takes 3-6 months!", color: "text-amber-200" };
    if (timeLeft.days <= 30) return { icon: FileText, message: "Apply soon! Early filers get processed faster. Don't wait - USCIS queues are long!", color: "text-blue-200" };
    if (timeLeft.days <= 60) return { icon: Rocket, message: "Great time to apply! Submit early to skip the long USCIS queue. Processing takes months!", color: "text-white/80" };
    return { icon: CheckSquare, message: "Perfect time to file early! Beat the rush - early applicants avoid delays and long wait times!", color: "text-white/70" };
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
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
          <div className={`px-4 py-2 rounded-full backdrop-blur-sm flex items-center gap-2 self-start sm:self-auto ${isPassed ? 'bg-green-500/30 text-green-100' :
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <TimeBlock value={timeLeft.days} label="Days" highlight={isCritical} />
          <TimeBlock value={timeLeft.hours} label="Hours" />
          <TimeBlock value={timeLeft.minutes} label="Minutes" />
          <TimeBlock value={timeLeft.seconds} label="Seconds" pulse />
        </div>

        {/* Dynamic Timeline Message */}
        <div className={`mt-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 ${timelineInfo.color}`}>
          <div className="flex items-start gap-3">
            <timelineInfo.icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
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
                className={`h-full rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-400' : isUrgent ? 'bg-amber-400' : 'bg-white'
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
    <div className={`text-center p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 ${highlight ? 'ring-2 ring-red-400/50' : ''
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
  gradient = 'from-blue-600 to-indigo-600',
  toolType = 'opt-apply',
  startDate
}: Omit<TickingClockProps, 'subtitle' | 'type'>) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 });
  const [mounted, setMounted] = useState(false);
  const [isNotStarted, setIsNotStarted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const calculateTimeLeft = () => {
      // Use Eastern Time for all OPT calculations
      const now = new Date();
      const etOptions = { timeZone: 'America/New_York' };

      // Get current time in ET
      const nowET = new Date(now.toLocaleString('en-US', etOptions));

      // Check if start date hasn't arrived yet
      if (startDate) {
        const startET = new Date(startDate.toLocaleString('en-US', etOptions));
        startET.setHours(0, 0, 0, 0);
        setIsNotStarted(nowET < startET);
      }

      // Target date at end of day in ET (11:59:59 PM)
      const targetET = new Date(targetDate.toLocaleString('en-US', etOptions));
      targetET.setHours(23, 59, 59, 999);

      const difference = targetET.getTime() - nowET.getTime();

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
  }, [targetDate, startDate]);

  if (!mounted) {
    return <div className="h-32 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse"></div>;
  }

  const isUrgent = timeLeft.days <= 14;
  const isCritical = timeLeft.days <= 7;
  const isPassed = timeLeft.total <= 0;

  // Get action items based on time remaining and tool type
  const getActionItems = () => {
    // If dates haven't started yet
    if (isNotStarted) {
      if (toolType === 'opt-apply') {
        return [
          "Window not open yet",
          "Prepare I-765 & I-20",
          "Get passport photos ready"
        ];
      }
      if (toolType === 'stem-apply') {
        return [
          "Window not open yet",
          "Prepare I-983 training plan",
          "Verify employer is E-Verify"
        ];
      }
      return [
        "Dates not started yet",
        "Prepare your documents",
        "Wait until window opens"
      ];
    }

    // If deadline has passed
    if (isPassed) {
      return [
        "Deadline has passed!",
        "Contact your DSO",
        "Talk to an attorney"
      ];
    }

    // OPT Apply specific action items - always encourage early filing
    if (toolType === 'opt-apply') {
      if (isCritical) return [
        "SUBMIT TO USCIS TODAY!",
        "Double-check I-765 form",
        "Contact DSO if not ready"
      ];
      if (isUrgent) return [
        "Submit NOW - don't delay!",
        "I-20 with OPT endorsement ready?",
        "USCIS-size photos (2x2 inches)"
      ];
      if (timeLeft.days <= 30) return [
        "Apply NOW - beat the queue!",
        "Get I-20 endorsed by DSO",
        "Prepare $470+ filing fee"
      ];
      if (timeLeft.days <= 60) return [
        "Apply early - avoid 3-6 month delays!",
        "Request I-20 from DSO today",
        "Get 2x2 inch passport photos"
      ];
      return [
        "File early - skip the long queue!",
        "Request I-20 from DSO ASAP",
        "Review I-765 form instructions"
      ];
    }

    // OPT Clock specific action items
    if (toolType === 'opt-clock') {
      if (isCritical) return [
        "Unemployment limit almost reached!",
        "Secure employment immediately",
        "Contact DSO for guidance"
      ];
      if (isUrgent) return [
        "Actively search for jobs",
        "Update resume & LinkedIn",
        "Apply to multiple positions"
      ];
      return [
        "Track employment periods",
        "Maintain employment records",
        "Monitor unemployment days"
      ];
    }

    // STEM Apply specific action items
    if (toolType === 'stem-apply') {
      if (isCritical) return [
        "Submit STEM extension NOW!",
        "I-983 training plan ready?",
        "Confirm E-Verify with employer"
      ];
      if (isUrgent) return [
        "File early - don't wait!",
        "Complete I-983 with employer",
        "Verify employer E-Verify status"
      ];
      return [
        "Prepare I-983 training plan",
        "Confirm employer E-Verify",
        "Update I-20 for STEM"
      ];
    }

    // STEM Clock specific action items
    if (toolType === 'stem-clock') {
      if (isCritical) return [
        "60-day limit approaching!",
        "Find E-Verify job urgently",
        "Contact DSO for options"
      ];
      return [
        "Track STEM unemployment",
        "Maintain E-Verify employment",
        "Report changes to DSO"
      ];
    }

    // Default fallback
    return [
      "Track your deadlines",
      "Organize documents",
      "Check USCIS.gov"
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
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium mb-3 ${isPassed ? 'bg-green-500/30 text-green-100' :
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
              <p key={index} className="text-xs text-white/90 flex items-start gap-2">
                <Circle className="w-2 h-2 shrink-0 mt-1 fill-current opacity-70" />
                <span>{item}</span>
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
