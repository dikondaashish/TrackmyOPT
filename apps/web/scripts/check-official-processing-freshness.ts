import {
  OFFICIAL_PROCESSING_SNAPSHOTS,
  usableOfficialSnapshot,
} from '../lib/case-status/official-processing-times';
const now = new Date();
const latest = OFFICIAL_PROCESSING_SNAPSHOTS.at(-1);
const usable = usableOfficialSnapshot(latest, now);
const age = latest
  ? (now.getTime() - Date.parse(`${latest.checkedDate}T00:00:00Z`)) / 86400000
  : Infinity;
if (!usable || age >= 21) {
  console.error(
    'Official processing-time snapshot needs human reverification. Follow docs/OFFICIAL_PROCESSING_DATA.md. The UI hides unverified data after 30 days.'
  );
  process.exitCode = 1;
} else
  console.log(
    `Official snapshot verified ${latest!.checkedDate}; ${Math.floor(age)} days old. Next review required before day 21.`
  );
