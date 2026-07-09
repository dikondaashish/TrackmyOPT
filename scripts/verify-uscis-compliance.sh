#!/usr/bin/env bash
# Verify USCIS neighbor-scan kill switch (410) is live in production.
# Usage: ./scripts/verify-uscis-compliance.sh
# Optional: VERIFY_BASE=https://www.trackmyopt.com (default; apex trackmyopt.com 308→www)

set -euo pipefail

BASE="${VERIFY_BASE:-https://www.trackmyopt.com}"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
EVIDENCE_LOG="${REPO_ROOT}/docs/compliance/evidence-log.md"
TS_UTC="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
DATE_HEADING="$(date -u +"%Y-%m-%d")"
LOCAL_SHA="$(git -C "${REPO_ROOT}" rev-parse HEAD 2>/dev/null || echo "unknown")"

FAILURES=0
OUTPUT=""
DEPLOY_SHA=""

append_line() {
  OUTPUT+="$1"$'\n'
}

# Returns HTTP status; sets global HEADER_FILE for deploy SHA extraction.
fetch_status() {
  local method="$1"
  local path="$2"
  local header_file
  header_file="$(mktemp)"
  local status
  status="$(
    curl -sS -L -o /dev/null -w "%{http_code}" -X "${method}" \
      -D "${header_file}" \
      -H "Content-Type: application/json" \
      "${BASE}${path}" 2>/dev/null || echo "000"
  )"
  if [[ -z "${DEPLOY_SHA}" ]]; then
    DEPLOY_SHA="$(
      grep -i '^x-vercel-git-commit-sha:' "${header_file}" 2>/dev/null \
        | head -1 \
        | sed 's/^[^:]*:[[:space:]]*//' \
        | tr -d '\r'
    )"
  fi
  rm -f "${header_file}"
  echo "${status}"
}

assert_410() {
  local method="$1"
  local path="$2"
  local label="$3"
  local status
  status="$(fetch_status "${method}" "${path}")"
  append_line "- \`${method} ${path}\` → **${status}** (${label})"
  if [[ "${status}" != "410" ]]; then
    append_line "  - ❌ expected 410"
    FAILURES=$((FAILURES + 1))
  else
    append_line "  - ✅ kill switch active"
  fi
}

assert_alive_not_410() {
  local method="$1"
  local path="$2"
  local label="$3"
  local status
  status="$(fetch_status "${method}" "${path}")"
  append_line "- \`${method} ${path}\` → **${status}** (${label})"
  if [[ "${status}" == "410" ]]; then
    append_line "  - ❌ route incorrectly returns 410"
    FAILURES=$((FAILURES + 1))
  elif [[ "${status}" == "401" || "${status}" == "403" || "${status}" == "400" || "${status}" == "405" || "${status}" == "503" ]]; then
    append_line "  - ✅ route alive (auth/config gate, not disabled)"
  elif [[ "${status}" =~ ^2 ]]; then
    append_line "  - ✅ route alive (2xx)"
  elif [[ "${status}" == "000" ]]; then
    append_line "  - ❌ request failed"
    FAILURES=$((FAILURES + 1))
  else
    append_line "  - ⚠️ unexpected status ${status} (not 410; treating as alive)"
  fi
}

append_line "## 410 Verification — ${DATE_HEADING}"
append_line ""
append_line "- **Verified at (UTC):** ${TS_UTC}"
append_line "- **Target base URL:** ${BASE}"
append_line "- **Local git SHA:** \`${LOCAL_SHA}\`"
append_line ""

append_line "### Disabled endpoints (must be 410)"
assert_410 "GET" "/api/cron/scan-nearby-cases" "cron neighbor scanner"
assert_410 "POST" "/api/case-status/nearby/scan" "internal neighbor batch scan"
assert_410 "GET" "/api/case-status/nearby" "nearby cohort API"

append_line ""
append_line "### Authorized routes (must NOT be 410)"
assert_alive_not_410 "POST" "/api/case-status/refresh" "manual refresh (unauthenticated)"
assert_alive_not_410 "GET" "/api/case-status" "case list (unauthenticated)"
assert_alive_not_410 "POST" "/api/case-status/check" "USCIS check (no secret)"
assert_alive_not_410 "GET" "/api/cron/check-case-status" "daily enrolled-case cron"

if [[ -n "${DEPLOY_SHA}" ]]; then
  append_line ""
  append_line "- **Deployed git SHA (Vercel header):** \`${DEPLOY_SHA}\`"
else
  append_line ""
  append_line "- **Deployed git SHA (Vercel header):** _not present in response headers_"
fi

append_line ""
if [[ "${FAILURES}" -eq 0 ]]; then
  append_line "**Result:** PASS (${FAILURES} failures)"
else
  append_line "**Result:** FAIL (${FAILURES} failures)"
fi
append_line ""

# Print to stdout
printf '%s' "${OUTPUT}"

mkdir -p "$(dirname "${EVIDENCE_LOG}")"
if [[ ! -f "${EVIDENCE_LOG}" ]]; then
  cat > "${EVIDENCE_LOG}" <<'EOF'
# USCIS Torch API — Compliance Evidence Log

Chronological record for regulator response and internal audit. Do not delete rows or evidence.

EOF
fi

{
  echo ""
  printf '%s' "${OUTPUT}"
} >> "${EVIDENCE_LOG}"

echo "Appended verification to ${EVIDENCE_LOG}"

if [[ "${FAILURES}" -ne 0 ]]; then
  exit 1
fi
