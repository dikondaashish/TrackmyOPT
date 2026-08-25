import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import Link from 'next/link';
import {
    DEDICATED_CONSULTATION_MINUTES,
    DEDICATED_CONSULTATION_WAIT_DAYS,
    DEDICATED_MONEY_BACK_DAYS,
    PRO_PAID_INTRO_PRICE,
    PRO_TRIAL_DAYS,
} from '@/lib/billing/legal-config';

const faqs = [
    {
        question: "Is this an auto-renewing subscription?",
        answer: `Yes. Pro and Dedicated renew automatically at the price shown at checkout (monthly or yearly) until you cancel in Settings → Subscription → Cancel subscription (Stripe billing portal).`
    },
    {
        question: "How do I cancel?",
        answer: "Sign in → Settings → Subscription & Billing → Cancel subscription. Stripe's portal confirms cancellation. We email you your final access date. Cancellation stops future charges only; you keep access through the end of your current paid or introductory period."
    },
    {
        question: "Does Pro include a free trial?",
        answer: `No. Eligible accounts pay $${PRO_PAID_INTRO_PRICE.toFixed(2)} for the first ${PRO_TRIAL_DAYS} days, then Pro renews at the selected monthly or annual price unless canceled. Only that $${PRO_PAID_INTRO_PRICE.toFixed(2)} charge is refundable during the introductory period. Previously granted free trials remain governed by their original checkout terms.`
    },
    {
        question: "What about Dedicated billing?",
        answer: `Dedicated is charged immediately and has a ${DEDICATED_MONEY_BACK_DAYS}-day refund window on the first Dedicated subscription charge. After ${DEDICATED_CONSULTATION_WAIT_DAYS} continuous days on Dedicated, the member may request one complimentary ${DEDICATED_CONSULTATION_MINUTES}-minute initial consultation per account with a partnered licensed immigration attorney. Availability, conflict checks, attorney acceptance, and the Dedicated terms apply.`
    },
    {
        question: "Can I get a refund?",
        answer: `For an eligible Pro account, only the $${PRO_PAID_INTRO_PRICE.toFixed(2)} introductory charge is refundable during the first ${PRO_TRIAL_DAYS} days; later recurring charges are not refundable for change of mind. Dedicated has a ${DEDICATED_MONEY_BACK_DAYS}-day guarantee on its first subscription charge.`
    },
    {
        question: "Is my payment secure?",
        answer: "Yes. Stripe processes payments. We do not store your full card number."
    },
    {
        question: "What happens to my data if I cancel?",
        answer: "You return to the free plan. Your account and basic data remain; Pro features like daily reminders and Document Vault are locked."
    }
];

export function SubscriptionFAQ() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-4">
                <HelpCircle className="w-5 h-5 text-gray-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Billing FAQ</h3>
            </div>

            <div className="space-y-2">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
                    >
                        <button
                            onClick={() => toggle(index)}
                            className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            <span className="text-sm">{faq.question}</span>
                            {openIndex === index ? (
                                <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                        </button>
                        {openIndex === index && (
                            <div className="p-4 pt-0 text-sm text-gray-600 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
                                {faq.answer}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            <div className="mt-6 text-center text-sm text-gray-500 space-y-1">
                <p>
                    <Link href="/refund-policy" className="text-blue-600 hover:underline">Refund Policy</Link>
                    {" · "}
                    <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                    {" · "}
                    <Link href="/disclaimer" className="text-blue-600 hover:underline">Disclaimer</Link>
                    {" · "}
                    <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                </p>
                <p>
                    Need help? <a href="mailto:support@trackmyopt.com" className="text-blue-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}
