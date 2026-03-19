"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Link as LinkIcon, Users, MousePointerClick, Crown, TrendingUp, Sparkles, ExternalLink } from "lucide-react";

interface ReferralRow {
  code: string;
  name: string;
  owner_email: string;
  clicks: number;
  signups: number;
  premium_conversions: number;
  is_active: boolean;
  created_at: string;
}

export default function ReferralStatsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<ReferralRow[]>([]);
  const [ownerEmail, setOwnerEmail] = useState<string>("");
  const [hasAccess, setHasAccess] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetch("/api/referral/my-stats", {
          credentials: "include",
          cache: "no-store",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error || "Failed to load referral stats");
        }
        setOwnerEmail(data.ownerEmail || "");
        setHasAccess(!!data.hasAccess);
        setRows(data.data || []);
      } catch (err: any) {
        setError(err?.message || "Failed to load referral stats");
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        acc.clicks += row.clicks || 0;
        acc.signups += row.signups || 0;
        acc.premium += row.premium_conversions || 0;
        return acc;
      },
      { clicks: 0, signups: 0, premium: 0 }
    );
  }, [rows]);

  const metrics = useMemo(() => {
    const signupRate = totals.clicks > 0 ? (totals.signups / totals.clicks) * 100 : 0;
    const premiumRate = totals.signups > 0 ? (totals.premium / totals.signups) * 100 : 0;
    const topCode = rows.reduce<ReferralRow | null>((best, current) => {
      if (!best) return current;
      return (current.clicks || 0) > (best.clicks || 0) ? current : best;
    }, null);

    return {
      signupRate,
      premiumRate,
      topCode,
    };
  }, [rows, totals.clicks, totals.signups, totals.premium]);

  const handleCopy = async (code: string) => {
    const link = `https://www.trackmyopt.com/?ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  const formatRate = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading referral stats...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!hasAccess) {
    return (
      <div className="rounded-xl border bg-card p-6">
        <h1 className="text-xl font-semibold mb-2">Referral Stats</h1>
        <p className="text-sm text-muted-foreground">
          You do not have an active referral code assigned to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referral Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View referral performance for codes owned by {ownerEmail || "your account"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl border p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MousePointerClick className="w-4 h-4" /> Total Clicks
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.clicks}</div>
        </div>
        <div className="rounded-xl border p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" /> Total Signups
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.signups}</div>
          <p className="text-xs text-muted-foreground mt-1">Signup rate: {formatRate(metrics.signupRate)}</p>
        </div>
        <div className="rounded-xl border p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Crown className="w-4 h-4" /> Premium Conversions
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.premium}</div>
          <p className="text-xs text-muted-foreground mt-1">Signup to premium: {formatRate(metrics.premiumRate)}</p>
        </div>
        <div className="rounded-xl border p-4 bg-card shadow-sm">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <TrendingUp className="w-4 h-4" /> Best Performing Code
          </div>
          <div className="text-2xl font-semibold mt-2">{metrics.topCode?.code || "-"}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {metrics.topCode ? `${metrics.topCode.clicks || 0} clicks` : "No data yet"}
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-base font-semibold flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              Quick Insights
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {totals.clicks === 0
                ? "Share your referral link in student groups and communities to start tracking performance."
                : `You are converting ${formatRate(metrics.signupRate)} of clicks into signups.`}
            </p>
          </div>
          {rows[0] && (
            <button
              onClick={() => handleCopy(rows[0].code)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md border text-sm hover:bg-muted"
            >
              <Copy className="w-4 h-4" />
              {copiedCode === rows[0].code ? "Copied Link" : "Copy Primary Referral Link"}
            </button>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Link</th>
              <th className="text-right px-4 py-3 font-medium">Clicks</th>
              <th className="text-right px-4 py-3 font-medium">Signups</th>
              <th className="text-right px-4 py-3 font-medium">Premium</th>
              <th className="text-right px-4 py-3 font-medium">CVR</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No referral code found for your account yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const link = `https://www.trackmyopt.com/?ref=${row.code}`;
                const rowSignupRate = row.clicks > 0 ? ((row.signups || 0) / row.clicks) * 100 : 0;
                return (
                  <tr key={row.code} className="border-t">
                    <td className="px-4 py-3">
                      <div className="font-medium">{row.code}</div>
                      <div className="text-xs text-muted-foreground">{row.name || "Referral code"}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <a href={link} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          Open Link
                        </a>
                        <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        <button
                          onClick={() => handleCopy(row.code)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs hover:bg-muted"
                        >
                          <Copy className="w-3 h-3" />
                          {copiedCode === row.code ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">{row.clicks || 0}</td>
                    <td className="px-4 py-3 text-right">{row.signups || 0}</td>
                    <td className="px-4 py-3 text-right">{row.premium_conversions || 0}</td>
                    <td className="px-4 py-3 text-right">{formatRate(rowSignupRate)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs ${row.is_active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                        {row.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
