"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PremiumPage() {
    const router = useRouter();

    useEffect(() => {
        router.replace("/premium/checkout");
    }, [router]);

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">
                Redirecting to checkout...
            </div>
        </div>
    );
}
