#!/usr/bin/env python3
"""Fetch one authorized ATS board with the pinned ats-scrapers adapter.

The Nest worker sends one JSON source configuration on stdin and receives only
the normalized fields required by the TrackMyOPT job-board schema on stdout.
This program must never be invoked for a disabled source.
"""

from __future__ import annotations

import json
import sys
from datetime import date, datetime
from typing import Any

from ats_scrapers.scrapers import get_scraper
from ats_scrapers.fetch import Fetcher


REQUESTS_MADE = 0
CONFIGURED_ADAPTER: str | None = None
ORIGINAL_PERFORM = Fetcher._perform


async def counted_perform(self: Fetcher, *args: Any, **kwargs: Any) -> Any:
    """Count every real HTTP attempt, including retries and pagination."""
    global REQUESTS_MADE
    REQUESTS_MADE += 1
    return await ORIGINAL_PERFORM(self, *args, **kwargs)


Fetcher._perform = counted_perform


def value_to_json(value: Any) -> Any:
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, date):
        return value.isoformat()
    if hasattr(value, "value"):
        return value.value
    if value is None or isinstance(value, (str, int, float, bool)):
        return value
    return str(value)


def main() -> None:
    global CONFIGURED_ADAPTER
    source = json.load(sys.stdin)
    if isinstance(source.get("ats_type"), str):
        CONFIGURED_ADAPTER = source["ats_type"]
    base_url = source.get("base_url")
    if not isinstance(base_url, str) or not base_url.startswith("https://"):
        raise ValueError("An authorized HTTPS base_url is required")

    board_token = source.get("board_token")
    if not isinstance(board_token, str) or not board_token:
        raise ValueError("An authorized ATS board_token is required")

    scraper = get_scraper(source.get("ats_type"), board_token)
    resolved_ats = value_to_json(getattr(scraper, "ats", None))
    if resolved_ats != source.get("ats_type"):
        raise ValueError(
            f"Configured ATS {source.get('ats_type')} does not match URL-resolved ATS {resolved_ats}"
        )
    jobs = scraper.fetch()
    normalized = []
    for job in jobs:
        external_id = getattr(job, "ats_id", None)
        title = getattr(job, "title", None)
        if not external_id or not title:
            continue
        normalized.append(
            {
                "external_job_id": str(external_id),
                "title": str(title),
                "company_name": str(getattr(job, "company", "")).strip(),
                "location": value_to_json(getattr(job, "location", None)),
                "department": value_to_json(getattr(job, "department", None)),
                "description": value_to_json(getattr(job, "description", None)),
                "job_url": value_to_json(
                    getattr(job, "apply_url", None) or getattr(job, "url", None)
                ),
                "posted_at": value_to_json(getattr(job, "posted_at", None)),
            }
        )

    json.dump(
        {
            "jobs": normalized,
            "metadata": {
                "adapter": resolved_ats,
                "complete": True,
                "requests_made": REQUESTS_MADE,
            },
        },
        sys.stdout,
    )


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        json.dump(
            {
                "error": str(error),
                "metadata": {
                    "adapter": CONFIGURED_ADAPTER,
                    "complete": False,
                    "requests_made": REQUESTS_MADE,
                },
            },
            sys.stdout,
        )
        raise SystemExit(1) from error
