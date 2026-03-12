"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Compass, MapPin } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        {/* Animated Icon */}
        <div className="relative w-32 h-32 mx-auto">
          <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-75"></div>
          <div className="relative bg-background border-4 border-primary/20 rounded-full w-full h-full flex items-center justify-center shadow-2xl">
            <Compass className="w-16 h-16 text-primary animate-[spin_10s_linear_infinite]" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-background rounded-full p-2 border border-border shadow-lg">
            <MapPin className="w-6 h-6 text-emerald-500" />
          </div>
        </div>

        <div className="space-y-3">
          <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-br from-primary to-primary/50">
            404
          </h1>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Lost your way?
          </h2>
          <p className="text-muted-foreground leading-relaxed px-4">
             We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you just took a wrong turn navigating the immigration maze.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="rounded-full w-full sm:w-auto px-8 gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-full w-full sm:w-auto px-8">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
        
        <div className="pt-8 border-t border-border mt-8">
          <p className="text-xs text-muted-foreground">
            If you believe you reached this page in error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
