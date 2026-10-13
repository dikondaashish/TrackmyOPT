export const source = {
  student:
    'https://www.irs.gov/individuals/international-taxpayers/exempt-individual-who-is-a-student',
  examples:
    'https://www.irs.gov/individuals/international-taxpayers/tax-residency-status-examples',
  p519: 'https://www.irs.gov/publications/p519',
  presence:
    'https://www.irs.gov/individuals/international-taxpayers/substantial-presence-test',
  residency:
    'https://www.irs.gov/individuals/international-taxpayers/determining-an-individuals-tax-residency-status',
  visa: 'https://www.irs.gov/individuals/international-taxpayers/taxation-of-aliens-by-visa-type-and-immigration-status',
  nonresident:
    'https://www.irs.gov/individuals/international-taxpayers/nonresident-aliens',
  fbar: 'https://www.fincen.gov/report-foreign-bank-and-financial-accounts',
  manual: 'https://www.irs.gov/irm/part4/irm_04-026-016',
  studentException:
    'https://www.irs.gov/individuals/international-taxpayers/the-closer-connection-exception-to-the-substantial-presence-test-for-foreign-students',
  closer:
    'https://www.irs.gov/individuals/international-taxpayers/closer-connection-exception-to-the-substantial-presence-test',
  instructions:
    'https://www.fincen.gov/system/files/shared/FBAR%20Line%20Item%20Filing%20Instructions.pdf',
  maximum: 'https://www.fincen.gov/reporting-maximum-account-value',
  comparison:
    'https://www.irs.gov/businesses/comparison-of-form-8938-and-fbar-requirements',
  irsFbar:
    'https://www.irs.gov/businesses/small-businesses-self-employed/report-of-foreign-bank-and-financial-accounts-fbar',
  f8843: 'https://www.irs.gov/pub/irs-pdf/f8843.pdf',
  i1040nr: 'https://www.irs.gov/instructions/i1040nr',
  i8938: 'https://www.irs.gov/instructions/i8938',
  filing: 'https://bsaefiling.fincen.gov/file/fbar',
  records: 'https://www.fincen.gov/record-keeping',
  rates:
    'https://fiscaldata.treasury.gov/datasets/treasury-reporting-rates-exchange/treasury-reporting-rates-of-exchange',
};

export const faqItems = [
  {
    question: 'Do F-1 students automatically qualify for an FBAR exemption?',
    answer:
      'No. Many qualifying students remain nonresident aliens under the applicable residency rules and generally have no personal FBAR obligation. Prior exempt years, status changes, citizenship, green cards and residency elections can change that conclusion. Confirm U.S.-person status for FBAR before checking the foreign-account threshold.',
  },
  {
    question: 'Does STEM OPT start a new five-year period?',
    answer:
      'No. Starting OPT, a STEM OPT extension or another degree does not restart the qualifying calendar-year count. Review all earlier F, J, M and Q exempt-individual history. A partial qualifying arrival year generally counts as a calendar year, including a December arrival.',
  },
  {
    question: 'Is an FBAR required immediately after my fifth year?',
    answer:
      'No. Losing the usual student day exclusion means you must reassess residency. Actual countable days, applicable exceptions and elections affect the result. FBAR also requires a reportable foreign-account interest or authority and aggregate values exceeding $10,000, unless a specific filing exception applies.',
  },
  {
    question: 'Do I report accounts if none individually exceeds $10,000?',
    answer:
      'Yes, if you are a U.S. person and the aggregate reportable foreign-account values exceed $10,000 under the applicable rules. Sara’s $4,500 savings, $3,800 deposit and $2,200 brokerage total $10,500. All three are reportable under her stated assumptions, even though each is below $10,000.',
  },
  {
    question: 'Does filing Form 1040-NR prove I do not need FBAR?',
    answer:
      'No. A treaty position may allow nonresident income-tax treatment while you remain a U.S. resident for FBAR. The IRS specifically distinguishes these residency rules. Income-tax filing forms, spousal elections and first-year choices must be evaluated separately rather than used as automatic FBAR shortcuts.',
  },
  {
    question: 'When is the FBAR for calendar year 2026 due?',
    answer:
      'Under the standard rule, April 15, 2027, with an automatic extension to October 15, 2027. You do not request this FBAR extension. Calendar-year 2025 reports have a standard extended deadline of October 15, 2026. Check FinCEN notices for any applicable special relief.',
  },
];
