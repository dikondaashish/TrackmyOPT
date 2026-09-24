import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, MessageSquareText } from 'lucide-react';
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
    <Link href="/dashboard/career" className="inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-medium text-slate-600 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-300 dark:hover:text-blue-300"><ArrowLeft className="size-4" aria-hidden="true" />Back to Career Hub</Link>
    <header className="flex items-start gap-4">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300"><MessageSquareText className="size-6" aria-hidden="true" /></div>
      <div className="max-w-2xl"><p className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700 dark:text-blue-300">Career tools · Networking</p><h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 dark:text-white sm:text-3xl">Find the right people. Reach out personally.</h1><p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">Find a relevant contact, check available work email, and prepare outreach you can review before sending.</p></div>
    </header>
    {bundlesEnabled && <nav aria-label="Networking workflows" className="flex flex-wrap gap-2 text-sm">
      <Link href="/dashboard/career/networking?mode=manual" aria-current={legacy ? 'page' : undefined} className={`rounded-lg px-4 py-2.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${legacy ? 'bg-blue-700 text-white' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>Use a LinkedIn profile</Link>
      <Link href="/dashboard/career/networking?mode=bundles" aria-current={!legacy ? 'page' : undefined} className={`rounded-lg px-4 py-2.5 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${!legacy ? 'bg-blue-700 text-white' : 'border border-slate-300 text-slate-700 dark:border-slate-700 dark:text-slate-200'}`}>Try outreach bundles · Pilot</Link>
    </nav>}
    {legacy ? <LegacyNetworkingWorkspace applications={applications} initialApplicationId={params.applicationId ?? ''} applicationsUnavailable={Boolean(error)} /> :
      <NetworkingWorkspace applications={applications} initialApplicationId={params.applicationId ?? ''} initialBundleId={params.bundle ?? ''} applicationsUnavailable={Boolean(error)} />}
  </main>;
}
