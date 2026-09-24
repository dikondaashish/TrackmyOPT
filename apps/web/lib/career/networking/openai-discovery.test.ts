import { afterEach, describe, expect, it, vi } from 'vitest';
import { discoverContactsWithOpenAI, parseOpenAIDiscoveryResponse } from './openai-discovery';

const input = { companyName: 'Microsoft', companyDomain: 'microsoft.com', targetRole: 'Software Engineer', userId: 'pilot' };
const person = { name: 'Taylor One', title: 'Technical Recruiter', company: 'Microsoft',
  linkedinUrl: 'https://www.linkedin.com/in/taylor-one', contactCategory: 'technical_recruiter',
  relevanceReason: 'Recruits engineers', currentEmploymentEvidence: 'Public profile', evidence: [] };
const response = (contacts: unknown[] = [person], withSearch = true) => ({
  status: 'completed',
  output: [
    ...(withSearch ? [{ type: 'web_search_call', action: { type: 'search', query: 'Taylor One Microsoft recruiter',
      sources: [{ url: 'https://www.linkedin.com/in/taylor-one', title: '' }] },
      results: [{ url: 'https://www.linkedin.com/in/taylor-one', title: 'Taylor One - Technical Recruiter - Microsoft | LinkedIn' }] }] : []),
    { type: 'message', content: [{ type: 'output_text',
      text: JSON.stringify({ company: { name: 'Microsoft', domain: 'microsoft.com' }, contacts }),
      annotations: [] }] },
  ],
  usage: { input_tokens: 1000, output_tokens: 500,
    input_tokens_details: { cached_tokens: 100 }, output_tokens_details: { reasoning_tokens: 200 } },
});

afterEach(() => { vi.unstubAllGlobals(); vi.unstubAllEnvs(); });

describe('OpenAI grounded discovery', () => {
  it('requires an actual web search and retains usage, sources, and validated contacts', () => {
    const parsed = parseOpenAIDiscoveryResponse(response(), input);
    expect(parsed.contacts.map((contact) => contact.linkedinUrl)).toEqual(['https://www.linkedin.com/in/taylor-one']);
    expect(parsed.metrics).toMatchObject({ web_search_tool_calls: 1, contacts_returned: 1,
      valid_linkedin_count: 1, input_tokens: 1000, output_tokens: 500, reasoning_tokens: 200 });
    expect(parsed.diagnostics.searchQueries).toEqual(['Taylor One Microsoft recruiter']);
    expect(() => parseOpenAIDiscoveryResponse(response([person], false), input)).toThrow('required web search');
  });

  it('rejects invented profile URLs and source titles that do not support current employment', () => {
    const invented = { ...person, linkedinUrl: 'https://www.linkedin.com/in/invented' };
    expect(parseOpenAIDiscoveryResponse(response([invented]), input).contacts).toEqual([]);
    const former = response();
    former.output[0]!.results![0]!.title = 'Taylor One - Former Microsoft Recruiter';
    expect(parseOpenAIDiscoveryResponse(former, input).contacts).toEqual([]);
    const urlsWithoutTitles = response();
    urlsWithoutTitles.output[0]!.results = [];
    expect(parseOpenAIDiscoveryResponse(urlsWithoutTitles, input).contacts).toEqual([]);
  });

  it('sends one capped, live, required-search Responses request and never searches for email', async () => {
    vi.stubEnv('OPENAI_API_KEY', 'test-key');
    const mock = vi.fn().mockResolvedValue({ ok: true, json: async () => response() });
    vi.stubGlobal('fetch', mock);
    const result = await discoverContactsWithOpenAI(input);
    expect(result.contacts).toHaveLength(1);
    const [url, options] = mock.mock.calls[0];
    expect(url).toBe('https://api.openai.com/v1/responses');
    const body = JSON.parse(options.body);
    expect(body).toMatchObject({ model: 'gpt-6-luna', reasoning: { effort: 'medium' },
      max_tool_calls: 4, tool_choice: 'required', store: false,
      tools: [{ type: 'web_search', external_web_access: true }],
      include: ['web_search_call.action.sources', 'web_search_call.results'] });
    expect(body.instructions).toContain('Do not search for email addresses');
  });
});
