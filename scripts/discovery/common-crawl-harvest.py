#!/usr/bin/env python3
"""Harvest public Greenhouse/Ashby board tokens from Common Crawl CDX indexes.

This is a bounded, read-only proof of concept. It intentionally emits a CSV
instead of writing to any application or Supabase table.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen


USER_AGENT = "TrackMyOPT-CommonCrawlHarvest/0.1 (+https://trackmyopt.com; research contact)"
INDEX_URL = "https://index.commoncrawl.org/collinfo.json"
DEFAULT_OUTPUT = "artifacts/common-crawl-ats-board-tokens.csv"
GREENHOUSE_HOSTS = ("boards.greenhouse.io", "job-boards.greenhouse.io")
MAX_RESPONSE_BYTES = 1_000_000


@dataclass(frozen=True)
class HarvestRow:
    token: str
    platform: str
    source_url: str
    crawl_id: str


class PoliteClient:
    def __init__(self, max_requests: int, min_interval: float = 1.0) -> None:
        self.max_requests = max_requests
        self.min_interval = min_interval
        self.requests = 0
        self.last_request_at = 0.0

    def get(self, url: str, retries: int = 3) -> bytes:
        attempt = 0
        while True:
            if self.requests >= self.max_requests:
                raise RuntimeError(f"request cap ({self.max_requests}) reached")
            wait = self.min_interval - (time.monotonic() - self.last_request_at)
            if wait > 0:
                time.sleep(wait)
            self.last_request_at = time.monotonic()
            self.requests += 1
            try:
                request = Request(url, headers={"User-Agent": USER_AGENT})
                with urlopen(request, timeout=10) as response:
                    # Keep the proof of concept bounded even when a wildcard
                    # query returns a very large CDX page.
                    return response.read(MAX_RESPONSE_BYTES)
            except HTTPError as error:
                retryable = error.code == 429 or 500 <= error.code < 600
                if not retryable or attempt >= retries:
                    raise
                time.sleep(min(30.0, 2**attempt))
                attempt += 1
            except (TimeoutError, URLError):
                if attempt >= retries:
                    raise
                time.sleep(min(30.0, 2**attempt))
                attempt += 1


def load_recent_indexes(client: PoliteClient, count: int = 6) -> list[dict[str, str]]:
    payload = json.loads(client.get(INDEX_URL))
    indexes = [item for item in payload if item.get("id") and item.get("cdx-api")]
    return indexes[:count]


def cdx_rows(payload: bytes) -> Iterable[dict[str, object]]:
    text = payload.decode("utf-8", errors="replace")
    for line in text.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            value = json.loads(line)
        except json.JSONDecodeError:
            continue
        if isinstance(value, dict):
            yield value
        elif isinstance(value, list) and len(value) >= 3:
            # Defensive support for CDX JSON arrays when `fl` is ignored.
            yield {"url": value[0], "timestamp": value[1], "status": value[2]}


def extract_token(url: str) -> tuple[str, str] | None:
    match = re.match(
        r"^https?://(boards\.greenhouse\.io|job-boards\.greenhouse\.io)/([^/?#]+)",
        url,
        re.IGNORECASE,
    )
    if match:
        token = match.group(2)
        if token.lower() not in {"embed", "api", "assets", "login"} and not token.lower().endswith(".txt"):
            return token, "greenhouse"
    match = re.match(r"^https?://jobs\.ashbyhq\.com/([^/?#]+)", url, re.IGNORECASE)
    if match:
        slug = match.group(1)
        if slug.lower() not in {"api", "assets", "embed", "login"}:
            return slug, "ashby"
    return None


def harvest(index: dict[str, str], client: PoliteClient, max_pages: int | None) -> list[HarvestRow]:
    patterns = [
        ("boards.greenhouse.io/*", "greenhouse"),
        ("job-boards.greenhouse.io/*", "greenhouse"),
        ("jobs.ashbyhq.com/*", "ashby"),
    ]
    rows: list[HarvestRow] = []
    for pattern, expected_platform in patterns:
        page = 0
        while max_pages is None or page < max_pages:
            params = {
                "url": pattern,
                "output": "json",
                "filter": "statuscode:200",
                "collapse": "urlkey",
                "pageSize": "1000",
                "page": str(page),
            }
            endpoint = f"{index['cdx-api']}?{urlencode(params)}"
            try:
                payload = client.get(endpoint)
            except HTTPError as error:
                # CDX returns 400 when the requested page is past the final
                # page (for example, "Page 1 invalid: ... Last Page is 0").
                if error.code in {400, 404}:
                    break
                raise
            raw_rows = list(cdx_rows(payload))
            if not raw_rows:
                break
            for item in raw_rows:
                if str(item.get("status", item.get("statuscode", "200"))) != "200":
                    continue
                source_url = str(item.get("url", ""))
                extracted = extract_token(source_url)
                if not extracted or extracted[1] != expected_platform:
                    continue
                token, platform = extracted
                rows.append(HarvestRow(token, platform, source_url, index["id"]))
            page += 1
    return rows


def write_csv(path: Path, rows: Iterable[HarvestRow]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=["token", "platform", "source_url", "crawl_id"])
        writer.writeheader()
        for row in rows:
            writer.writerow(row.__dict__)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument("--max-requests", type=int, default=120)
    parser.add_argument(
        "--max-pages-per-query",
        type=int,
        default=100,
        help="safety cap per pattern/index; pagination otherwise runs to completion",
    )
    args = parser.parse_args()
    if args.max_requests < 1 or args.max_pages_per_query < 1:
        parser.error("request and page caps must be positive")

    client = PoliteClient(args.max_requests)
    indexes = load_recent_indexes(client)
    discovered: dict[tuple[str, str], HarvestRow] = {}
    for index in indexes:
        for row in harvest(index, client, args.max_pages_per_query):
            discovered.setdefault((row.platform, row.token.lower()), row)
    rows = sorted(discovered.values(), key=lambda row: (row.platform, row.token.lower()))
    write_csv(Path(args.output), rows)
    greenhouse = sum(row.platform == "greenhouse" for row in rows)
    ashby = sum(row.platform == "ashby" for row in rows)
    print(
        json.dumps(
            {
                "indexes": [index["id"] for index in indexes],
                "requests": client.requests,
                "rows": len(rows),
                "greenhouse": greenhouse,
                "ashby": ashby,
                "output": args.output,
            },
            sort_keys=True,
        )
    )
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except (HTTPError, URLError, RuntimeError) as error:
        print(f"common-crawl-harvest: {error}", file=sys.stderr)
        raise SystemExit(2)
