"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center space-y-8 rounded-xl border border-border bg-card px-6 py-10 shadow-elevated sm:px-10">
        <div className="space-y-3">
          <h1 className="text-6xl font-bold text-primary tabular-nums">
            404
          </h1>
          <h2 className="text-2xl font-bold text-foreground">
            Lost your way?
          </h2>
          <p className="text-muted-foreground leading-relaxed">
             We couldn't find the page you're looking for. It might have been moved, deleted, or perhaps you just took a wrong turn navigating the immigration maze.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto px-8 gap-2">
            <Link href="/dashboard">
              <Home className="w-4 h-4" />
              Go to Dashboard
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto px-8">
            <Link href="/">
              Return Home
            </Link>
          </Button>
        </div>
        
        <div className="border-t border-border pt-6">
          <p className="text-xs text-muted-foreground">
            If you believe you reached this page in error, please contact support.
          </p>
        </div>
      </div>
    </div>
  );
}
