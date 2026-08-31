import { permanentRedirect } from 'next/navigation';

type LegacyResumePageProps = {
  searchParams: Promise<{ applicationId?: string | string[] }>;
};

const APPLICATION_ID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Compatibility URL for old bookmarks, emails, and extension links.
 * The active resume generator lives under /dashboard/career.
 */
export default async function LegacyResumePage({
  searchParams,
}: LegacyResumePageProps) {
  const { applicationId } = await searchParams;

  if (
    typeof applicationId === 'string' &&
    APPLICATION_ID_PATTERN.test(applicationId)
  ) {
    permanentRedirect(
      `/dashboard/career/resume-generator/editor?applicationId=${encodeURIComponent(applicationId)}`
    );
  }

  permanentRedirect('/dashboard/career/resume-generator');
}
