import Link from 'next/link';
import { NetworkingUsageStats } from './NetworkingUsageStats';
import { redirect } from 'next/navigation';
import { ArrowLeft, Search, Linkedin } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { NetworkingWorkspace } from './NetworkingWorkspace';
import { NetworkingWorkspace as LegacyNetworkingWorkspace } from './LegacyNetworkingWorkspace';

export const dynamic = 'force-dynamic';

export default async function NetworkingPage({ searchParams }: {
  searchParams: Promise<{ applicationId?: string; bundle?: string; mode?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data, error } = await supabase.from('job_applications')
    .select('id, company_name, role_title').eq('user_id', user.id)
    .order('updated_at', { ascending: false }).limit(100);
  const params = await searchParams;
  const applications = data ?? [];
  const bundlesEnabled = process.env.NETWORKING_BUNDLES_ENABLED !== 'false';
  const bundlesDefault = process.env.NETWORKING_BUNDLES_DEFAULT === 'true';
  const legacy = !bundlesEnabled || params.mode === 'manual' ||
    (params.mode !== 'bundles' && !bundlesDefault);

  return <main className="mx-auto max-w-6xl space-y-6 px-3 py-5 sm:px-6 sm:py-8">
    <Link href="/dashboard/career" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"><ArrowLeft className="size-4" aria-hidden="true" />Career Hub</Link>
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Networking</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Find a contact. Start a conversation.</p>
      </div>
      <NetworkingUsageStats key={legacy ? "manual" : "bundles"} mode={legacy ? "manual" : "bundles"} />
    </header>
    {bundlesEnabled && <nav aria-label="Networking workflows" className="inline-flex max-w-full flex-wrap gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
      <Link href={{ pathname: '/dashboard/career/networking', query: { mode: 'manual', ...(params.applicationId ? { applicationId: params.applicationId } : {}) } }} aria-current={legacy ? 'page' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${legacy ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}><Linkedin className="size-4" aria-hidden="true" />LinkedIn profile</Link>
      <Link href={{ pathname: '/dashboard/career/networking', query: { mode: 'bundles', ...(params.applicationId ? { applicationId: params.applicationId } : {}) } }} aria-current={!legacy ? 'page' : undefined} className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!legacy ? 'bg-white text-blue-700 shadow-sm dark:bg-slate-950 dark:text-blue-300' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'}`}><Search className="size-4" aria-hidden="true" />Find contacts<span className="rounded bg-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600 dark:bg-slate-700 dark:text-slate-300">Pilot</span></Link>
    </nav>}
    {legacy ? <LegacyNetworkingWorkspace applications={applications} initialApplicationId={params.applicationId ?? ''} applicationsUnavailable={Boolean(error)} /> :
      <NetworkingWorkspace applications={applications} initialApplicationId={params.applicationId ?? ''} initialBundleId={params.bundle ?? ''} applicationsUnavailable={Boolean(error)} />}
  </main>;
}
