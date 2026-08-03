import { useState, useEffect } from 'react';
import { Download, AlertCircle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Invoice {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    pdf_url: string;
    number: string;
}

export function BillingHistory() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchInvoices() {
            try {
                const res = await fetch('/api/premium/invoices');
                if (res.ok) {
                    const data = await res.json();
                    setInvoices(data.invoices || []);
                } else {
                    // If 403/401, mostly ok to ignore or show empty
                    // But generic error handling:
                    setInvoices([]);
                }
            } catch (err) {
                console.error('Failed to fetch invoices', err);
                setError('Could not load billing history');
            } finally {
                setIsLoading(false);
            }
        }

        fetchInvoices();
    }, []);

    if (isLoading) {
        return (
            <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-16 w-full bg-gray-100 dark:bg-gray-700/50 rounded-lg animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    Billing History
                </h3>
                {invoices.length > 0 && (
                    <span className="text-xs text-gray-500">Recent Invoices</span>
                )}
            </div>

            {invoices.length === 0 ? (
                <div className="text-center py-6">
                    <p className="text-sm text-gray-500 dark:text-gray-400">No invoices found.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {invoices.map((invoice) => (
                        <div
                            key={invoice.id}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg group hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
                        >
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-gray-900 dark:text-gray-100">
                                    {new Date(invoice.date).toLocaleDateString()}
                                </span>
                                <span className="text-xs text-gray-500 capitalize">{invoice.status}</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                                    ${invoice.amount.toFixed(2)}
                                </span>
                                {invoice.pdf_url && (
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => window.open(invoice.pdf_url, '_blank')}
                                    >
                                        <Download className="w-4 h-4 text-gray-500" />
                                        <span className="sr-only">Download PDF</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {error && (
                <div className="mt-4 flex items-center gap-2 text-xs text-red-500">
                    <AlertCircle className="w-3 h-3" />
                    {error}
                </div>
            )}
        </div>
    );
}
