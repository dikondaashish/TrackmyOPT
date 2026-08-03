"use client";

import { Clock, ExternalLink } from "lucide-react";

export function UscisProcessingTimes() {
  // Hardcoded estimates for standard I-765 (OPT/STEM OPT) processing based on typical USCIS data.
  // In a full production scale, this could be fetched from a custom scraper/proxy API.
  const metrics = [
    {
      type: "Standard OPT (c)(3)(B)",
      time: "2 - 4 Months",
      percentage: 85,
    },
    {
      type: "STEM OPT (c)(3)(C)",
      time: "3 - 5 Months",
      percentage: 70,
    },
    {
      type: "Premium Processing (I-907)",
      time: "Within 30 Days",
      percentage: 100,
      highlight: true
    }
  ];

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="text-lg font-semibold tracking-tight text-foreground">USCIS Processing Times</h3>
        </div>
      </div>

      <p className="text-sm text-muted-foreground mb-6">
        Estimated processing times for Form I-765 (Potomac Service Center & Online).
      </p>

      <div className="space-y-5">
        {metrics.map((m, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${m.highlight ? 'text-blue-700 dark:text-blue-400' : 'text-foreground'}`}>
                {m.type}
              </span>
              <span className="font-semibold text-foreground">{m.time}</span>
            </div>
            <div className="h-2 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${m.highlight ? 'bg-blue-500' : 'bg-gray-400 dark:bg-gray-500'}`} 
                style={{ width: `${m.percentage}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{m.percentage}% processed within this timeframe</p>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-border">
        <a 
          href="https://egov.uscis.gov/processing-times/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          Check Official Tool
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
