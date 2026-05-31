"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/**
 * Internal dispute evidence lookup. Requires ADMIN_SECRET in the form (not stored).
 * Prefer server-side scripts in production; this page is for support ops.
 */
export default function AdminBillingEvidencePage() {
  const [secret, setSecret] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function runSearch() {
    setLoading(true);
    setResult("");
    try {
      const q = new URLSearchParams({ email: email.trim() });
      const res = await fetch(`/api/admin/billing-evidence?${q}`, {
        headers: { Authorization: `Bearer ${secret}` },
      });
      const json = await res.json();
      setResult(JSON.stringify(json, null, 2));
    } catch (e) {
      setResult(e instanceof Error ? e.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  function downloadJson() {
    const blob = new Blob([result], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `billing-evidence-${email || "export"}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main className="max-w-3xl mx-auto p-8 space-y-6">
      <h1 className="text-2xl font-bold">Billing dispute evidence</h1>
      <p className="text-sm text-muted-foreground">
        Export consent logs, transactions, and billing emails for Stripe disputes. Do not commit ADMIN_SECRET.
      </p>
      <Input
        type="password"
        placeholder="ADMIN_SECRET"
        value={secret}
        onChange={(e) => setSecret(e.target.value)}
      />
      <Input
        placeholder="Customer email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <div className="flex gap-2">
        <Button onClick={runSearch} disabled={loading || !secret || !email}>
          {loading ? "Loading…" : "Fetch packet"}
        </Button>
        {result && (
          <Button variant="outline" onClick={downloadJson}>
            Download JSON
          </Button>
        )}
      </div>
      {result && (
        <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-[60vh]">{result}</pre>
      )}
    </main>
  );
}
