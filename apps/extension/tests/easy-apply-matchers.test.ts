import assert from 'node:assert/strict';
import { classifyField } from '../src/easy-apply-matchers';

const cases: Array<[string, ReturnType<typeof classifyField>]> = [
  ['candidate[first_name]', 'firstName'],
  ['candidate_last_name', 'lastName'],
  ['contactEmailAddress', 'email'],
  ['candidate_phone_number', 'phone'],
  ['address_level_2_city', 'city'],
  ['candidate_country', 'country'],
  ['street_address', 'streetAddress'],
  ['address-line1', 'streetAddress'],
  ['postal_code', 'postalCode'],
  ['zipCode', 'postalCode'],
  ['county_or_district', 'countyDistrict'],
  ['yearsOfProfessionalExperience', 'yearsExperience'],
  ['visa_sponsorship_email', null],
  ['workAuthorizationPhone', null],
  ['desired_salary_email', null],
  ['equal_opportunity_phone', null],
  ['candidate[linkedin_profile_url]', 'linkedinUrl'],
  ['candidate_github_url', 'githubUrl'],
  // camelCase "LinkedIn" normalizes to "linked in" — must still classify.
  ['LinkedIn Profile URL', 'linkedinUrl'],
  ['linkedInUrl', 'linkedinUrl'],
  ['LinkedIn', 'linkedinUrl'],
  ['applicant.location.city', 'city'],
  ['candidate_portfolio_url', 'portfolioUrl'],
  ['personal website', 'portfolioUrl'],
  ['current_company_email', null],
  ['company website', null],
  ['employer GitHub URL', null],
  ['referral company', null],
  ['manager company', null],
  ['howManyTotalYearsOfProfessionalExperience', 'yearsExperience'],
  ['years_of_java_experience', null],
  ['disability_phone_number', null],
  ['citizenship_email', null],
  ['candidate[full_name]', 'fullName'],
  ['mobilePhone', 'phone'],
  ['given-name', 'firstName'],
  ['family-name', 'lastName'],
  ['address-level1', 'state'],
  ['address-level2', 'city'],
  ['name', 'fullName'],
  ['tel', 'phone'],
  ['Skills', 'skills'],
  ['Technical Skills', 'skills'],
  ['Core Skills', 'skills'],
  ['Professional Skills (comma separated)', 'skills'],
  ['skills Technical Skills', 'skills'],
  ['skills Enter your skills', 'skills'],
  ['describe_your_skills', null],
  ['years_of_java_experience', null],
  ['Java skills', null],
  ['Are you eligible to use Python skills in this role?', null],
];

for (const [signal, expected] of cases) {
  assert.equal(classifyField(signal), expected, signal);
}

console.log(`easy-apply-matchers: ${cases.length} cases passed`);
