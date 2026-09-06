# PostHog event taxonomy — TrackMyOPT

**Project:** [369087](https://us.posthog.com/project/369087)  
**Last updated:** 2026-07-23 (Phase 5 closure)

Canonical list of product events. Prefer these names in new dashboards and funnels. See [legacy-events.md](./legacy-events.md) for deprecated billing and case-status events.

---

## Acquisition

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `$pageview` | SDK | `$current_url`, UTM props | Marketing pages |
| `blog_product_cta_clicked` | Client | `cta_label`, `blog_slug`, `destination` | Blog → product path |
| `user_signed_up` | Server | `provider`, `capture_source` | Auth signup |

## Activation

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `onboarding_started` | Client | — | Wizard opened |
| `onboarding_completed` | Client + server | `variant` | Dates + profile saved |
| `onboarding_receipt_variant_exposed` | Client | `variant` | Experiment 381118 |
| `receipt_added` | Server | `is_first_receipt` | **Preferred** over legacy `case_status_enrolled` |
| `receipt_updated` | Server | — | Subsequent receipt changes |
| `case_status_check_completed` | Client + server | `source` | Case-refresh observability |
| `activation_completed` | Client | `days_since_signup`, `within_24h`, `source` | Receipt + successful case check (Phase 4; onboarding not required) |
| `extension_detected` | Client | `version`, `source` | Chrome extension present on dashboard |
| `dashboard_viewed` | Client | `has_receipt`, `path`, `plan_tier`, … | All dashboard routes (Phase 4); once per session |
| `pwa_installed` | Client | `source` | `appinstalled` / standalone display mode |

## Monetization

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `premium_checkout_viewed` | Client | `plan_id`, `interval`, `source` | Checkout modal load |
| `premium_checkout_completed` | Client | `plan_tier`, `stripe_session_id`, `source` | Premium activation observability |
| `checkout_started` | Server | `plan_id`, `amount_cents`, `$insert_id` | Sole emitter: `create-checkout` after Stripe session exists (Phase 5) |
| `checkout_recovery_email_sent` | Server | `resume_kind`, `plan_id` | Abandoned checkout cron |
| `payment_succeeded` | Server | `amount_cents`, `$insert_id` | Billing — see LEGACY_EVENTS validation |
| `payment_failed` | Server | `failure_code`, `$insert_id` | Canonical on `invoice.payment_failed`; PI path skips when invoice exists |
| `trial_converted` | Server | `plan_tier`, `$insert_id` | First paid invoice near trial end |
| `subscription_started` | Server | `plan_tier` | Billing — unvalidated in test mode |
| `subscription_canceled` | Server | `plan_tier`, `cancel_feedback` | Stripe Portal feedback when present (Phase 6) |

## Resume / engagement

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `resume_generated` | Client | `template_id` | AI LaTeX returned in editor |
| `resume_ai_cost_recorded` | Server | `ai_cost_usd`, `ai_cost_per_resume`, `ai_model`, `ai_call_count`, `template_id`, `source` | Unit economics — full pipeline cost per successful generate/regenerate |
| `ai_generation_completed` | Server | `ai_task`, `ai_model`, `ai_estimated_cost_usd`, `ai_*_tokens`, `ai_request_id` | Per model call (generate, latex_fix, scan, …) |
| `resume_downloaded` | Client | `ats_score` | PDF export |
| `resume_ats_scored` | Client | `score` | Deep scan complete |
| `nps_shown` | Client | `trigger`, `plan_tier`, `pathname`, `days_since_signup` | 0–10 NPS shown after a success milestone |
| `nps_dismissed` | Client | `trigger`, `plan_tier`, `pathname`, `days_since_signup` | NPS dismissed after being shown |
| `nps_submitted` | Client | `score`, `category`, `feedback`, trigger context | NPS submitted; only interpret after 50 valid responses |

### Chrome extension job widget

These events are sent through the authenticated `/api/extension/widget-event`
bridge. The bridge allowlists low-cardinality properties and rejects job URLs,
job descriptions, company names, role titles, and unknown event names.

| Event | Properties | Notes |
|-------|------------|-------|
| `extension_widget_shown` | `site_family`, `default_view` | Once per normalized job in the active page runtime |
| `extension_widget_sponsorship_classified` | `site_family`, `signal`, `refreshed` | Final client-side sponsorship signal |
| `extension_widget_job_saved` | `site_family`, `status`, `outcome` | Wishlist/Applied save result |
| `extension_widget_prefill_completed` | `site_family`, `outcome`, `filled`, `skipped`, `total`, `has_resume` | Prefill coverage and generated-resume attachment state |
| `extension_widget_job_analyzed` | `site_family`, `outcome`, `score`, keyword counts, `error_code` | ATS analysis result without keyword text |
| `extension_widget_resume_generated` | `site_family`, `outcome`, `template_id`, ATS scores/delta, `error_code` | Tailored resume result |

## Reliability / UX

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `error_boundary_triggered` | Client | `route`, `component_area`, `error_message`, `$session_id` | Links to session replay |
| `$exception` | SDK | stack, `$session_id` | Error tracking |

## Groups & partners

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `partner_group_associated` | Server | `partner_code` | `university_partner` group link |

---

## Person properties (identity)

Set via `PostHogIdentify` / server identify:

| Property | Purpose |
|----------|---------|
| `plan_tier` | free / pro / dedicated |
| `premium_status` | boolean |
| `onboarding_completed` | boolean |
| `activation_state` | activated / partial / … |
| `has_receipt` | boolean |
| `signup_date` | YYYY-MM-DD |
| `lifetime_revenue_cents` | LTV sync (Phase 4) |
| `referred_by` | Partner referral code |

---

## Dashboards by journey stage

| Stage | Dashboard |
|-------|-----------|
| North Star | [1802474](https://us.posthog.com/project/369087/dashboard/1802474) |
| Blog → signup | [1802603](https://us.posthog.com/project/369087/dashboard/1802603) |
| LTV / partners | [1802593](https://us.posthog.com/project/369087/dashboard/1802593) |
| Resume AI unit economics | Run `pnpm posthog:ai-cost-dashboard` (creates dashboard) |
| UX / Bug | [1707550](https://us.posthog.com/project/369087/dashboard/1707550) |

---

## Cohorts

| Cohort | ID | Definition |
|--------|-----|------------|
| Activated | [396173](https://us.posthog.com/project/369087/cohorts/396173) | `receipt_added` ≥1 |
| Pro users | [396174](https://us.posthog.com/project/369087/cohorts/396174) | `premium_status = true` |
| At-risk | [396175](https://us.posthog.com/project/369087/cohorts/396175) | Signed up 90d, no pageview 14d |
| Extension users | [396240](https://us.posthog.com/project/369087/cohorts/396240) | `extension_detected` ≥1 (90d) |

---

## NPS collection

TrackMyOPT uses one custom 0–10 NPS prompt rather than PostHog's 3/5/7-point
rating survey. It is requested only after a completed product outcome:

- First successfully resolved USCIS case
- Completed deep ATS scan
- Resume PDF download

The prompt has a 90-day device cooldown and requires analytics consent because
optional free-text feedback is stored in PostHog. Analyze NPS only after at
least 50 valid submissions; use `nps_shown` as the denominator for response
rate, not submissions plus dismissals.
