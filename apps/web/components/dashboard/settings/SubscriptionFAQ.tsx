import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

const faqs = [
    {
        question: "How do I cancel my subscription?",
        answer: "Sign in → Settings → Subscription → Manage Subscription. That opens Stripe’s secure Customer Portal where you can cancel, update your card, or download invoices. After you cancel, Stripe confirms by email; your TrackMyOPT access stays until the end of the paid or trial period, then the app moves you to the free plan."
    },
    {
        question: "Is this a subscription?",
        answer: "Yes, we offer flexible monthly and annual plans. You can cancel anytime. Our annual plans come with a 20% discount."
    },
    {
        question: "Is my payment secure?",
        answer: "Absolutely. We use Stripe, a globally trusted payment processor (used by Amazon, Google, etc.), to handle your payment details safely. We never store your card info."
    },
    {
        question: "Can I get a refund?",
        answer: "We offer a 7-day free trial so you can test all features risk-free. You won't be charged if you cancel before the trial ends."
    },
    {
        question: "What happens to my data if I cancel?",
        answer: "Your data is safe! You will return to the free plan. You'll keep your account and basic data, but premium features like the H-1B database will be locked."
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
