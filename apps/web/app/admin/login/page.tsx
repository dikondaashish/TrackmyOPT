import { redirect } from 'next/navigation';
import { getEmailCampaignAdmin } from '@/lib/auth/email-campaign-admin';
import AdminLoginForm from './login-form';

export const dynamic = 'force-dynamic';
export const metadata = {
  title: 'Admin sign-in | TrackMyOPT',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await getEmailCampaignAdmin();
  if (admin.status === 'admin') redirect('/admin/email-campaigns');
  const { error } = await searchParams;
  return (
    <AdminLoginForm
      accessDenied={admin.status === 'forbidden'}
      setupInvalid={error === 'setup'}
    />
  );
}
