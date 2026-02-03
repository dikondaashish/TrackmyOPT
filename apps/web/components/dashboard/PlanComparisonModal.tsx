import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, X } from "lucide-react";

export function PlanComparisonModal() {
    const [isOpen, setIsOpen] = useState(false);

    const features = [
        { name: "Job Tracker", free: "5 Active Jobs", pro: "Unlimited", highlight: true },
        { name: "H-1B Sponsor Intelligence", free: "Basic Search", pro: "Advanced Analytics", highlight: true },
        { name: "Document Vault", free: "Basic", pro: "Encrypted + Shareable" },
        { name: "Case Status Alerts", free: "Manual Check", pro: "Real-time Email Alerts" },
        { name: "Extension Sync", free: <Check className="w-4 h-4 text-green-500 mx-auto" />, pro: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
        { name: "AI Resume Analysis", free: <X className="w-4 h-4 text-gray-300 mx-auto" />, pro: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
        { name: "Priority Support", free: <X className="w-4 h-4 text-gray-300 mx-auto" />, pro: <Check className="w-4 h-4 text-green-500 mx-auto" /> },
    ];

    return (
        <>
            <Button
                variant="link"
                className="text-blue-600 dark:text-blue-400 p-0 h-auto font-medium"
                onClick={() => setIsOpen(true)}
            >
                Compare Plans
            </Button>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="max-w-3xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800" onClose={() => setIsOpen(false)}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold text-center mb-2">Plan Comparison</DialogTitle>
                        <p className="text-center text-gray-500 dark:text-gray-400 mb-6">
                            Unlock your full potential with TrackMyOPT Premium
                        </p>
                    </DialogHeader>

                    <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-semibold">
                                <tr>
                                    <th className="py-4 px-6 w-1/3">Feature</th>
                                    <th className="py-4 px-6 w-1/3 text-center text-gray-600 dark:text-gray-400">Free</th>
                                    <th className="py-4 px-6 w-1/3 text-center text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/10">
                                        Premium
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {features.map((feature, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="py-3 px-6 font-medium text-gray-700 dark:text-gray-300">
                                            {feature.name}
                                        </td>
                                        <td className="py-3 px-6 text-center text-gray-600 dark:text-gray-400">
                                            {feature.free}
                                        </td>
                                        <td className={`py-3 px-6 text-center font-medium ${feature.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-gray-100'} bg-blue-50/30 dark:bg-blue-900/5`}>
                                            {feature.pro}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="mt-6 text-center">
                        <Button
                            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-2 rounded-lg font-semibold shadow-lg"
                            onClick={() => window.location.href = '/premium/checkout'}
                        >
                            Start 7-Day Free Trial
                        </Button>
                        <p className="mt-2 text-xs text-gray-500">Then $4.99/mo. Cancel anytime.</p>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
