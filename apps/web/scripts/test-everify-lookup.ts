import { lookupEVerifyCompany } from "../lib/everify/lookup-service";

const DEFAULT_COMPANIES = [
  "Microsoft",
  "Google",
  "Infosys",
  "Deloitte",
  "Blue Bottle Coffee",
];

async function main() {
  const companies = process.argv.slice(2);
  const terms = companies.length ? companies : DEFAULT_COMPANIES;
  const results = [];

  for (const company of terms) {
    const result = await lookupEVerifyCompany(company);
    results.push({
      company,
      found: result.found,
      employer_name: result.employer_name,
      status: result.status,
      source: result.source,
      last_checked: result.last_checked,
    });
  }

  const cachedRepeat = await lookupEVerifyCompany(terms[0]);
  if (cachedRepeat.source !== "cache") {
    throw new Error("Repeat lookup did not use the 24-hour cache path");
  }

  console.log(
    JSON.stringify(
      {
        terms: terms.length,
        results,
        repeat_cache_check: "passed",
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
