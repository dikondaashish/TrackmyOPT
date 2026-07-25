import type {
  BasicContactProfile,
  ResumeAutofillSnapshotV1,
} from './resume-autofill-contract';

function preferred(
  snapshotValue: string | undefined,
  fallbackValue: string
): string {
  return snapshotValue?.trim() || fallbackValue;
}

export function buildContactAutofillProfile(
  snapshot: ResumeAutofillSnapshotV1 | undefined,
  fallback: BasicContactProfile
): BasicContactProfile {
  if (!snapshot) return fallback;

  const firstName = preferred(snapshot.contact.firstName, fallback.firstName);
  const lastName = preferred(snapshot.contact.lastName, fallback.lastName);
  const snapshotHasName = Boolean(
    snapshot.contact.firstName?.trim() || snapshot.contact.lastName?.trim()
  );
  const fullName =
    snapshot.contact.fullName?.trim() ||
    (snapshotHasName
      ? [firstName, lastName].filter(Boolean).join(' ')
      : fallback.fullName) ||
    [firstName, lastName].filter(Boolean).join(' ');

  return {
    firstName,
    lastName,
    fullName,
    email: preferred(snapshot.contact.email, fallback.email),
    phone: preferred(snapshot.contact.phone, fallback.phone),
    country: preferred(snapshot.contact.country, fallback.country),
    streetAddress: fallback.streetAddress,
    city: preferred(snapshot.contact.city, fallback.city),
    state: preferred(snapshot.contact.state, fallback.state),
    postalCode: fallback.postalCode,
    countyDistrict: fallback.countyDistrict,
    yearsExperience:
      snapshot.totalYearsExperience !== undefined
        ? String(snapshot.totalYearsExperience)
        : fallback.yearsExperience,
    linkedinUrl: preferred(snapshot.contact.linkedinUrl, fallback.linkedinUrl),
    githubUrl: fallback.githubUrl,
    portfolioUrl: preferred(
      snapshot.contact.portfolioUrl,
      fallback.portfolioUrl
    ),
  };
}
