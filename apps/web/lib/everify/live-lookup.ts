import type { Browser, Frame, Page } from "playwright-core";
import type { EVerifyEmployerRecord, EVerifyStatus } from "./types";

const SEARCH_URL = "https://www.e-verify.gov/e-verify-employer-search";
const ROBOTS_URL = "https://www.e-verify.gov/robots.txt";
const TABLEAU_IFRAME_SELECTOR = "iframe#tableau-viz";
const TABLEAU_VIZ_SELECTOR = "tableau-viz#tableau-viz";
const WORKSHEET_HINT = "Employer List";
const PAGE_SIZE = 10_000;
const DEFAULT_CRAWL_DELAY_SECONDS = 10;
const MAX_RETRIES = 3;
const TIMEOUT_MS = 90_000;

const BLOCK_MARKERS = [
  "access denied",
  "captcha",
  "rate limit exceeded",
  "too many requests",
  "unusual traffic",
  "verify you are human",
];

const FIELD_ALIASES = {
  employer_name: ["employer name", "business name", "company name", "employer"],
  dba_name: [
    "dba name",
    "dba",
    "doing business as name",
    "doing business as dba name",
    "doing business as",
  ],
  status: ["account status", "employer status", "status"],
  enrollment_date: ["enrollment date", "date enrolled", "enrolled date"],
  termination_date: ["termination date", "date terminated", "terminated date"],
  workforce_size_band: ["workforce size", "workforce size band", "workforce"],
  hiring_site_states: [
    "hiring site locations",
    "hiring site states",
    "state territory",
    "states territories",
  ],
} as const;

export interface RobotsPolicy {
  crawlDelaySeconds: number;
  rawText: string;
}

export class EVerifyLiveLookupError extends Error {}
export class EVerifyAutomationBlockedError extends EVerifyLiveLookupError {}

type CrawlGate = () => Promise<void>;

function cleanText(value: unknown): string {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeColumnName(value: unknown): string {
  return cleanText(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function normalizeCompanyName(value: string): string {
  return cleanText(value).toLowerCase();
}

function comparableCompanyName(value: string): string {
  return normalizeCompanyName(value)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(
      /\b(incorporated|inc|corporation|corp|company|co|limited|ltd|llc|pllc|llp|lp)\b/g,
      " "
    )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeStatus(value: unknown): EVerifyStatus | null {
  const status = cleanText(value).toLowerCase();
  if (["open", "active", "currently enrolled", "enrolled"].includes(status)) {
    return "enrolled";
  }
  if (status.includes("terminat") || ["closed", "inactive"].includes(status)) {
    return "terminated";
  }
  if (status.includes("suspend")) return "suspended";
  return null;
}

export function normalizePublicDate(value: unknown): string | null {
  const text = cleanText(value);
  if (!text) return null;

  const isoMatch = text.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return text;

  const usMatch = text.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!usMatch) return null;
  const [, month, day, year] = usMatch;
  const candidate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  const date = new Date(`${candidate}T00:00:00Z`);
  return Number.isNaN(date.valueOf()) || date.toISOString().slice(0, 10) !== candidate
    ? null
    : candidate;
}

function splitStates(value: unknown): string[] {
  const states = cleanText(value)
    .split(/[,;|/]+/)
    .map((state) => state.trim().toUpperCase())
    .filter(Boolean);
  return [...new Set(states)];
}

function findColumnValue(
  row: Record<string, unknown>,
  aliases: readonly string[]
): unknown {
  const normalized = new Map(
    Object.entries(row).map(([key, value]) => [normalizeColumnName(key), value])
  );
  for (const alias of aliases) {
    const exact = normalized.get(normalizeColumnName(alias));
    if (exact !== undefined) return exact;
  }
  for (const alias of aliases) {
    const wanted = normalizeColumnName(alias);
    for (const [column, value] of normalized) {
      if (wanted && (column.includes(wanted) || wanted.includes(column))) return value;
    }
  }
  return "";
}

export function mapTableauRows(
  columns: string[],
  rows: unknown[][]
): EVerifyEmployerRecord[] {
  const seen = new Set<string>();
  const records: EVerifyEmployerRecord[] = [];

  for (const values of rows) {
    const raw = Object.fromEntries(
      columns.map((column, index) => [column, values[index] ?? ""])
    );
    const employerName = cleanText(
      findColumnValue(raw, FIELD_ALIASES.employer_name)
    );
    const status = normalizeStatus(findColumnValue(raw, FIELD_ALIASES.status));
    const enrollmentDate = normalizePublicDate(
      findColumnValue(raw, FIELD_ALIASES.enrollment_date)
    );
    if (!employerName || !status || !enrollmentDate) continue;

    const record: EVerifyEmployerRecord = {
      employer_name: employerName,
      dba_name:
        cleanText(findColumnValue(raw, FIELD_ALIASES.dba_name)) || null,
      status,
      enrollment_date: enrollmentDate,
      termination_date: normalizePublicDate(
        findColumnValue(raw, FIELD_ALIASES.termination_date)
      ),
      workforce_size_band:
        cleanText(findColumnValue(raw, FIELD_ALIASES.workforce_size_band)) || null,
      hiring_site_states: splitStates(
        findColumnValue(raw, FIELD_ALIASES.hiring_site_states)
      ),
    };
    const key = [
      record.employer_name.toLowerCase(),
      record.dba_name?.toLowerCase() ?? "",
      record.enrollment_date,
      record.hiring_site_states.join(","),
    ].join("|");
    if (!seen.has(key)) {
      seen.add(key);
      records.push(record);
    }
  }
  return records;
}

export function selectBestEmployerMatch(
  company: string,
  records: EVerifyEmployerRecord[]
): EVerifyEmployerRecord | null {
  const requested = comparableCompanyName(company);
  if (!requested) return null;

  const exact = records.find((record) =>
    [record.employer_name, record.dba_name]
      .filter((value): value is string => Boolean(value))
      .some((value) => comparableCompanyName(value) === requested)
  );
  if (exact) return exact;

  const prefixMatches = records.filter((record) =>
      [record.employer_name, record.dba_name]
        .filter((value): value is string => Boolean(value))
        .some((value) => comparableCompanyName(value).startsWith(`${requested} `))
  );
  return prefixMatches.length === 1 ? prefixMatches[0] : null;
}

export function parseRobotsPolicy(rawText: string): RobotsPolicy {
  let appliesToWildcard = false;
  let crawlDelaySeconds = 0;
  const disallowed: string[] = [];

  for (const sourceLine of rawText.split(/\r?\n/)) {
    const line = sourceLine.split("#", 1)[0].trim();
    if (!line) continue;
    const separator = line.indexOf(":");
    if (separator < 0) continue;
    const field = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (field === "user-agent") {
      appliesToWildcard = value === "*";
    } else if (appliesToWildcard && field === "crawl-delay") {
      const parsed = Number(value);
      if (Number.isFinite(parsed) && parsed >= 0) crawlDelaySeconds = parsed;
    } else if (appliesToWildcard && field === "disallow" && value) {
      disallowed.push(value);
    }
  }

  const searchPath = new URL(SEARCH_URL).pathname;
  if (disallowed.some((path) => searchPath.startsWith(path))) {
    throw new EVerifyLiveLookupError(
      "robots.txt currently disallows the public E-Verify Employer Search path"
    );
  }

  return {
    crawlDelaySeconds: Math.max(
      DEFAULT_CRAWL_DELAY_SECONDS,
      crawlDelaySeconds
    ),
    rawText,
  };
}

export async function fetchRobotsPolicy(
  userAgent: string
): Promise<RobotsPolicy> {
  const response = await fetch(ROBOTS_URL, {
    headers: { "User-Agent": userAgent, Accept: "text/plain" },
    cache: "no-store",
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new EVerifyLiveLookupError(
      `Could not retrieve robots.txt (HTTP ${response.status})`
    );
  }
  return parseRobotsPolicy(await response.text());
}

async function launchBrowser(): Promise<Browser> {
  const { chromium } = await import("playwright-core");
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    const { default: serverlessChromium } = await import("@sparticuz/chromium");
    return chromium.launch({
      args: serverlessChromium.args,
      executablePath: await serverlessChromium.executablePath(),
      headless: true,
    });
  }

  return chromium.launch({
    executablePath:
      process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || chromium.executablePath(),
    headless: true,
  });
}

async function assertNotBlocked(page: Page, frame: Frame): Promise<void> {
  const combined = `${await page.locator("body").innerText()}\n${await frame
    .locator("body")
    .innerText()}`.toLowerCase();
  const marker = BLOCK_MARKERS.find((value) => combined.includes(value));
  if (marker) {
    throw new EVerifyAutomationBlockedError(
      `The public tool displayed '${marker}'. No bypass was attempted.`
    );
  }
}

async function waitForDashboard(frame: Frame): Promise<void> {
  await frame
    .getByText("E-Verify Participating Employer List", { exact: true })
    .first()
    .waitFor({ state: "visible", timeout: TIMEOUT_MS });
}

async function setFullHistory(frame: Frame, gate: CrawlGate): Promise<void> {
  const title = frame.getByText(/^Date Enrolled/, { exact: false }).first();
  const zone = title.locator(
    "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' tab-zone ')][1]"
  );
  const zoneText = cleanText(await zone.innerText());
  if (/last\s+30\s+years/i.test(zoneText)) return;

  await gate();
  await zone
    .locator("button")
    .filter({ hasText: /This year|Last \d+ years/i })
    .last()
    .click({ force: true, timeout: TIMEOUT_MS });
  const dialog = frame.locator(".RelativeDateFilterDialog");
  await dialog.waitFor({ state: "visible", timeout: TIMEOUT_MS });
  const radio = dialog.locator('input.rradio[value="lastn"]');
  try {
    await radio.check({ force: true, timeout: 5_000 });
  } catch {
    await dialog.getByText("Last years", { exact: true }).click({ force: true });
  }
  const yearsInput = dialog.locator("label#rdf-Lastn-label input.rtext");
  await yearsInput.fill("30");
  await yearsInput.press("Enter");
  await frame.page().waitForTimeout(1_500);
  await waitForDashboard(frame);
}

async function applyCompanyFilter(
  frame: Frame,
  company: string,
  gate: CrawlGate
): Promise<void> {
  await gate();
  const title = frame.getByText(/^Business Name/, { exact: false }).first();
  const zone = title.locator(
    "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' tab-zone ')][1]"
  );
  const input = zone.locator("textarea.QueryBox[aria-labelledby]").last();
  await input.fill(company, { timeout: TIMEOUT_MS });
  await input.press("Enter");
  await frame.page().waitForTimeout(1_500);
  await waitForDashboard(frame);
}

async function readSummaryData(page: Page, gate: CrawlGate) {
  await gate();
  const browserArguments = JSON.stringify({
    vizSelector: TABLEAU_VIZ_SELECTOR,
    worksheetHint: WORKSHEET_HINT,
    pageSize: PAGE_SIZE,
  });
  const metadata = (await page.evaluate(
    `(async ({ vizSelector, worksheetHint, pageSize }) => {
      const viz = document.querySelector(vizSelector);
      const active = viz && viz.workbook && viz.workbook.activeSheet;
      if (!active) return { ok: false, reason: "Tableau Embedding API is unavailable" };
      const worksheets = active.sheetType === "worksheet"
        ? [active]
        : Array.from(active.worksheets || []);
      const normalizedHint = worksheetHint.toLowerCase().replace(/[^a-z0-9]/g, "");
      const worksheet = worksheets.find((sheet) => {
        const name = String(sheet.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
        return name === normalizedHint || name.includes(normalizedHint);
      }) || worksheets.find((sheet) => /employer.*list/i.test(String(sheet.name || "")));
      if (!worksheet || !worksheet.getSummaryDataReaderAsync) {
        return { ok: false, reason: "Employer List worksheet was not found" };
      }
      const reader = await worksheet.getSummaryDataReaderAsync(pageSize, {
        ignoreAliases: false,
      });
      if (!reader.pageCount || !reader.totalRowCount) {
        await reader.releaseAsync();
        return { ok: true, columns: [], rows: [], totalRowCount: 0 };
      }
      try {
        const table = await reader.getPageAsync(0);
        const columns = Array.from(table.columns || []).map((column, index) => ({
          name: column.fieldName || column.caption || column.name || "column_" + index,
          index: Number.isInteger(column.index) ? column.index : index,
        }));
        const valueOf = (cell) => {
          if (cell === null || cell === undefined) return "";
          if (typeof cell !== "object") return cell;
          return cell.formattedValue ?? cell.value ?? "";
        };
        const rows = Array.from(table.data || []).map((row) =>
          columns.map((column) => valueOf(row[column.index]))
        );
        return {
          ok: true,
          columns: columns.map((column) => column.name),
          rows,
          totalRowCount: reader.totalRowCount,
        };
      } finally {
        await reader.releaseAsync();
      }
    })(${browserArguments})`
  )) as {
    ok: boolean;
    reason?: string;
    columns?: string[];
    rows?: unknown[][];
  };

  if (!metadata.ok) {
    throw new EVerifyLiveLookupError(
      `E-Verify result structure changed: ${metadata.reason ?? "unknown reason"}`
    );
  }
  return {
    columns: metadata.columns ?? [],
    rows: metadata.rows ?? [],
  };
}

async function queryOnce(
  company: string,
  userAgent: string,
  gate: CrawlGate
): Promise<EVerifyEmployerRecord[]> {
  const browser = await launchBrowser();
  let blockedStatus: number | null = null;
  try {
    const context = await browser.newContext({
      userAgent,
      locale: "en-US",
      viewport: { width: 1440, height: 1200 },
      extraHTTPHeaders: { DNT: "1" },
    });
    const page = await context.newPage();
    page.on("response", (response) => {
      const hostname = new URL(response.url()).hostname;
      if (
        (hostname.endsWith("e-verify.gov") || hostname.endsWith("uscis.dhs.gov")) &&
        [403, 429].includes(response.status())
      ) {
        blockedStatus = response.status();
      }
    });

    await gate();
    const response = await page.goto(SEARCH_URL, {
      waitUntil: "domcontentloaded",
      timeout: TIMEOUT_MS,
    });
    if (!response || [403, 429].includes(response.status())) {
      throw new EVerifyAutomationBlockedError(
        `Public E-Verify search returned HTTP ${response?.status() ?? "unknown"}`
      );
    }
    const iframe = await page.waitForSelector(TABLEAU_IFRAME_SELECTOR, {
      timeout: TIMEOUT_MS,
    });
    const frame = await iframe.contentFrame();
    if (!frame) throw new EVerifyLiveLookupError("Tableau frame did not load");
    await waitForDashboard(frame);
    await assertNotBlocked(page, frame);
    await setFullHistory(frame, gate);
    await applyCompanyFilter(frame, company, gate);
    if (blockedStatus) {
      throw new EVerifyAutomationBlockedError(
        `Public E-Verify resources returned HTTP ${blockedStatus}`
      );
    }
    await assertNotBlocked(page, frame);
    const summary = await readSummaryData(page, gate);
    await assertNotBlocked(page, frame);
    return mapTableauRows(summary.columns, summary.rows);
  } finally {
    await browser.close();
  }
}

export async function queryEVerifyLive(
  company: string,
  userAgent: string,
  gate: CrawlGate
): Promise<EVerifyEmployerRecord[]> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await queryOnce(company, userAgent, gate);
    } catch (error) {
      if (error instanceof EVerifyAutomationBlockedError) throw error;
      lastError = error;
      if (attempt < MAX_RETRIES) {
        await new Promise((resolve) => setTimeout(resolve, 2 ** (attempt - 1) * 1_000));
      }
    }
  }
  const message = lastError instanceof Error ? lastError.message : "unknown error";
  throw new EVerifyLiveLookupError(
    `Live E-Verify lookup failed after ${MAX_RETRIES} attempts: ${message}`
  );
}
