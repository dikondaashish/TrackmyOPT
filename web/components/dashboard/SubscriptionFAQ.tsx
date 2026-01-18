import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "Is this a one-time payment?",
        answer: "Yes! Our lifetime plan is a single payment that gives you permanent access to all premium features. No monthly fees."
    },
    {
        question: "Is my payment secure?",
        answer: "Absolutely. We use Stripe, a globally trusted payment processor (used by Amazon, Google, etc.), to handle your payment details safely. We never store your card info."
    },
    {
        question: "Can I get a refund?",
        answer: "If you're not satisfied, contact us within 7 days for a refund. We want you to be happy with your purchase."
    },
    {
        question: "What happens to my data if I don't upgrade?",
        answer: "Your data is safe! You will stay on the free plan with limited access to advanced features, but you won't lose your existing data."
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Frequently Asked Questions</h3>
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

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">
                    Need help? <a href="mailto:support@trackmyopt.com" className="text-blue-600 hover:underline">Contact Support</a>
                </p>
            </div>
        </div>
    );
}
