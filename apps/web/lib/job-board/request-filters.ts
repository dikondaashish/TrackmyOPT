// Job filters reach the job API as bound SQL parameters, so punctuation is
// safe to keep. Search text keeps commas and parentheses ("C++ (Qt)").
export function cleanSearchTerm(value: string) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 120);
}

// Location and Company match stored values exactly ("San Francisco, CA",
// "Anyscale, Inc.", and some locations with double spaces), so only cap the
// length at the column size.
export function exactFilterValue(value: string) {
  return value.slice(0, 1000);
}
