"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PricingModal } from "@/components/pricing/PricingModal";
import { supabase } from "@/lib/supabaseClient";
import { capturePremiumCheckoutViewed } from "@/lib/posthog-client";
import type { User } from "@supabase/supabase-js";

interface CheckoutModalClientProps {
    user: User;
}

export function CheckoutModalClient({ user }: CheckoutModalClientProps) {
    const [open, setOpen] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [userEmail, setUserEmail] = useState<string | undefined>(user.email);
    const searchParams = useSearchParams();

    const planId = searchParams.get("planId") || undefined;
    const interval = searchParams.get("interval") || undefined;

    useEffect(() => {

        const checkPremiumStatus = async () => {
            if (user) {
                // Check premium status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("premium_status")
                    .eq("user_id", user.id)
                    .single();

                setIsPremium(profile?.premium_status === true);
            }
        };

        checkPremiumStatus();
    }, [user]);

    useEffect(() => {
        capturePremiumCheckoutViewed({
            plan_id: planId ?? null,
            interval: interval ?? null,
        });
    }, [planId, interval]);

    const handleClose = () => {
        setOpen(false);
        window.location.href = "/dashboard";
    };

    return (
        <PricingModal
            open={open}
            onClose={handleClose}
            userEmail={userEmail}
            isPremium={isPremium}
            initialPlan={planId}
            initialInterval={interval}
            checkoutPage
        />
    );
}
