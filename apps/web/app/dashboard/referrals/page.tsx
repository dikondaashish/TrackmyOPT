"use client";

import { useEffect, useMemo, useState } from "react";
import { Copy, Link as LinkIcon, Users, MousePointerClick, Crown } from "lucide-react";

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

  const handleCopy = async (code: string) => {
    const link = `https://www.trackmyopt.com/?ref=${code}`;
    await navigator.clipboard.writeText(link);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 1500);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading referral stats...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Referral Stats</h1>
        <p className="text-sm text-muted-foreground mt-1">
          View referral performance for codes owned by {ownerEmail || "your account"}.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl border p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MousePointerClick className="w-4 h-4" /> Total Clicks
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.clicks}</div>
        </div>
        <div className="rounded-xl border p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Users className="w-4 h-4" /> Total Signups
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.signups}</div>
        </div>
        <div className="rounded-xl border p-4 bg-card">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Crown className="w-4 h-4" /> Premium Conversions
          </div>
          <div className="text-2xl font-semibold mt-2">{totals.premium}</div>
        </div>
      </div>

      <div className="rounded-xl border bg-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/40">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Code</th>
              <th className="text-left px-4 py-3 font-medium">Referral Link</th>
              <th className="text-right px-4 py-3 font-medium">Clicks</th>
              <th className="text-right px-4 py-3 font-medium">Signups</th>
              <th className="text-right px-4 py-3 font-medium">Premium</th>
              <th className="text-center px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No referral code found for your account yet.
                </td>
              </tr>
            ) : (
              rows.map((row) => {
                const link = `https://www.trackmyopt.com/?ref=${row.code}`;
                return (
                  <tr key={row.code} className="border-t">
                    <td className="px-4 py-3 font-medium">{row.code}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <LinkIcon className="w-3.5 h-3.5 text-muted-foreground" />
                        <a href={link} target="_blank" rel="noreferrer" className="underline underline-offset-2">
                          Open Link
                        </a>
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
