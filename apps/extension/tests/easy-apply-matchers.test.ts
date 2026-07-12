import assert from 'node:assert/strict';
import { classifyField } from '../src/easy-apply-matchers';

const cases: Array<[string, ReturnType<typeof classifyField>]> = [
  ['candidate[first_name]', 'firstName'],
  ['candidate_last_name', 'lastName'],
  ['contactEmailAddress', 'email'],
  ['candidate_phone_number', 'phone'],
  ['address_level_2_city', 'city'],
  ['yearsOfProfessionalExperience', 'yearsExperience'],
  ['visa_sponsorship_email', null],
  ['workAuthorizationPhone', null],
  ['desired_salary_email', null],
  ['equal_opportunity_phone', null],
  ['candidate[linkedin_profile_url]', 'linkedinUrl'],
  ['applicant.location.city', 'city'],
  ['candidate_portfolio_url', 'portfolioUrl'],
  ['current_company_email', null],
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
];

for (const [signal, expected] of cases) {
  assert.equal(classifyField(signal), expected, signal);
}

console.log(`easy-apply-matchers: ${cases.length} cases passed`);
