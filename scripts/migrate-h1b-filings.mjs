import fs from "node:fs";
import path from "node:path";
import zlib from "node:zlib";
import { createRequire } from "node:module";

const require = createRequire(new URL("../apps/web/package.json", import.meta.url));
const { createClient } = require("@supabase/supabase-js");

const columns = [
  "id", "case_number", "status", "received_date", "decision_date", "original_cert_date",
  "visa_class", "job_title", "soc_code", "soc_title", "full_time_position", "begin_date",
  "end_date", "total_workers", "employer_name", "employer_address1", "employer_address2",
  "employer_city", "employer_state", "employer_postal_code", "employer_country", "employer_phone",
  "employer_phone_ext", "employer_province", "employer_fein", "naics_code", "employer_poc_name",
  "employer_poc_job_title", "employer_poc_address1", "employer_poc_address2", "employer_poc_city",
  "employer_poc_state", "employer_poc_postal_code", "employer_poc_province", "employer_poc_country",
  "employer_poc_email", "employer_poc_phone", "employer_poc_phone_ext", "agent_attorney_name",
  "agent_attorney_address1", "agent_attorney_address2", "agent_attorney_city", "agent_attorney_state",
  "agent_attorney_postal_code", "agent_attorney_province", "agent_attorney_country", "agent_attorney_email",
  "agent_attorney_phone", "agent_attorney_phone_ext", "agent_representing_employer", "lawfirm_name",
  "lawfirm_business_fein", "worksite_address1", "worksite_address2", "worksite_city", "worksite_county",
  "worksite_state", "worksite_postal_code", "worksite_workers", "total_worksite_locations", "trade_name_dba",
  "secondary_entity", "secondary_entity_business_name", "wage_rate_from", "wage_rate_to", "wage_unit",
  "prevailing_wage", "pw_unit", "pw_wage_level", "pw_source", "pw_source_year", "pw_other_source",
  "pw_other_year", "pw_tracking_number", "pw_survey_name", "pw_survey_publisher", "sponsor_id",
  "new_employment", "continued_employment", "change_previous_employment", "new_concurrent_employment",
  "change_employer", "amended_petition", "h_1b_dependent", "willful_violator", "support_h1b",
  "appendix_a_attached", "public_disclosure", "agree_to_lc_statement", "statutory_basis", "preparer_first_name",
  "preparer_middle_initial", "preparer_last_name", "preparer_business_name", "preparer_email", "created_at",
  "state_of_highest_court", "name_of_highest_state_court",
];

const pageSize = 1000;
const insertSize = 500;
const sourceUrl = process.env.PRIMARY_SUPABASE_URL;
const sourceKey = process.env.PRIMARY_SUPABASE_SERVICE_ROLE_KEY;
const targetUrl = process.env.SUPABASE_FILINGS_URL;
const targetKey = process.env.SUPABASE_FILINGS_SERVICE_ROLE_KEY;
const backupPath = process.env.H1B_FILINGS_BACKUP_PATH;

if (!sourceUrl || !sourceKey || !targetUrl || !targetKey || !backupPath) {
  throw new Error("PRIMARY_SUPABASE_URL, PRIMARY_SUPABASE_SERVICE_ROLE_KEY, SUPABASE_FILINGS_URL, SUPABASE_FILINGS_SERVICE_ROLE_KEY, and H1B_FILINGS_BACKUP_PATH are required");
}

const source = createClient(sourceUrl, sourceKey, { auth: { persistSession: false } });
const target = createClient(targetUrl, targetKey, { auth: { persistSession: false } });
fs.mkdirSync(path.dirname(backupPath), { recursive: true });
const backup = zlib.createGzip({ level: 6 });
const output = fs.createWriteStream(backupPath, { flags: "wx" });
backup.pipe(output);

async function withRetry(operation, label) {
  let lastError;
  const maxAttempts = 10;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === maxAttempts) break;
      const delayMs = Math.min(15_000, 500 * (2 ** (attempt - 1)));
      console.warn(`${label} failed (attempt ${attempt}/${maxAttempts}); retrying in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

// A failed run can resume from the greatest UUID already present in the target.
// The caller supplies this checkpoint after verifying the target count.
let lastId = process.env.H1B_FILINGS_START_ID || undefined;
let imported = 0;
try {
  while (true) {
    const { data, error } = await withRetry(
      async () => {
        let query = source
          .from("h1b_filings")
          .select(columns.join(","))
          .order("id", { ascending: true })
          .limit(pageSize);
        if (lastId) query = query.gt("id", lastId);
        const response = await query;
        if (response.error) throw new Error(response.error.message);
        return response;
      },
      `source page after ${lastId ?? "start"}`
    );
    if (error) throw new Error(`source page after ${lastId ?? "start"}: ${error.message}`);
    if (!data?.length) break;

    for (const row of data) {
      backup.write(`${JSON.stringify(row)}\n`);
    }

    for (let i = 0; i < data.length; i += insertSize) {
      const chunk = data.slice(i, i + insertSize);
      const { error: insertError } = await withRetry(
        async () => {
          const response = await target
            .from("h1b_filings")
            .upsert(chunk, { onConflict: "id" });
          if (response.error) throw new Error(response.error.message);
          return response;
        },
        `target batch after ${lastId ?? "start"}`
      );
      if (insertError) {
        throw new Error(`target batch after ${lastId ?? "start"}: ${insertError.message}`);
      }
      imported += chunk.length;
    }

    lastId = data[data.length - 1].id;
    console.log(`migrated=${imported}`);
    if (data.length < pageSize) break;
  }
} finally {
  backup.end();
  await new Promise((resolve, reject) => {
    output.once("finish", resolve);
    output.once("error", reject);
  });
}

console.log(JSON.stringify({ imported, backupPath, columns: columns.length }));
