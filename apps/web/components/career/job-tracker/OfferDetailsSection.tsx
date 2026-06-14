"use client";

import { useState, useEffect } from "react";
import { DollarSign, Calendar, Clock, Award, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRelativeDate } from "@/lib/career/job-tracker/filtering";
import { useToast } from "@/hooks/use-toast";

interface OfferDetailsSectionProps {
    offerSalary?: number | null;
    offerStartDate?: string | null;
    offerDeadline?: string | null;
    sponsorH1B?: boolean | null;
    onChange: (field: string, value: any) => void;
    onConvert?: () => void;
}

export function OfferDetailsSection({
    offerSalary,
    offerStartDate,
    offerDeadline,
    sponsorH1B,
    onChange,
    onConvert
}: OfferDetailsSectionProps) {
    const [salary, setSalary] = useState(offerSalary?.toString() || "");
    const [startDate, setStartDate] = useState(offerStartDate || "");
    const [deadline, setDeadline] = useState(offerDeadline || "");
    const [h1bSponsorship, setH1bSponsorship] = useState<boolean | null>(sponsorH1B ?? null);
    const { toast } = useToast();

    // Calculate deadline countdown
    const deadlineInfo = deadline ? (() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const deadlineDate = new Date(deadline);
        deadlineDate.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 0) return { text: `${Math.abs(diffDays)} days past`, color: "text-red-600" };
        if (diffDays === 0) return { text: "Today!", color: "text-red-600" };
        if (diffDays <= 3) return { text: `${diffDays} days left`, color: "text-orange-600" };
        if (diffDays <= 7) return { text: `${diffDays} days left`, color: "text-yellow-600" };
        return { text: `${diffDays} days left`, color: "text-green-600" };
    })() : null;

    const handleSalaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/[^0-9]/g, "");
        setSalary(value);
        onChange("offer_salary", value ? parseInt(value) : null);
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setStartDate(e.target.value);
        onChange("offer_start_date", e.target.value || null);
    };

    const handleDeadlineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDeadline(e.target.value);
        onChange("offer_deadline", e.target.value || null);
    };

    const handleH1BChange = (value: boolean) => {
        setH1bSponsorship(value);
        onChange("sponsor_h1b", value);
    };

    const formatSalary = (value: string) => {
        if (!value) return "";
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0
        }).format(parseInt(value));
    };

    const handleConvert = () => {
        toast({
            title: "Feature in development",
            description: "Soon you'll be able to instantly convert this offer into an active employment record.",
        });
    };

    return (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-xl p-5">
            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
                <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/40">
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Offer Details</h3>
            </div>

            {/* Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Salary */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Offer Salary</Label>
                    <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <Input
                            type="text"
                            placeholder="95,000"
                            value={salary ? formatSalary(salary).replace("$", "") : ""}
                            onChange={handleSalaryChange}
                            className="pl-8"
                        />
                    </div>
                    {salary && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                            {formatSalary(salary)}/year
                        </p>
                    )}
                </div>

                {/* Start Date */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Start Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="pl-10"
                        />
                    </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">Decision Deadline</Label>
                    <div className="relative">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <Input
                            type="date"
                            value={deadline}
                            onChange={handleDeadlineChange}
                            className="pl-10"
                        />
                    </div>
                    {deadlineInfo && (
                        <p className={`text-xs font-medium ${deadlineInfo.color}`}>
                            ⏰ {deadlineInfo.text}
                        </p>
                    )}
                </div>

                {/* H-1B Sponsorship */}
                <div className="space-y-2">
                    <Label className="text-xs text-gray-600 dark:text-gray-400">H-1B Sponsorship</Label>
                    <div className="flex gap-2">
                        <button
                            onClick={() => handleH1BChange(true)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${h1bSponsorship === true
                                    ? "bg-emerald-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            ✓ Yes
                        </button>
                        <button
                            onClick={() => handleH1BChange(false)}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors ${h1bSponsorship === false
                                    ? "bg-red-600 text-white"
                                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                                }`}
                        >
                            ✗ No
                        </button>
                    </div>
                    {h1bSponsorship === true && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            🎉 Great news for your OPT transition!
                        </p>
                    )}
                </div>
            </div>

            {/* Convert Button */}
            <Button
                onClick={handleConvert}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white"
            >
                <ArrowRight className="w-4 h-4 mr-2" />
                Convert to Employment Record
            </Button>
        </div>
    );
}
