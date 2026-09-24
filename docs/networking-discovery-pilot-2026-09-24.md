# Networking contact discovery pilot — 2026-09-24

The controlled comparison used the same seven companies, each with a Software Engineer target role. Gemini 3.8 Flash used Google Search through its Interactions API. GPT-6 Luna used the OpenAI Responses API with live `web_search`, `tool_choice: required`, medium reasoning, and `max_tool_calls: 4`. Both passed their output through the same server-side `validateGroundedDiscovery` function. ApplyBolt was called only for contacts that survived validation. No email addresses were searched or recorded in this report.

The [machine-readable findings](./networking-discovery-pilot-2026-09-24.json) include every search query, proposed contact, grounded evidence URL and title, validated contact, token count, latency, cost estimate, and ApplyBolt status. They also include the two exploratory Microsoft runs described below. No results were removed because a search failed.

## Controlled comparison

`Calls/queries` means OpenAI web tool calls and search queries inside those calls, or Gemini Google Search queries. Output token counts include reasoning. Latency covers discovery only; ApplyBolt runs afterward. `Correct profiles` is the separate manual check of the person and direct LinkedIn URL, not the server validator result.

| Company | Provider | Calls/queries | Proposed | Validated | Correct profiles | ApplyBolt verified | Latency | Input / output (reasoning) tokens | Approx. discovery cost |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| Microsoft | Gemini | 4 queries | 0 | 0 | 0 | 0 | 3.7s | 155 / 37 | $0.0003–$0.0563 |
| Microsoft | GPT-6 Luna | 1 / 3 | 2 | 2 | 2 | 2 | 6.8s | 13,105 / 657 (308) | $0.0112 |
| Amazon | Gemini | 4 queries | 0 | 0 | 0 | 0 | 3.2s | 155 / 36 | $0.0003–$0.0563 |
| Amazon | GPT-6 Luna | 4 / 12 | 3 | 3 | 3 | 0 | 16.5s | 30,311 / 1,561 (1,077) | $0.0434 |
| Google | Gemini | 4 queries | 0 | 0 | 0 | 0 | 2.0s | 155 / 36 | $0.0003–$0.0563 |
| Google | GPT-6 Luna | 2 / 6 | 3 | 3 | 3 | 0 | 12.1s | 21,254 / 1,117 (501) | $0.0223 |
| Asana | Gemini | 4 queries | 0 | 0 | 0 | 0 | 3.0s | 156 / 38 | $0.0003–$0.0563 |
| Asana | GPT-6 Luna | 2 / 6 | 1 | 1 | 1 | 0 | 10.0s | 19,374 / 689 (473) | $0.0219 |
| Browserbase | Gemini | 4 queries | 0 | 0 | 0 | 0 | 4.1s | 157 / 38 | $0.0003–$0.0563 |
| Browserbase | GPT-6 Luna | 2 / 7 | 2 | 2 | 2 | 1 | 31.0s | 21,324 / 946 (587) | $0.0222 |
| Zine | Gemini | 4 queries | 0 | 0 | 0 | 0 | 3.5s | 152 / 34 | $0.0003–$0.0563 |
| Zine | GPT-6 Luna | 2 / 7 | 0 | 0 | 0 | 0 | 9.5s | 21,568 / 474 (446) | $0.0220 |
| Quasar Finch Labs | Gemini | 4 queries | 0 | 0 | 0 | 0 | 2.0s | 154 / 35 | $0.0003–$0.0563 |
| Quasar Finch Labs | GPT-6 Luna | 1 / 3 | 0 | 0 | 0 | 0 | 4.9s | 8,562 / 129 (99) | $0.0105 |

Totals: Gemini made 28 Google Search queries and produced no contacts. Luna made 14 web tool calls containing 44 search queries, proposed 11 contacts, and all 11 passed the existing validator. Three had ApplyBolt `verified` status. One Google lookup returned `provider_error`; all other nonverified outcomes are preserved in the JSON. Estimated discovery cost across seven companies was about **$0.1534 for Luna** and **$0.0018–$0.3938 for Gemini**, depending on whether the shared 5,000 monthly free Google searches had been exhausted. These are list-price estimates, not invoice totals. Luna uses [model pricing](https://developers.openai.com/api/docs/models/gpt-6-luna) plus [$0.01 per web tool call](https://developers.openai.com/api/docs/pricing); Gemini uses [current Gemini Developer API pricing](https://ai.google.dev/gemini-api/docs/pricing). ApplyBolt cost is excluded.

## Manual checks of all Luna contacts

Each direct profile below was opened or found by exact URL through public search. Current employment and role evidence were checked separately from the model's claim. All 11 links belong to the named people and show current employment at the requested company. The last column flags exact-title uncertainty rather than treating model confidence as evidence.

| Company | Contact and direct profile | Current employment | Category supported | Exact title supported | ApplyBolt |
| --- | --- | --- | --- | --- | --- |
| Microsoft | [Irina Craciun](https://www.linkedin.com/in/irina-craciun) | Yes | Engineering recruiting | Yes | verified |
| Microsoft | [Alexandru Vrancianu](https://www.linkedin.com/in/vrancianualexandru) | Yes | Engineering recruiting | Yes | verified |
| Amazon | [Devyani Matcha](https://www.linkedin.com/in/devyanimatcha) | Yes | AWS sourcing and SDE recruiting | Yes | not_found |
| Amazon | [Shweta Kansal](https://www.linkedin.com/in/shweta-kansal) | Yes | Technical recruiting, including Robotics engineering | Yes | not_found |
| Amazon | [Chris Mosbacher](https://www.linkedin.com/in/chrismosbacher) | Yes | Technical recruiting | **Unconfirmed:** public evidence supports recruiting, but does not clearly confirm the proposed exact current title “Technical Recruiter” | unverified |
| Google | [Steen Whidden](https://www.linkedin.com/in/steenwhidden) | Yes | Senior technical recruiting | Yes | not_found |
| Google | [Matt McMillian](https://www.linkedin.com/in/mattmcmillian) | Yes | Senior technical recruiting | Yes | provider_error |
| Google | [Fangyu Yeh](https://www.linkedin.com/in/fangyu-yeh-12561145) | Yes | Google Cloud recruiting | Yes | not_found |
| Asana | [Mary Conrick](https://www.linkedin.com/in/mary-conrick) | Yes | Technical recruiting and talent acquisition | **Unconfirmed:** the combined title “Technical Recruiter / Talent Acquisition” was not found as an exact current title | unverified |
| Browserbase | [Eli Bingham](https://www.linkedin.com/in/eli-bingham) | Yes | Engineering leader; not labeled a hiring manager | Yes | verified |
| Browserbase | [Adam McQuilkin](https://www.linkedin.com/in/adam-mcquilkin) | Yes | Relevant current employee; not labeled a hiring manager | Yes | not_found |

Thus the stricter manual bar is **9 of 11 contacts with fully confirmed exact titles**, alongside **11 of 11 correct direct profiles and current employers**. The two title uncertainties show that passing the existing source validator is not by itself proof of every model-written field. No invented hiring-manager or mutual-connection claim appeared in this sample.

## Failed and zero-result searches

- The original Gemini pilot had 26 Microsoft searches and 38 Amazon searches before the four-query prompt cap; neither yielded a validated contact. In the controlled rerun, all seven Gemini companies used four queries and returned zero proposed contacts. The exact 28 queries are in the raw JSON.
- The first Luna Microsoft exploratory request made two web tool calls containing six queries and proposed two contacts. `web_search_call.action.sources` exposed URLs without titles, so the unchanged validator correctly rejected both. Adding `web_search_call.results` exposed the search-result titles. A second exploratory Microsoft request made one call/three queries, proposed three, and validated two. The third proposal lacked sufficient name/title evidence under the existing rules.
- In the controlled run, Luna returned zero for **Zine** after two calls/seven queries because the company identity was ambiguous, and zero for **Quasar Finch Labs** after one call/three queries because public company/contact evidence was insufficient. These are acceptable zero-contact outcomes; no person was filled in to reach three.
- Amazon hit the full four-tool-call cap and made twelve search queries within those calls. This is controlled under the requested API cap but is the highest search volume in this sample. Browserbase discovery took 31 seconds, the highest measured latency.

## Decision

Luna materially improved the number of source-validated contacts without relaxing the validator, but the exact-title uncertainty on two contacts and the small seven-company sample do not justify an automatic production switch. Gemini remains the configured default, the bundle UI remains opt-in, and the manual LinkedIn fallback remains available. The new provider can be selected explicitly with `NETWORKING_DISCOVERY_PROVIDER=openai` for further evaluation. Before any default switch, the team should decide whether to add an evidence check specifically for current job titles and repeat the pilot on a broader company sample.
