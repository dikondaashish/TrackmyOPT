import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { API_ENDPOINTS } from "../src/config";

assert.equal(
  API_ENDPOINTS.DASHBOARD_JOB_PREFILL,
  "https://www.trackmyopt.com/dashboard/extension"
);

const popupHome = readFileSync("src/home.ts", "utf8");
assert.match(
  popupHome,
  /id="manage-job-prefill-link"[\s\S]+API_ENDPOINTS\.DASHBOARD_JOB_PREFILL/,
  "the signed-in extension popup must link to the job-prefill setup page"
);

const jobPortal = readFileSync("src/content-job-portal.ts", "utf8");
assert.match(
  jobPortal,
  /Manage saved prefill data[\s\S]+API_ENDPOINTS\.DASHBOARD_JOB_PREFILL/,
  "the in-page extension assistant must expose the same setup link"
);

console.log("job-prefill-entrypoint: web dashboard links are discoverable from the extension");

