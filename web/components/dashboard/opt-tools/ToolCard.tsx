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
        group relative overflow-hidden rounded-2xl p-6 text-left text-white
        ${gradient}
        shadow-lg hover:shadow-2xl transition-all duration-300
        hover:scale-[1.02] 
        focus:outline-none focus:ring-2 focus:ring-white/50 focus:ring-offset-2
        dark:focus:ring-offset-gray-900
      `}
    >
      {/* Shine effect on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      
      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <div className="w-14 h-14 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center mb-4 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
          <span className="text-2xl [&>svg]:text-white [&>svg]:w-7 [&>svg]:h-7">
            {icon}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-2">
          {title}
        </h3>

        {/* Description */}
        <p className="text-sm text-white/80 mb-4 line-clamp-2">
          {description}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 text-sm font-medium text-white">
          <span>Open Tool</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform duration-300" />
        </div>
      </div>
    </button>
  );
}
