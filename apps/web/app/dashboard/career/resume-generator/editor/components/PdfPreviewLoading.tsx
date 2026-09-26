import { Loader2 } from "lucide-react";

export function PdfPreviewLoading({ label = "Preparing preview…" }: { label?: string }) {
    return (
        <div className="flex h-full min-h-64 w-full flex-col items-center justify-center gap-5 overflow-hidden p-6" role="status">
            <div aria-hidden="true" className="aspect-[8.5/11] max-h-[52vh] w-full max-w-xs rounded-lg border border-gray-200 bg-white p-7 shadow-sm motion-safe:animate-pulse dark:border-gray-700 dark:bg-gray-800">
                <div className="mx-auto h-3 w-2/5 rounded bg-gray-300 dark:bg-gray-600" />
                <div className="mx-auto mt-3 h-1.5 w-3/5 rounded bg-gray-100 dark:bg-gray-700" />
                {[0, 1, 2].map((section) => (
                    <div key={section} className="mt-7 space-y-2.5">
                        <div className="mb-3 h-2 w-1/3 rounded bg-gray-200 dark:bg-gray-600" />
                        <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-700" />
                        <div className="h-1.5 rounded bg-gray-100 dark:bg-gray-700" />
                        <div className="h-1.5 w-4/5 rounded bg-gray-100 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
            <span className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <Loader2 aria-hidden="true" className="size-3.5 motion-safe:animate-spin" />
                {label}
            </span>
        </div>
    );
}
