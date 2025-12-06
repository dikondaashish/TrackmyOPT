"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  gradient: string;
  iconBg: string;
}

export function ToolCard({ title, description, icon, href, gradient, iconBg }: ToolCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={`
        group relative overflow-hidden rounded-2xl p-6 text-left
        bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800
        shadow-sm hover:shadow-xl transition-all duration-300
        hover:scale-[1.02] hover:border-transparent
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      `}
    >
      {/* Gradient overlay on hover */}
      <div 
        className={`
          absolute inset-0 opacity-0 group-hover:opacity-100 
          transition-opacity duration-300 ${gradient}
        `}
      />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className={`
          w-14 h-14 rounded-xl ${iconBg} 
          flex items-center justify-center mb-4
          group-hover:bg-white/20 transition-colors duration-300
        `}>
          <span className="text-2xl group-hover:scale-110 transition-transform duration-300">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-white transition-colors duration-300 mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-white/80 transition-colors duration-300 mb-4 line-clamp-2">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300">
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
        </div>
      </div>
    </button>
  );
}
