"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { PricingModal } from "@/components/pricing/PricingModal";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

function CheckoutContent() {
    const [open, setOpen] = useState(true);
    const [isPremium, setIsPremium] = useState(false);
    const [userEmail, setUserEmail] = useState<string | undefined>();
    const searchParams = useSearchParams();

    const planId = searchParams.get("planId") || undefined;
    const interval = searchParams.get("interval") || undefined;

    useEffect(() => {
        const supabase = createClientComponentClient();

        const checkUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setUserEmail(user.email || undefined);

                // Check premium status
                const { data: profile } = await supabase
                    .from("profiles")
                    .select("is_premium")
                    .eq("user_id", user.id)
                    .single();

                setIsPremium(profile?.is_premium || false);
            }
        };

        checkUser();
    }, []);

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
        />
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
            <Suspense fallback={
                <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600" />
                </div>
            }>
                <CheckoutContent />
            </Suspense>
        </div>
    );
}
