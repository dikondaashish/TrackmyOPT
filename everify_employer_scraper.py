#!/usr/bin/env python3
"""Conservative scraper for the public E-Verify Employer Search dashboard.

The public search page currently embeds a Tableau dashboard. The dashboard's
result table is rendered as image tiles, so this script uses Playwright to:

1. verify e-verify.gov/robots.txt and enforce its crawl delay;
2. operate the public Business Name and Date Enrolled filters;
3. read the visible worksheet through Tableau's supported, paginated summary
   data API;
4. fall back to Tableau's public crosstab CSV dialog; and
5. parse an HTML table if the site changes its renderer.

It never visits e-verify.uscis.gov, never uses the login-gated verification
system, never calls e-verify.gov/export-employers-csv2 (disallowed by
robots.txt), and never attempts to solve CAPTCHAs or bypass blocking.

Quick start::

    python3 -m venv .venv
    source .venv/bin/activate
    pip install -r requirements.txt
    playwright install chromium
    python everify_employer_scraper.py \
      --contact-email support@example.com \
      --terms-file employer_terms.txt

You can also pass repeated ``--term`` options or ``--alphabet``. Results are
appended to ``everify_employers.csv`` after every data page. A standard JSON
array is synchronized to ``everify_employers.json`` after each completed search
term. Re-run the same command to resume from ``checkpoint.json``.

Run ``--health-check`` by itself before a larger job to query one known employer,
validate required fields/statuses/dates/deduplication in memory, and exit without
writing crawl results. When combined with crawl terms, it runs as a preflight.

Runtime depends on the number and breadth of terms. The current robots.txt
requires at least 10 seconds between crawl operations. Therefore even a small
26-term run has a floor of several minutes; broad terms that return many
10,000-row pages can take one or more hours. Start with a few narrow terms and
inspect the output before attempting a wide run.

The public tool does not currently expose a street address, despite some older
descriptions of the dataset. When an address column is present, deduplication
uses employer name + address. Otherwise it uses the strongest public composite
available: employer name + DBA + enrollment date + hiring-site states. The
script does not retrieve non-displayed fields to manufacture an address.
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import datetime as dt
import json
import logging
import os
import re
import string
import sys
import tempfile
import time
import urllib.parse
import urllib.request
import urllib.robotparser
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Sequence, Set, Tuple

from playwright.async_api import (
    Browser,
    BrowserContext,
    FrameLocator,
    Page,
    async_playwright,
)
from playwright.async_api import (
    Error as PlaywrightError,
)
from playwright.async_api import (
    TimeoutError as PlaywrightTimeoutError,
)

SEARCH_URL = "https://www.e-verify.gov/e-verify-employer-search"
ROBOTS_URL = "https://www.e-verify.gov/robots.txt"
TABLEAU_IFRAME_SELECTOR = "iframe#tableau-viz"
TABLEAU_VIZ_SELECTOR = "tableau-viz#tableau-viz"
DEFAULT_TABLEAU_WORKSHEET_HINT = "Employer List"
DEFAULT_CRAWL_DELAY_SECONDS = 10.0
DEFAULT_HEALTH_CHECK_TERM = "Microsoft"
MAX_RETRIES = 3
PAGE_SIZE = 10_000
VALID_STATUSES = frozenset({"enrolled", "terminated", "suspended"})
DATE_FORMATS = (
    "%m/%d/%Y",
    "%Y-%m-%d",
    "%m/%d/%y",
    "%b %d, %Y",
    "%B %d, %Y",
)

OUTPUT_FIELDS = [
    "employer_name",
    "dba_name",
    "status",
    "enrollment_date",
    "termination_date",
    "workforce_size_band",
    "hiring_site_count",
    "hiring_site_states",
]

BLOCK_MARKERS = (
    "access denied",
    "captcha",
    "rate limit exceeded",
    "too many requests",
    "unusual traffic",
    "verify you are human",
)

FIELD_ALIASES = {
    "employer_name": (
        "employer name",
        "business name",
        "company name",
        "employer",
    ),
    "dba_name": (
        "dba name",
        "dba",
        "doing business as name",
        "doing business as dba name",
        "doing business as",
    ),
    "status": ("account status", "employer status", "status"),
    "enrollment_date": ("enrollment date", "date enrolled", "enrolled date"),
    "termination_date": ("termination date", "date terminated", "terminated date"),
    "workforce_size_band": ("workforce size", "workforce size band", "workforce"),
    "hiring_site_count": (
        "number of hiring sites",
        "hiring site count",
        "total hiring sites",
    ),
    "hiring_site_states": (
        "hiring site locations",
        "hiring site states",
        "state territory",
        "states territories",
    ),
    "_address": ("employer address", "business address", "address"),
}


class ScraperError(RuntimeError):
    """Base error for a controlled scraper stop."""


class RobotsDisallowed(ScraperError):
    """Raised when robots.txt does not permit the public search page."""


class AutomationBlocked(ScraperError):
    """Raised for CAPTCHA, access denial, HTTP 403, or HTTP 429."""


class DataExtractionError(ScraperError):
    """Raised when neither the supported Tableau reader nor DOM works."""


@dataclass(frozen=True)
class RobotsPolicy:
    crawl_delay_seconds: float
    raw_text: str


@dataclass
class Checkpoint:
    completed_terms: Set[str]
    in_progress_term: Optional[str] = None
    next_page: int = 0

    @classmethod
    def load(cls, path: Path) -> "Checkpoint":
        if not path.exists():
            return cls(completed_terms=set())
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError) as exc:
            raise ScraperError(f"Cannot read checkpoint {path}: {exc}") from exc
        in_progress = payload.get("in_progress") or {}
        return cls(
            completed_terms=set(payload.get("completed_terms", [])),
            in_progress_term=in_progress.get("term"),
            next_page=int(in_progress.get("next_page", 0)),
        )

    def save(self, path: Path) -> None:
        payload = {
            "version": 1,
            "source": SEARCH_URL,
            "updated_at_utc": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
            "completed_terms": sorted(self.completed_terms),
            "in_progress": (
                {"term": self.in_progress_term, "next_page": self.next_page}
                if self.in_progress_term
                else None
            ),
        }
        path.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary_name = tempfile.mkstemp(
            prefix=f".{path.name}.", suffix=".tmp", dir=str(path.parent)
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as handle:
                json.dump(payload, handle, indent=2, sort_keys=True)
                handle.write("\n")
                handle.flush()
                os.fsync(handle.fileno())
            os.replace(temporary_name, path)
        finally:
            if os.path.exists(temporary_name):
                os.unlink(temporary_name)


class CrawlRateLimiter:
    def __init__(self, delay_seconds: float) -> None:
        self.delay_seconds = delay_seconds
        self._last_operation_at: Optional[float] = None

    async def wait(self) -> None:
        if self._last_operation_at is not None:
            elapsed = time.monotonic() - self._last_operation_at
            remaining = self.delay_seconds - elapsed
            if remaining > 0:
                await asyncio.sleep(remaining)
        self._last_operation_at = time.monotonic()


class IncrementalOutput:
    def __init__(self, csv_path: Path, json_path: Optional[Path]) -> None:
        self.csv_path = csv_path
        self.json_path = json_path
        self.seen_keys: Set[str] = set()
        self.total_unique = 0
        self._load_existing_keys()

    def _load_existing_keys(self) -> None:
        if not self.csv_path.exists() or self.csv_path.stat().st_size == 0:
            return
        try:
            with self.csv_path.open("r", encoding="utf-8", newline="") as handle:
                for row in csv.DictReader(handle):
                    for key in dedupe_keys(row):
                        self.seen_keys.add(key)
                    self.total_unique += 1
        except (OSError, csv.Error) as exc:
            raise ScraperError(f"Cannot resume from {self.csv_path}: {exc}") from exc
    def append(self, records: Iterable[Dict[str, Any]]) -> int:
        new_records: List[Dict[str, Any]] = []
        for source_record in records:
            record = {field: source_record.get(field, "") for field in OUTPUT_FIELDS}
            keys = dedupe_keys(source_record)
            if not keys or any(key in self.seen_keys for key in keys):
                continue
            self.seen_keys.update(keys)
            new_records.append(record)

        if not new_records:
            return 0

        self.csv_path.parent.mkdir(parents=True, exist_ok=True)
        needs_header = not self.csv_path.exists() or self.csv_path.stat().st_size == 0
        with self.csv_path.open("a", encoding="utf-8", newline="") as handle:
            writer = csv.DictWriter(handle, fieldnames=OUTPUT_FIELDS)
            if needs_header:
                writer.writeheader()
            writer.writerows(new_records)
            handle.flush()
            os.fsync(handle.fileno())

        self.total_unique += len(new_records)
        return len(new_records)

    def sync_json(self) -> None:
        """Atomically rebuild a standard JSON array from authoritative CSV."""

        if self.json_path is None:
            return
        self.json_path.parent.mkdir(parents=True, exist_ok=True)
        fd, temporary_name = tempfile.mkstemp(
            prefix=f".{self.json_path.name}.",
            suffix=".tmp",
            dir=str(self.json_path.parent),
        )
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as destination:
                destination.write("[\n")
                first = True
                if self.csv_path.exists() and self.csv_path.stat().st_size > 0:
                    with self.csv_path.open("r", encoding="utf-8", newline="") as source:
                        for row in csv.DictReader(source):
                            if not first:
                                destination.write(",\n")
                            json_record: Dict[str, Any] = dict(row)
                            json_record["hiring_site_count"] = parse_count(
                                json_record.get("hiring_site_count")
                            )
                            json.dump(json_record, destination, ensure_ascii=False)
                            first = False
                destination.write("\n]\n")
                destination.flush()
                os.fsync(destination.fileno())
            os.replace(temporary_name, self.json_path)
        finally:
            if os.path.exists(temporary_name):
                os.unlink(temporary_name)


def normalize_column_name(value: Any) -> str:
    text = str(value or "").casefold()
    return re.sub(r"[^a-z0-9]+", " ", text).strip()


def clean_text(value: Any) -> str:
    if value is None:
        return ""
    return re.sub(r"\s+", " ", str(value)).strip()


def normalize_status(value: Any) -> str:
    text = clean_text(value)
    lowered = text.casefold()
    if lowered in {"open", "active", "currently enrolled", "enrolled"}:
        return "enrolled"
    if "terminat" in lowered or lowered in {"closed", "inactive"}:
        return "terminated"
    if "suspend" in lowered:
        return "suspended"
    return lowered


def parse_count(value: Any) -> Any:
    text = clean_text(value)
    if not text:
        return ""
    digits = text.replace(",", "")
    return int(digits) if digits.isdigit() else text


def find_column_value(row: Dict[str, Any], aliases: Sequence[str]) -> Any:
    normalized = {normalize_column_name(key): value for key, value in row.items()}
    for alias in aliases:
        exact = normalized.get(normalize_column_name(alias))
        if exact is not None:
            return exact
    for alias in aliases:
        wanted = normalize_column_name(alias)
        for column, value in normalized.items():
            if wanted and (wanted in column or column in wanted):
                return value
    return ""


def map_public_record(row: Dict[str, Any]) -> Dict[str, Any]:
    record: Dict[str, Any] = {
        field: clean_text(find_column_value(row, aliases))
        for field, aliases in FIELD_ALIASES.items()
    }
    record["status"] = normalize_status(record["status"])
    record["hiring_site_count"] = parse_count(record["hiring_site_count"])
    return record


def dedupe_key(record: Dict[str, Any]) -> str:
    keys = dedupe_keys(record)
    return keys[0] if keys else ""


def dedupe_keys(record: Dict[str, Any]) -> List[str]:
    name = clean_text(record.get("employer_name")).casefold()
    if not name:
        return []
    address = clean_text(record.get("_address") or record.get("employer_address")).casefold()
    fallback = "|".join(
        clean_text(record.get(field)).casefold()
        for field in (
            "dba_name",
            "enrollment_date",
            "hiring_site_states",
        )
    )
    keys = [f"public-composite|{name}|{fallback}"]
    if address:
        keys.insert(0, f"address|{name}|{address}")
    return keys


def fetch_robots_policy(user_agent: str, timeout_seconds: float = 30.0) -> RobotsPolicy:
    request = urllib.request.Request(ROBOTS_URL, headers={"User-Agent": user_agent})
    try:
        with urllib.request.urlopen(request, timeout=timeout_seconds) as response:
            raw = response.read().decode("utf-8", errors="replace")
    except Exception as exc:
        raise ScraperError(
            f"Could not retrieve {ROBOTS_URL}; stopping closed rather than guessing: {exc}"
        ) from exc

    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(ROBOTS_URL)
    parser.parse(raw.splitlines())
    if not parser.can_fetch(user_agent, SEARCH_URL):
        raise RobotsDisallowed(f"robots.txt disallows {SEARCH_URL}; no requests were made.")

    crawl_delay = parser.crawl_delay(user_agent)
    if crawl_delay is None:
        crawl_delay = parser.crawl_delay("*")
    return RobotsPolicy(float(crawl_delay or 0), raw)


def ensure_url_allowed_by_robots(url: str, policy: RobotsPolicy, user_agent: str) -> None:
    parsed = urllib.parse.urlparse(url)
    source = urllib.parse.urlparse(SEARCH_URL)
    if parsed.netloc.casefold() != source.netloc.casefold():
        return
    parser = urllib.robotparser.RobotFileParser()
    parser.set_url(ROBOTS_URL)
    parser.parse(policy.raw_text.splitlines())
    if not parser.can_fetch(user_agent, url):
        raise RobotsDisallowed(f"robots.txt disallows discovered endpoint: {url}")


def build_user_agent(contact_email: str) -> str:
    if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", contact_email):
        raise ScraperError("--contact-email must be a valid contact email address")
    return (
        "TrackMyOPT-EVerifyEmployerSearchBot/1.0 "
        f"(+https://www.trackmyopt.com; contact={contact_email})"
    )


def load_terms(args: argparse.Namespace, *, allow_empty: bool = False) -> List[str]:
    terms: List[str] = []
    terms.extend(args.term or [])
    if args.terms_file:
        try:
            terms.extend(
                line.strip()
                for line in args.terms_file.read_text(encoding="utf-8").splitlines()
                if line.strip() and not line.lstrip().startswith("#")
            )
        except OSError as exc:
            raise ScraperError(f"Cannot read terms file {args.terms_file}: {exc}") from exc
    if args.alphabet:
        terms.extend(string.ascii_uppercase)

    unique: List[str] = []
    seen: Set[str] = set()
    for term in terms:
        cleaned = clean_text(term)
        if not cleaned:
            continue
        folded = cleaned.casefold()
        if folded not in seen:
            seen.add(folded)
            unique.append(cleaned)
    if not unique and not allow_empty:
        raise ScraperError("Provide --term, --terms-file, or --alphabet")
    return unique


class EVerifyBrowserScraper:
    def __init__(
        self,
        browser: Browser,
        context: BrowserContext,
        rate_limiter: CrawlRateLimiter,
        robots_policy: RobotsPolicy,
        user_agent: str,
        years: int,
        timeout_ms: int,
        worksheet_hint: str,
    ) -> None:
        self.browser = browser
        self.context = context
        self.rate_limiter = rate_limiter
        self.robots_policy = robots_policy
        self.user_agent = user_agent
        self.years = years
        self.timeout_ms = timeout_ms
        self.worksheet_hint = worksheet_hint
        self.page: Optional[Page] = None
        self.block_reason: Optional[str] = None
        self.json_candidates: Set[str] = set()

    async def open(self) -> None:
        await self._new_page()

    async def close(self) -> None:
        if self.page is not None:
            await self.page.close()
            self.page = None

    async def reset(self) -> None:
        await self.close()
        await self._new_page()

    async def _new_page(self) -> None:
        await self.rate_limiter.wait()
        page = await self.context.new_page()
        page.on("response", self._observe_response)
        self.page = page
        response = await page.goto(
            SEARCH_URL, wait_until="domcontentloaded", timeout=self.timeout_ms
        )
        if response is not None and response.status in {403, 429}:
            raise AutomationBlocked(f"Public search returned HTTP {response.status}")
        await page.wait_for_selector(TABLEAU_IFRAME_SELECTOR, timeout=self.timeout_ms)
        await self._wait_for_tableau()
        await self._stop_if_blocked()
        await self._set_full_history()

    def _observe_response(self, response: Any) -> None:
        parsed = urllib.parse.urlparse(response.url)
        resource_type = response.request.resource_type
        relevant_host = parsed.netloc.endswith("e-verify.gov") or parsed.netloc.endswith(
            "uscis.dhs.gov"
        )
        if (
            relevant_host
            and resource_type in {"document", "xhr", "fetch"}
            and response.status in {403, 429}
        ):
            self.block_reason = f"HTTP {response.status} from {parsed.netloc}"
        content_type = response.headers.get("content-type", "").casefold()
        if (
            relevant_host
            and resource_type in {"xhr", "fetch"}
            and "application/json" in content_type
        ):
            safe_url = urllib.parse.urlunsplit(
                (parsed.scheme, parsed.netloc, parsed.path, "", "")
            )
            self.json_candidates.add(safe_url)

    def _require_page(self) -> Page:
        if self.page is None:
            raise ScraperError("Browser page is not open")
        return self.page

    def _frame(self) -> FrameLocator:
        return self._require_page().frame_locator(TABLEAU_IFRAME_SELECTOR)

    async def _wait_for_tableau(self) -> None:
        frame = self._frame()
        await frame.locator("body").wait_for(state="visible", timeout=self.timeout_ms)
        await frame.get_by_text(
            "E-Verify Participating Employer List", exact=True
        ).first.wait_for(state="visible", timeout=self.timeout_ms)

    async def _stop_if_blocked(self) -> None:
        if self.block_reason:
            raise AutomationBlocked(self.block_reason)
        page = self._require_page()
        top_text = (await page.locator("body").inner_text()).casefold()
        frame_text = ""
        try:
            frame_text = (await self._frame().locator("body").inner_text()).casefold()
        except PlaywrightError:
            pass
        combined = f"{top_text}\n{frame_text}"
        marker = next((item for item in BLOCK_MARKERS if item in combined), None)
        if marker:
            raise AutomationBlocked(
                f"The public tool displayed '{marker}'. Stopping; no bypass attempted."
            )

    async def _set_full_history(self) -> None:
        if self.years <= 1:
            return
        await self.rate_limiter.wait()
        frame = self._frame()
        title = frame.get_by_text(re.compile(r"^Date Enrolled"), exact=False).first
        zone = title.locator(
            "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' tab-zone ')][1]"
        )
        current_text = clean_text(await zone.inner_text())
        if re.search(rf"last\s+{self.years}\s+years", current_text, re.I):
            return

        current_button = zone.locator("button").filter(
            has_text=re.compile(r"This year|Last \d+ years", re.I)
        ).last
        await current_button.click(force=True, timeout=self.timeout_ms)
        dialog = frame.locator(".RelativeDateFilterDialog")
        await dialog.wait_for(state="visible", timeout=self.timeout_ms)

        radio = dialog.locator('input.rradio[value="lastn"]')
        try:
            await radio.check(force=True, timeout=5_000)
        except PlaywrightError:
            await dialog.get_by_text("Last years", exact=True).click(
                force=True, timeout=5_000
            )
        years_input = dialog.locator("label#rdf-Lastn-label input.rtext")
        await years_input.fill(str(self.years), timeout=self.timeout_ms)
        await years_input.press("Enter", timeout=self.timeout_ms)
        await self._wait_for_dashboard_update()
        await self._stop_if_blocked()

    async def _wait_for_dashboard_update(self) -> None:
        page = self._require_page()
        await page.wait_for_timeout(1_500)
        # Tableau does not become network-idle because it keeps a live session.
        # Waiting for the worksheet title after the debounce is the stable signal.
        await self._frame().get_by_text(
            "E-Verify Participating Employer List", exact=True
        ).first.wait_for(state="visible", timeout=self.timeout_ms)

    async def apply_search_term(self, term: str) -> None:
        await self.rate_limiter.wait()
        frame = self._frame()
        title = frame.get_by_text(re.compile(r"^Business Name"), exact=False).first
        zone = title.locator(
            "xpath=ancestor::div[contains(concat(' ', normalize-space(@class), ' '), ' tab-zone ')][1]"
        )
        query = zone.locator("textarea.QueryBox[aria-labelledby]").last
        await query.fill(term, timeout=self.timeout_ms)
        await query.press("Enter", timeout=self.timeout_ms)
        await self._wait_for_dashboard_update()
        await self._stop_if_blocked()

    async def initialize_summary_reader(self) -> Dict[str, Any]:
        page = self._require_page()
        result = await page.evaluate(
            """
            async ({ vizSelector, worksheetHint, pageSize }) => {
              const viz = document.querySelector(vizSelector);
              if (!viz || !viz.workbook || !viz.workbook.activeSheet) {
                return { ok: false, reason: "Tableau Embedding API is unavailable" };
              }
              const active = viz.workbook.activeSheet;
              const worksheets = active.sheetType === "worksheet"
                ? [active]
                : Array.from(active.worksheets || []);
              const normalizedHint = worksheetHint.toLowerCase().replace(/[^a-z0-9]/g, "");
              const worksheet = worksheets.find((sheet) => {
                const name = String(sheet.name || "").toLowerCase().replace(/[^a-z0-9]/g, "");
                return name === normalizedHint || name.includes(normalizedHint);
              }) || worksheets.find((sheet) => /employer.*list/i.test(String(sheet.name || "")));
              if (!worksheet) {
                return {
                  ok: false,
                  reason: "Employer worksheet not found",
                  worksheetNames: worksheets.map((sheet) => sheet.name),
                };
              }
              if (window.__trackmyoptEVerifyReader) {
                try { await window.__trackmyoptEVerifyReader.releaseAsync(); } catch (_) {}
              }
              const reader = await worksheet.getSummaryDataReaderAsync(pageSize, {
                ignoreAliases: false,
              });
              window.__trackmyoptEVerifyReader = reader;
              return {
                ok: true,
                worksheetName: worksheet.name,
                pageCount: reader.pageCount,
                totalRowCount: reader.totalRowCount,
              };
            }
            """,
            {
                "vizSelector": TABLEAU_VIZ_SELECTOR,
                "worksheetHint": self.worksheet_hint,
                "pageSize": PAGE_SIZE,
            },
        )
        return dict(result or {})

    async def read_summary_page(self, page_index: int) -> Tuple[List[str], List[List[Any]]]:
        await self.rate_limiter.wait()
        page = self._require_page()
        payload = await page.evaluate(
            """
            async (pageIndex) => {
              const reader = window.__trackmyoptEVerifyReader;
              if (!reader) throw new Error("Summary data reader is not initialized");
              const table = await reader.getPageAsync(pageIndex);
              const columns = Array.from(table.columns || []).map((column, index) => ({
                name: column.fieldName || column.caption || column.name || `column_${index}`,
                index: Number.isInteger(column.index) ? column.index : index,
              }));
              const valueOf = (cell) => {
                if (cell === null || cell === undefined) return "";
                if (typeof cell !== "object") return cell;
                if (cell.formattedValue !== undefined && cell.formattedValue !== null) {
                  return cell.formattedValue;
                }
                if (cell.value !== undefined && cell.value !== null) return cell.value;
                return "";
              };
              const rows = Array.from(table.data || []).map((row) =>
                columns.map((column) => valueOf(row[column.index]))
              );
              return { columns: columns.map((column) => column.name), rows };
            }
            """,
            page_index,
        )
        await self._stop_if_blocked()
        return list(payload.get("columns", [])), list(payload.get("rows", []))

    async def release_summary_reader(self) -> None:
        if self.page is None:
            return
        try:
            await self.page.evaluate(
                """
                async () => {
                  if (window.__trackmyoptEVerifyReader) {
                    try { await window.__trackmyoptEVerifyReader.releaseAsync(); } finally {
                      delete window.__trackmyoptEVerifyReader;
                    }
                  }
                }
                """
            )
        except PlaywrightError:
            pass

    async def download_public_crosstab(self) -> Path:
        """Download the currently filtered Employer List via Tableau's UI.

        This is intentionally a UI action rather than a constructed export URL.
        It cannot drift into e-verify.gov/export-employers-csv2, and it keeps
        Tableau's current session and filter semantics intact.
        """

        await self.rate_limiter.wait()
        page = self._require_page()
        frame = self._frame()
        await frame.get_by_role("button", name="Download", exact=True).click(
            timeout=self.timeout_ms
        )
        await frame.get_by_text("Crosstab", exact=True).click(timeout=self.timeout_ms)
        dialog = frame.locator('[role="dialog"][aria-label="Download Crosstab"]')
        await dialog.wait_for(state="visible", timeout=self.timeout_ms)
        await dialog.get_by_role("option", name=self.worksheet_hint, exact=True).click(
            timeout=self.timeout_ms
        )
        csv_radio = dialog.locator('input[type="radio"][value="csv"]')
        await csv_radio.check(force=True, timeout=self.timeout_ms)
        async with page.expect_download(timeout=self.timeout_ms) as download_info:
            await dialog.get_by_role("button", name="Download", exact=True).click(
                timeout=self.timeout_ms
            )
        download = await download_info.value
        download_url = download.url
        ensure_url_allowed_by_robots(
            download_url, self.robots_policy, self.user_agent
        )
        parsed = urllib.parse.urlparse(download_url)
        if parsed.netloc.casefold() == urllib.parse.urlparse(SEARCH_URL).netloc.casefold():
            raise RobotsDisallowed(
                "Refusing a crosstab download hosted on e-verify.gov; only the Tableau-hosted public export is allowed."
            )
        path = await download.path()
        if path is None:
            raise DataExtractionError("Tableau crosstab download did not produce a file")
        await self._stop_if_blocked()
        return Path(path)

    async def read_dom_table(self) -> Tuple[List[str], List[List[Any]], bool]:
        """Fallback for a future HTML-table renderer.

        Returns columns, rows, and whether a usable enabled Next button exists.
        The current Tableau deployment uses image tiles, so this path is not
        expected to run today.
        """

        frame = self._frame()
        tables = frame.locator("table")
        if await tables.count() == 0:
            raise DataExtractionError(
                "No stable JSON endpoint, Tableau summary reader, or HTML result table was available. "
                "The site may have changed; stopping without OCR or endpoint reverse engineering."
            )
        table = tables.filter(has_text=re.compile(r"Employer|DBA|Enrollment", re.I)).first
        headers = [clean_text(value) for value in await table.locator("thead th").all_text_contents()]
        rows = await table.locator("tbody tr").evaluate_all(
            "rows => rows.map(row => Array.from(row.querySelectorAll('th,td')).map(cell => cell.innerText.trim()))"
        )
        next_button = frame.get_by_role("button", name=re.compile(r"^Next", re.I)).last
        has_next = await next_button.count() > 0 and await next_button.is_enabled()
        return headers, rows, has_next

    async def advance_dom_page(self) -> None:
        await self.rate_limiter.wait()
        button = self._frame().get_by_role("button", name=re.compile(r"^Next", re.I)).last
        await button.click(timeout=self.timeout_ms)
        await self._wait_for_dashboard_update()
        await self._stop_if_blocked()


def rows_to_records(columns: Sequence[str], rows: Sequence[Sequence[Any]]) -> List[Dict[str, Any]]:
    records: List[Dict[str, Any]] = []
    for values in rows:
        raw = {
            columns[index]: values[index] if index < len(values) else ""
            for index in range(len(columns))
        }
        record = map_public_record(raw)
        if record["employer_name"]:
            records.append(record)
    return records


def is_valid_date(value: Any) -> bool:
    text = clean_text(value)
    if not text:
        return False
    for date_format in DATE_FORMATS:
        try:
            dt.datetime.strptime(text, date_format)
            return True
        except ValueError:
            continue
    return False


def validate_public_records(records: Sequence[Dict[str, Any]]) -> List[str]:
    """Return concise schema/data problems found in public employer records."""

    issues: List[str] = []
    if not records:
        return ["query returned no mapped employer records"]

    empty_names = sum(not clean_text(row.get("employer_name")) for row in records)
    empty_statuses = sum(not clean_text(row.get("status")) for row in records)
    invalid_statuses = sorted(
        {
            clean_text(row.get("status")) or "<empty>"
            for row in records
            if clean_text(row.get("status")) not in VALID_STATUSES
        }
    )
    invalid_enrollment_dates = sum(
        not is_valid_date(row.get("enrollment_date")) for row in records
    )
    invalid_termination_dates = sum(
        bool(clean_text(row.get("termination_date")))
        and not is_valid_date(row.get("termination_date"))
        for row in records
    )
    keys = [dedupe_key(row) for row in records]
    duplicate_count = len(keys) - len(set(keys))

    if empty_names:
        issues.append(f"{empty_names} empty employer_name value(s)")
    if empty_statuses:
        issues.append(f"{empty_statuses} empty status value(s)")
    if invalid_statuses:
        issues.append(f"unexpected status value(s): {', '.join(invalid_statuses)}")
    if invalid_enrollment_dates:
        issues.append(
            f"{invalid_enrollment_dates} missing or invalid enrollment_date value(s)"
        )
    if invalid_termination_dates:
        issues.append(f"{invalid_termination_dates} invalid termination_date value(s)")
    if duplicate_count:
        issues.append(f"{duplicate_count} duplicate public composite key(s)")
    return issues


def deduplicate_public_records(
    records: Sequence[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """Apply the same public-key deduplication used by incremental CSV output."""

    unique: List[Dict[str, Any]] = []
    seen: Set[str] = set()
    for record in records:
        keys = dedupe_keys(record)
        if not keys or any(key in seen for key in keys):
            continue
        seen.update(keys)
        unique.append(record)
    return unique


async def run_health_check(
    scraper: EVerifyBrowserScraper, term: str
) -> Tuple[int, List[str]]:
    """Run one bounded query and validate its first result page in memory."""

    logging.info("health-check starting term=%r", term)
    await scraper.apply_search_term(term)
    metadata = await scraper.initialize_summary_reader()
    if not metadata.get("ok"):
        raise DataExtractionError(
            "health-check failed: Tableau Employer List structure is unavailable "
            f"({metadata.get('reason', 'unknown reason')})"
        )

    page_count = int(metadata.get("pageCount", 0))
    total_rows = int(metadata.get("totalRowCount", 0))
    if page_count < 1 or total_rows < 1:
        await scraper.release_summary_reader()
        raise DataExtractionError(
            f"health-check failed: test term {term!r} returned no public rows"
        )

    try:
        columns, rows = await scraper.read_summary_page(0)
    finally:
        await scraper.release_summary_reader()
    mapped_records = rows_to_records(columns, rows)
    records = deduplicate_public_records(mapped_records)
    issues = validate_public_records(records)
    if issues:
        raise DataExtractionError("health-check failed: " + "; ".join(issues))

    logging.info(
        "health-check passed term=%r mapped_records=%d dashboard_rows=%d columns=%d",
        term,
        len(records),
        total_rows,
        len(columns),
    )
    return len(records), columns


def iter_crosstab_chunks(path: Path, chunk_size: int = PAGE_SIZE) -> Iterable[List[Dict[str, Any]]]:
    """Stream Tableau crosstab rows in checkpoint-sized chunks."""

    try:
        with path.open("r", encoding="utf-8-sig", newline="") as handle:
            reader = csv.DictReader(handle)
            if not reader.fieldnames:
                raise DataExtractionError("Downloaded crosstab has no header row")
            chunk: List[Dict[str, Any]] = []
            for raw in reader:
                record = map_public_record(raw)
                if record["employer_name"]:
                    chunk.append(record)
                if len(chunk) >= chunk_size:
                    yield chunk
                    chunk = []
            if chunk:
                yield chunk
    except (OSError, UnicodeError, csv.Error) as exc:
        raise DataExtractionError(f"Could not parse Tableau crosstab CSV: {exc}") from exc


async def scrape_term(
    scraper: EVerifyBrowserScraper,
    term: str,
    start_page: int,
    output: IncrementalOutput,
    checkpoint: Checkpoint,
    checkpoint_path: Path,
) -> int:
    await scraper.apply_search_term(term)
    metadata = await scraper.initialize_summary_reader()
    found_for_term = 0

    if metadata.get("ok"):
        page_count = int(metadata.get("pageCount", 0))
        total_rows = int(metadata.get("totalRowCount", 0))
        logging.info(
            "term=%r worksheet=%r rows=%d pages=%d",
            term,
            metadata.get("worksheetName"),
            total_rows,
            page_count,
        )
        try:
            for page_index in range(min(start_page, page_count), page_count):
                columns, rows = await scraper.read_summary_page(page_index)
                added = output.append(rows_to_records(columns, rows))
                found_for_term += added
                checkpoint.in_progress_term = term
                checkpoint.next_page = page_index + 1
                checkpoint.save(checkpoint_path)
                logging.info(
                    "term=%r page=%d/%d page_rows=%d new=%d cumulative=%d",
                    term,
                    page_index + 1,
                    page_count,
                    len(rows),
                    added,
                    output.total_unique,
                )
        finally:
            await scraper.release_summary_reader()
        return found_for_term

    logging.warning(
        "Tableau summary reader unavailable (%s); trying the public crosstab CSV dialog",
        metadata.get("reason", "unknown reason"),
    )
    try:
        crosstab_path = await scraper.download_public_crosstab()
        for page_index, records in enumerate(iter_crosstab_chunks(crosstab_path)):
            if page_index < start_page:
                continue
            added = output.append(records)
            found_for_term += added
            checkpoint.in_progress_term = term
            checkpoint.next_page = page_index + 1
            checkpoint.save(checkpoint_path)
            logging.info(
                "term=%r crosstab_chunk=%d chunk_rows=%d new=%d cumulative=%d",
                term,
                page_index + 1,
                len(records),
                added,
                output.total_unique,
            )
        return found_for_term
    except (PlaywrightError, DataExtractionError) as exc:
        logging.warning("Public crosstab fallback failed: %s; trying HTML table", exc)

    page_index = 0
    while True:
        columns, rows, has_next = await scraper.read_dom_table()
        if page_index >= start_page:
            added = output.append(rows_to_records(columns, rows))
            found_for_term += added
            checkpoint.in_progress_term = term
            checkpoint.next_page = page_index + 1
            checkpoint.save(checkpoint_path)
            logging.info(
                "term=%r dom_page=%d page_rows=%d new=%d cumulative=%d",
                term,
                page_index + 1,
                len(rows),
                added,
                output.total_unique,
            )
        if not has_next:
            return found_for_term
        page_index += 1
        await scraper.advance_dom_page()


async def scrape_term_with_retries(
    scraper: EVerifyBrowserScraper,
    term: str,
    start_page: int,
    output: IncrementalOutput,
    checkpoint: Checkpoint,
    checkpoint_path: Path,
) -> int:
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            return await scrape_term(
                scraper,
                term,
                start_page,
                output,
                checkpoint,
                checkpoint_path,
            )
        except AutomationBlocked:
            raise
        except (PlaywrightTimeoutError, PlaywrightError, DataExtractionError) as exc:
            if attempt == MAX_RETRIES:
                raise ScraperError(
                    f"Term {term!r} failed after {MAX_RETRIES} attempts: {exc}"
                ) from exc
            backoff = 2 ** (attempt - 1)
            logging.warning(
                "term=%r attempt=%d/%d failed: %s; retrying after %ds",
                term,
                attempt,
                MAX_RETRIES,
                exc,
                backoff,
            )
            await asyncio.sleep(backoff)
            await scraper.reset()
            start_page = (
                checkpoint.next_page if checkpoint.in_progress_term == term else start_page
            )
    raise AssertionError("unreachable")


async def run(args: argparse.Namespace) -> int:
    user_agent = build_user_agent(args.contact_email)
    terms = load_terms(args, allow_empty=args.health_check)
    policy = fetch_robots_policy(user_agent)
    ensure_url_allowed_by_robots(SEARCH_URL, policy, user_agent)
    delay = max(args.delay, policy.crawl_delay_seconds)
    logging.info(
        "robots.txt permits the public search; crawl delay %.1fs (effective %.1fs)",
        policy.crawl_delay_seconds,
        delay,
    )
    if "/export-employers-csv2" not in policy.raw_text:
        logging.warning(
            "The previously disallowed export route is not present in current robots.txt; "
            "this script still does not call it."
        )

    checkpoint = Checkpoint.load(args.checkpoint)
    output = IncrementalOutput(args.output_csv, args.output_json)
    pending = [term for term in terms if term not in checkpoint.completed_terms]
    logging.info(
        "terms=%d completed=%d pending=%d existing_unique=%d",
        len(terms),
        len(checkpoint.completed_terms),
        len(pending),
        output.total_unique,
    )
    if not pending and not args.health_check:
        output.sync_json()
        logging.info("Nothing to do; all supplied terms are complete.")
        return 0

    async with async_playwright() as playwright:
        browser = await playwright.chromium.launch(headless=not args.headed)
        context = await browser.new_context(
            user_agent=user_agent,
            locale="en-US",
            viewport={"width": 1440, "height": 1200},
            extra_http_headers={"DNT": "1"},
        )
        scraper = EVerifyBrowserScraper(
            browser=browser,
            context=context,
            rate_limiter=CrawlRateLimiter(delay),
            robots_policy=policy,
            user_agent=user_agent,
            years=args.years,
            timeout_ms=args.timeout_seconds * 1000,
            worksheet_hint=args.worksheet,
        )
        try:
            await scraper.open()
            if scraper.json_candidates:
                allowed_candidates = []
                for url in sorted(scraper.json_candidates):
                    ensure_url_allowed_by_robots(url, policy, user_agent)
                    allowed_candidates.append(url)
                logging.info(
                    "Observed JSON responses: %s. None matched a documented stable employer-search API; "
                    "using the supported Tableau summary reader.",
                    ", ".join(allowed_candidates),
                )
            else:
                logging.info(
                    "No clean JSON employer-search endpoint observed; using Playwright + Tableau summary reader."
                )

            if args.health_check:
                await run_health_check(scraper, args.health_check_term)
                if not pending:
                    logging.info("Health check complete; no crawl terms were supplied.")
                    return 0
                await scraper.reset()

            for term in pending:
                resume_page = (
                    checkpoint.next_page
                    if checkpoint.in_progress_term == term
                    else 0
                )
                checkpoint.in_progress_term = term
                checkpoint.next_page = resume_page
                checkpoint.save(args.checkpoint)
                logging.info(
                    "starting term=%r resume_page=%d cumulative=%d",
                    term,
                    resume_page,
                    output.total_unique,
                )
                found = await scrape_term_with_retries(
                    scraper,
                    term,
                    resume_page,
                    output,
                    checkpoint,
                    args.checkpoint,
                )
                checkpoint.completed_terms.add(term)
                checkpoint.in_progress_term = None
                checkpoint.next_page = 0
                checkpoint.save(args.checkpoint)
                output.sync_json()
                logging.info(
                    "completed term=%r new_records=%d cumulative=%d",
                    term,
                    found,
                    output.total_unique,
                )
        finally:
            await scraper.close()
            await context.close()
            await browser.close()
    return 0


def parse_args(argv: Optional[Sequence[str]] = None) -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export public E-Verify Employer Search results with checkpointing."
    )
    parser.add_argument(
        "--contact-email",
        required=True,
        help="Contact email included in the descriptive User-Agent.",
    )
    parser.add_argument(
        "--term",
        action="append",
        help="Business-name search term; repeat for multiple terms.",
    )
    parser.add_argument(
        "--terms-file",
        type=Path,
        help="UTF-8 file with one business-name search term per line.",
    )
    parser.add_argument(
        "--alphabet",
        action="store_true",
        help="Add A-Z as search terms. Broad terms can take hours and overlap.",
    )
    parser.add_argument(
        "--output-csv",
        type=Path,
        default=Path("everify_employers.csv"),
    )
    parser.add_argument(
        "--output-json",
        type=Path,
        default=Path("everify_employers.json"),
        help="Standard JSON array synchronized after each completed term.",
    )
    parser.add_argument(
        "--no-json",
        action="store_true",
        help="Disable JSON output and write only CSV.",
    )
    parser.add_argument(
        "--checkpoint",
        type=Path,
        default=Path("checkpoint.json"),
    )
    parser.add_argument(
        "--delay",
        type=float,
        default=DEFAULT_CRAWL_DELAY_SECONDS,
        help="Minimum seconds between crawl operations; robots.txt can raise it.",
    )
    parser.add_argument(
        "--years",
        type=int,
        default=30,
        help="Date Enrolled history window. The public dashboard recommends 30.",
    )
    parser.add_argument(
        "--timeout-seconds",
        type=int,
        default=90,
    )
    parser.add_argument(
        "--worksheet",
        default=DEFAULT_TABLEAU_WORKSHEET_HINT,
        help="Tableau worksheet name hint for future dashboard changes.",
    )
    parser.add_argument(
        "--health-check",
        action="store_true",
        help=(
            "Run one bounded test query first and fail clearly if the public "
            "Employer List schema or values no longer map correctly. If no crawl "
            "terms are supplied, exit after the check."
        ),
    )
    parser.add_argument(
        "--health-check-term",
        default=DEFAULT_HEALTH_CHECK_TERM,
        help="Known-result business name used by --health-check.",
    )
    parser.add_argument(
        "--headed",
        action="store_true",
        help="Show Chromium for troubleshooting; headless is the default.",
    )
    args = parser.parse_args(argv)
    if args.delay < 0:
        parser.error("--delay cannot be negative")
    if args.years < 1 or args.years > 30:
        parser.error("--years must be between 1 and 30")
    if args.timeout_seconds < 10:
        parser.error("--timeout-seconds must be at least 10")
    if args.no_json:
        args.output_json = None
    return args


def main(argv: Optional[Sequence[str]] = None) -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
        datefmt="%Y-%m-%dT%H:%M:%SZ",
    )
    logging.Formatter.converter = time.gmtime
    try:
        return asyncio.run(run(parse_args(argv)))
    except KeyboardInterrupt:
        logging.warning("Interrupted. Re-run the same command to resume from checkpoint.")
        return 130
    except AutomationBlocked as exc:
        logging.error("Automation blocked: %s", exc)
        logging.error("Stopped without attempting CAPTCHA, block, or rate-limit bypass.")
        return 3
    except RobotsDisallowed as exc:
        logging.error("Robots policy prevents scraping: %s", exc)
        return 4
    except ScraperError as exc:
        logging.error("Scraper stopped: %s", exc)
        return 2


if __name__ == "__main__":
    sys.exit(main())
