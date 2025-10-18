"use client";
import { Calendar, GraduationCap, Clock, Package, ExternalLink } from "lucide-react";

interface ToolCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  available: boolean;
  href?: string;
}

function ToolCard({ icon, title, description, available, href }: ToolCardProps) {
  const CardContent = (
    <div
      className={`bg-card border border-border rounded-xl p-6 transition-all duration-200 group ${
        available 
          ? "hover:border-primary/30 hover:shadow-lg cursor-pointer hover:-translate-y-1" 
          : "opacity-60 cursor-not-allowed"
      }`}
      role="button"
      tabIndex={available ? 0 : -1}
      aria-disabled={!available}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        {available && (
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        )}
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2 group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );

  if (available && href) {
    return (
      <a href={href} className="block">
        {CardContent}
      </a>
    );
  }

  return CardContent;
}

export function ToolsGrid() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">Your Toolkit</h2>
        <p className="text-sm text-muted-foreground">Essential tools for your OPT journey</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ToolCard 
          icon={<Calendar className="w-6 h-6" />} 
          title="OPT Apply Start Dates" 
          description="Calculate when you can start applying for OPT based on your program end date" 
          available={true}
          href="/extension"
        />
        <ToolCard 
          icon={<GraduationCap className="w-6 h-6" />} 
          title="STEM OPT Apply Start Dates" 
          description="Calculate STEM OPT extension application dates for your extension period" 
          available={true}
          href="/extension"
        />
        <ToolCard 
          icon={<Clock className="w-6 h-6" />} 
          title="OPT Clock Tracker" 
          description="Track your unemployment days in real-time with precision countdown timers" 
          available={true}
          href="/extension"
        />
        <ToolCard 
          icon={<Package className="w-6 h-6" />} 
          title="More Tools Coming" 
          description="Stay tuned for additional OPT resources and features" 
          available={false}
        />
      </div>
    </div>
  );
}

