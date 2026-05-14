"use client";

/**
 * Shared usePremiumStatus hook (ISS-014).
 *
 * Single source of truth for `isPremium` across the dashboard:
 *  - Returns a tri-state `isPremium`: `null` while loading, then `boolean`.
 *  - Returns `error` distinguishing "couldn't verify subscription" from "free plan".
 *  - Caches the response per-mount via React context to avoid the 3-5 redundant
 *    `/api/premium/status` calls per page load described in the audit.
 *
 * Usage:
 *   const { isPremium, isLoading, error, refresh } = usePremiumStatus();
 *   if (isLoading) return <Skeleton />;
 *   if (error) return <RetryBanner onRetry={refresh} />;
 *   if (!isPremium) return <Upsell />;
 *   return <PremiumFeature />;
 */

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";

export interface PremiumStatusValue {
    /** null = unknown/loading, true/false once resolved. */
    isPremium: boolean | null;
    isLoading: boolean;
    /** Non-null when the status fetch failed (auth issue, network error, 5xx). */
    error: "unauthenticated" | "network" | "server" | null;
    planName: string | null;
    expiresAt: string | null;
    customerId: string | null;
    refresh: () => Promise<void>;
}

const PremiumStatusContext = createContext<PremiumStatusValue | null>(null);

interface FetchedState {
    isPremium: boolean | null;
    planName: string | null;
    expiresAt: string | null;
    customerId: string | null;
}

const INITIAL: FetchedState = {
    isPremium: null,
    planName: null,
    expiresAt: null,
    customerId: null,
};

export function PremiumStatusProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<FetchedState>(INITIAL);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<PremiumStatusValue["error"]>(null);
    const inFlight = useRef(false);

    const refresh = useCallback(async () => {
        if (inFlight.current) return;
        inFlight.current = true;
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/premium/status", {
                credentials: "include",
                cache: "no-store",
            });
            if (res.status === 401) {
                setError("unauthenticated");
                setState({ ...INITIAL, isPremium: false });
                return;
            }
            if (!res.ok) {
                setError("server");
                // Keep previous isPremium if any — DO NOT silently downgrade Pro users
                // on a transient 5xx.
                setState((prev) => ({ ...prev }));
                return;
            }
            const data = await res.json();
            setState({
                isPremium: data.isPremium === true,
                planName: data.planName ?? null,
                expiresAt: data.expiresAt ?? null,
                customerId: data.customerId ?? null,
            });
        } catch {
            setError("network");
            setState((prev) => ({ ...prev }));
        } finally {
            inFlight.current = false;
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const value = useMemo<PremiumStatusValue>(
        () => ({
            isPremium: state.isPremium,
            isLoading,
            error,
            planName: state.planName,
            expiresAt: state.expiresAt,
            customerId: state.customerId,
            refresh,
        }),
        [state, isLoading, error, refresh],
    );

    return <PremiumStatusContext.Provider value={value}>{children}</PremiumStatusContext.Provider>;
}

/**
 * Read premium status. Components outside the provider get an independent,
 * locally-fetched value (backwards compatibility with existing pages not yet
 * wrapped by PremiumStatusProvider).
 */
export function usePremiumStatus(): PremiumStatusValue {
    const ctx = useContext(PremiumStatusContext);
    // Local fallback when no provider is mounted yet.
    const [localState, setLocalState] = useState<FetchedState>(INITIAL);
    const [isLoading, setIsLoading] = useState(!ctx);
    const [error, setError] = useState<PremiumStatusValue["error"]>(null);
    const ranRef = useRef(false);

    const localRefresh = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/premium/status", { credentials: "include", cache: "no-store" });
            if (res.status === 401) {
                setError("unauthenticated");
                setLocalState({ ...INITIAL, isPremium: false });
                return;
            }
            if (!res.ok) {
                setError("server");
                return;
            }
            const data = await res.json();
            setLocalState({
                isPremium: data.isPremium === true,
                planName: data.planName ?? null,
                expiresAt: data.expiresAt ?? null,
                customerId: data.customerId ?? null,
            });
        } catch {
            setError("network");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (ctx || ranRef.current) return;
        ranRef.current = true;
        void localRefresh();
    }, [ctx, localRefresh]);

    if (ctx) return ctx;

    return {
        isPremium: localState.isPremium,
        isLoading,
        error,
        planName: localState.planName,
        expiresAt: localState.expiresAt,
        customerId: localState.customerId,
        refresh: localRefresh,
    };
}
