import { useState, useEffect } from "react";

interface UsageStats {
  jobsCount: number;
}

export function SubscriptionUsage() {
  const [stats, setStats] = useState<UsageStats>({ jobsCount: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const res = await fetch("/api/user/usage");
        if (res.ok) {
          const data = await res.json();
          setStats({ jobsCount: data.jobsCount || 0 });
        }
      } catch (error) {
        console.error("Failed to fetch usage stats", error);
      } finally {
        setLoading(false);
      }
    }
    fetchUsage();
  }, []);

  if (loading) return null;

  return (
    <div className="space-y-1">
      <h4 className="text-xs font-medium uppercase text-gray-500 dark:text-gray-400 tracking-wide">
        Job tracker
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {stats.jobsCount}
        </span>{" "}
        application{stats.jobsCount === 1 ? "" : "s"} tracked
      </p>
    </div>
  );
}
