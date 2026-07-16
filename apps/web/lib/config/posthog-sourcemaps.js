/**
 * Source-map uploads are a release side effect, not a prerequisite for a
 * successful local or pull-request build. Vercel production deploys upload
 * automatically; another trusted release runner can opt in explicitly.
 */
function shouldUploadPostHogSourcemaps(env = process.env) {
  const isProductionRelease =
    env.VERCEL_ENV === 'production' ||
    env.POSTHOG_SOURCEMAPS_FORCE_UPLOAD === 'true';

  return Boolean(
    isProductionRelease &&
    env.POSTHOG_SOURCEMAPS_ENABLED === 'true' &&
    env.POSTHOG_PERSONAL_API_KEY &&
    env.POSTHOG_PROJECT_ID
  );
}

module.exports = { shouldUploadPostHogSourcemaps };
