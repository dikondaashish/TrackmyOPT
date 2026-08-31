"""Contract tests over realistic raw payloads for every priority ATS parser.

These tests intentionally invoke the pinned ats-scrapers adapter parsing code.
The Nest process-boundary suite separately covers malformed output, HTTP errors,
timeouts, request accounting, retries, and source isolation.
"""

from __future__ import annotations

import json
import unittest
from pathlib import Path

from ats_scrapers.scrapers import (
    AshbyScraper,
    BambooHRScraper,
    BreezyScraper,
    GreenhouseScraper,
    LeverScraper,
    PersonioScraper,
    RecruiteeScraper,
    SmartRecruitersScraper,
    WorkableScraper,
    WorkdayScraper,
)
from ats_scrapers.scrapers.bamboohr import _apply_opening_to_job


FIXTURE_PATH = Path(__file__).parent / "fixtures" / "priority_ats_payloads.json"
FIXTURES = json.loads(FIXTURE_PATH.read_text(encoding="utf-8"))


class PriorityAtsRawPayloadTests(unittest.TestCase):
    def test_greenhouse_raw_payload(self) -> None:
        parser = GreenhouseScraper("acme", include_descriptions=False)
        jobs = [parser._parse_job(item) for item in FIXTURES["greenhouse"]["jobs"]]

        self.assertEqual([job.ats_id for job in jobs], ["101", "102"])
        self.assertEqual(jobs[0].department, "Engineering")
        self.assertIn("<h2>What you will do</h2>", jobs[0].description or "")
        self.assertIsNone(jobs[1].department)

    def test_lever_raw_payload(self) -> None:
        parser = LeverScraper("acme", include_descriptions=False)
        jobs = [parser._parse_job(item) for item in FIXTURES["lever"]]

        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertEqual(jobs[0].salary_min, 140000)
        self.assertIn("<h3>Requirements</h3>", jobs[0].description or "")
        self.assertTrue(jobs[1].is_remote)

    def test_ashby_raw_payload(self) -> None:
        parser = AshbyScraper("acme", include_descriptions=False)
        jobs = [parser._parse_job(item) for item in FIXTURES["ashby"]["jobs"]]

        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].salary_currency, "USD")
        self.assertEqual(jobs[0].salary_max, 210000)
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertTrue(jobs[1].is_remote)

    def test_workday_raw_payload(self) -> None:
        parser = WorkdayScraper.from_url(
            "https://acme.wd1.myworkdayjobs.com/External",
            include_descriptions=False,
        )
        jobs = [
            parser._parse_job(item, "https://acme.wd1.myworkdayjobs.com/External", "Acme")
            for item in FIXTURES["workday"]["jobPostings"]
        ]

        self.assertEqual([job.ats_id for job in jobs], ["R-401", "R-402"])
        self.assertEqual(jobs[0].department, "Technology")
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertTrue(jobs[1].is_remote)

    def test_smartrecruiters_raw_payload(self) -> None:
        parser = SmartRecruitersScraper("acme", include_descriptions=False)
        jobs = [
            parser._parse_job(item) for item in FIXTURES["smartrecruiters"]["content"]
        ]

        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].location, "Seattle, Washington, US")
        self.assertEqual(jobs[0].requisition_id, "DEVOPS-501")
        self.assertEqual(jobs[1].department, "Quality Assurance")
        self.assertTrue(jobs[1].is_remote)

    def test_workable_raw_payload(self) -> None:
        payload = FIXTURES["workable"]
        parser = WorkableScraper("acme", include_descriptions=False)
        jobs = [parser._parse_job(item, payload["name"]) for item in payload["jobs"]]

        self.assertEqual([job.ats_id for job in jobs], ["A1B2C3", "D4E5F6"])
        self.assertEqual(jobs[0].location, "Chicago, Illinois, United States")
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertTrue(jobs[1].is_remote)

    def test_recruitee_raw_payload(self) -> None:
        parser = RecruiteeScraper("acme", include_descriptions=False)
        jobs = [parser._parse_offer(item) for item in FIXTURES["recruitee"]["offers"]]

        self.assertEqual(len(jobs), 2)
        self.assertEqual(jobs[0].location, "Denver, CO, US")
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertIn("Kubernetes", jobs[0].description or "")
        self.assertEqual(jobs[1].employment_type, "INTERN")

    def test_personio_raw_payload(self) -> None:
        parser = PersonioScraper("acme", include_descriptions=False)
        base = "https://acme.jobs.personio.com"
        jobs = [parser._parse_job(item, base) for item in FIXTURES["personio"]["data"]]

        self.assertEqual([job.ats_id for job in jobs], ["801", "802"])
        self.assertEqual(jobs[0].department, "Data")
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertEqual(jobs[1].location, "Munich")

    def test_bamboohr_raw_payload(self) -> None:
        payload = FIXTURES["bamboohr"]
        parser = BambooHRScraper("acme", include_descriptions=False)
        jobs = parser._parse_widget(payload["widget_html"])

        self.assertEqual([job.ats_id for job in jobs], ["901", "902"])
        self.assertEqual(jobs[0].department, "Engineering")
        _apply_opening_to_job(jobs[0], payload["detail"]["result"]["jobOpening"])
        self.assertEqual(jobs[0].employment_type, "FULL_TIME")
        self.assertIn("Operate cloud systems", jobs[0].description or "")
        self.assertEqual(jobs[0].location, "Portland, Oregon, United States")

    def test_breezy_raw_payload(self) -> None:
        parser = BreezyScraper("acme", include_descriptions=False)
        jobs = [parser._parse_position(item) for item in FIXTURES["breezy"]]

        self.assertTrue(all(job is not None for job in jobs))
        parsed = [job for job in jobs if job is not None]
        self.assertEqual([job.ats_id for job in parsed], ["br-1001", "br-1002"])
        self.assertEqual(parsed[0].employment_type, "FULL_TIME")
        self.assertEqual(parsed[0].salary_summary, "$120k - $155k")
        self.assertTrue(parsed[1].is_remote)


if __name__ == "__main__":
    unittest.main()
