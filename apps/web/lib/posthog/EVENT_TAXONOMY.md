# PostHog event taxonomy — TrackMyOPT

**Project:** [369087](https://us.posthog.com/project/369087)  
**Last updated:** 2026-07-05 (Phase 5 closure)

Canonical list of product events. Prefer these names in new dashboards and funnels. See [LEGACY_EVENTS.md](./LEGACY_EVENTS.md) for deprecated billing and case-status events.

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
| `case_status_check_completed` | Client + server | `source` | Triggers NPS survey |
| `activation_completed` | Client | `days_since_signup`, `source` | Onboarding + receipt + live status |
| `extension_detected` | Client | `version`, `source` | Chrome extension present on dashboard |
| `dashboard_viewed` | Client | `section` | Product funnel (not `$pageview` alone) |

## Monetization

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `premium_checkout_viewed` | Client | `plan_id`, `interval`, `source` | Checkout modal load |
| `premium_checkout_completed` | Client | `plan_tier`, `stripe_session_id`, `source` | Success page; triggers post-checkout NPS |
| `checkout_started` | Client + server | `plan_id`, `amount_cents` | Stripe session created |
| `payment_succeeded` | Server | `amount_cents`, `$insert_id` | Billing — see LEGACY_EVENTS validation |
| `subscription_started` | Server | `plan_tier` | Billing — unvalidated in test mode |

## Resume / engagement

| Event | Source | Properties | Notes |
|-------|--------|------------|-------|
| `resume_generated` | Server | `template_id` | AI LaTeX returned |
| `resume_downloaded` | Client | `ats_score` | PDF export |
| `resume_ats_scored` | Client | `score` | Deep scan complete |

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

## Surveys

| Survey | Trigger event |
|--------|-----------------|
| [Case status NPS](https://us.posthog.com/project/369087/surveys/019f346e-21f7-0000-0709-bbf4a29078ce) | `case_status_check_completed` |
| [Post-checkout NPS](https://us.posthog.com/project/369087/surveys/019f347f-8f11-0000-3265-519683f516e7) | `premium_checkout_completed` |
