import { Metadata } from "next";

export const metadata: Metadata = {
    robots: { index: false, follow: false },
};

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <div className="min-h-screen bg-surface">{children}</div>;
}
