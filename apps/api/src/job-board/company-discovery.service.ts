import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  discoverCompanyBoards,
  isPathAllowedByRobots,
  type CompanyDiscoverySeed,
  type DiscoveryPage,
} from './company-discovery';
import type { PriorityAtsPlatform } from './ats-platform.registry';

const DISCOVERY_USER_AGENT =
  'TrackMyOPTJobDiscovery/1.0 (+https://trackmyopt.com)';
const MAX_RESPONSE_BYTES = 2 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 10_000;

type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

type CompanyRow = {
  id: string;
  name: string;
  website: string;
  domain: string;
  careers_url: string | null;
};

type PlatformRow = {
  key: PriorityAtsPlatform;
  authorization_status: 'approved' | 'pending_review' | 'blocked';
};

type BoardRow = {
  id: string;
  company_id: string;
  verification_status: string;
};

type PostgrestFailure = { code?: string; message: string };

export class PoliteDiscoveryHttpClient {
  private readonly pageCache = new Map<string, DiscoveryPage | null>();
  private readonly robotsCache = new Map<string, string | null>();

  constructor(private readonly fetchImpl: FetchLike = fetch) {}

  async getPage(value: string): Promise<DiscoveryPage | null> {
    if (this.pageCache.has(value)) return this.pageCache.get(value) ?? null;
    const url = this.safeUrl(value);
    if (!url || !(await this.isAllowed(url))) {
      this.pageCache.set(value, null);
      return null;
    }

    let response: Response;
    try {
      response = await this.fetchImpl(url.toString(), {
        headers: {
          Accept: 'text/html,application/xhtml+xml,application/json;q=0.8',
          'User-Agent': DISCOVERY_USER_AGENT,
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch {
      this.pageCache.set(value, null);
      return null;
    }
    const length = Number(response.headers.get('content-length') || 0);
    if (!response.ok || (length > 0 && length > MAX_RESPONSE_BYTES)) {
      this.pageCache.set(value, null);
      return null;
    }
    const finalUrl = this.safeUrl(response.url || url.toString());
    if (!finalUrl) {
      this.pageCache.set(value, null);
      return null;
    }
    const body = await response.text();
    if (Buffer.byteLength(body, 'utf8') > MAX_RESPONSE_BYTES) {
      this.pageCache.set(value, null);
      return null;
    }
    const page = { finalUrl: finalUrl.toString(), body };
    this.pageCache.set(value, page);
    return page;
  }

  private safeUrl(value: string) {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' ? url : null;
    } catch {
      return null;
    }
  }

  private async isAllowed(url: URL) {
    const robotsUrl = `${url.origin}/robots.txt`;
    if (!this.robotsCache.has(url.origin)) {
      try {
        const response = await this.fetchImpl(robotsUrl, {
          headers: {
            Accept: 'text/plain',
            'User-Agent': DISCOVERY_USER_AGENT,
          },
          redirect: 'follow',
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });
        if (response.status === 404 || response.status === 410) {
          this.robotsCache.set(url.origin, '');
        } else if (!response.ok) {
          this.robotsCache.set(url.origin, null);
        } else {
          this.robotsCache.set(url.origin, await response.text());
        }
      } catch {
        this.robotsCache.set(url.origin, null);
      }
    }
    const robots = this.robotsCache.get(url.origin);
    return robots !== null && isPathAllowedByRobots(robots || '', url.pathname);
  }
}

@Injectable()
export class CompanyDiscoveryService {
  private readonly logger = new Logger(CompanyDiscoveryService.name);
  private readonly supabase: SupabaseClient;

  constructor(private readonly config: ConfigService) {
    this.supabase = createClient(
      this.config.get<string>('NEXT_PUBLIC_SUPABASE_URL') || '',
      this.config.get<string>('SUPABASE_SERVICE_ROLE_KEY') || '',
    ) as unknown as SupabaseClient;
  }

  async discoverNextBatch(requestedLimit = 10) {
    const limit = Math.max(1, Math.min(requestedLimit, 25));
    const startedAt = new Date().toISOString();
    const run = await this.supabase
      .from('discovery_runs')
      .insert({
        run_type: 'career_discovery',
        status: 'running',
        seed_source: 'h1b_sponsor',
        started_at: startedAt,
      })
      .select('id')
      .single();
    if (run.error || !run.data) {
      throw new Error(run.error?.message || 'Could not create discovery run');
    }
    const runId = String((run.data as { id: string }).id);

    const [companiesResult, platformsResult] = await Promise.all([
      this.supabase
        .from('companies')
        .select('id, name, website, domain, careers_url')
        .in('discovery_status', ['seeded', 'pending_discovery'])
        .not('website', 'is', null)
        .not('domain', 'is', null)
        .order('last_checked_at', { ascending: true, nullsFirst: true })
        .order('has_supported_ats_hint', { ascending: false })
        .order('discovery_priority', { ascending: false })
        .limit(limit),
      this.supabase
        .from('ats_platforms')
        .select('key, authorization_status')
        .eq('discovery_enabled', true),
    ]);
    if (companiesResult.error || platformsResult.error) {
      await this.failRun(
        runId,
        companiesResult.error?.message || platformsResult.error?.message || '',
      );
      throw new Error(
        companiesResult.error?.message || platformsResult.error?.message,
      );
    }

    const authorizations = Object.fromEntries(
      ((platformsResult.data || []) as PlatformRow[]).map((platform) => [
        platform.key,
        platform.authorization_status,
      ]),
    ) as Partial<
      Record<PriorityAtsPlatform, 'approved' | 'pending_review' | 'blocked'>
    >;
    let careersFound = 0;
    let boardsDetected = 0;
    let boardsQueuedForReview = 0;
    let failures = 0;
    const client = new PoliteDiscoveryHttpClient();

    for (const row of (companiesResult.data || []) as CompanyRow[]) {
      try {
        const company: CompanyDiscoverySeed = {
          id: row.id,
          name: row.name,
          website: row.website,
          domain: row.domain,
          careersUrl: row.careers_url,
        };
        const discovery = await discoverCompanyBoards(
          company,
          (url) => client.getPage(url),
          authorizations,
        );
        if (discovery.careerPageUrl) careersFound += 1;
        boardsDetected += discovery.boards.length;
        boardsQueuedForReview += await this.persistDiscovery(
          company,
          discovery,
          runId,
        );
      } catch (error) {
        failures += 1;
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        await this.supabase.from('source_errors').insert({
          discovery_run_id: runId,
          error_type: 'unknown',
          message: `Company ${row.id}: ${message}`,
          retryable: true,
        });
        this.logger.warn(`Discovery failed for company ${row.id}: ${message}`);
      }
    }

    const status = failures ? 'partial' : 'succeeded';
    const completedAt = new Date().toISOString();
    const summary = {
      status,
      companiesAttempted: (companiesResult.data || []).length,
      careersFound,
      boardsDetected,
      boardsQueuedForReview,
      failures,
    };
    const completion = await this.supabase
      .from('discovery_runs')
      .update({
        status,
        companies_attempted: summary.companiesAttempted,
        careers_found: careersFound,
        boards_detected: boardsDetected,
        boards_queued_for_review: boardsQueuedForReview,
        completed_at: completedAt,
        checkpoint: { last_batch_size: limit },
      })
      .eq('id', runId);
    if (completion.error) throw new Error(completion.error.message);
    return { runId, ...summary };
  }

  private async persistDiscovery(
    company: CompanyDiscoverySeed,
    discovery: Awaited<ReturnType<typeof discoverCompanyBoards>>,
    runId: string,
  ) {
    const companyUpdate = await this.supabase
      .from('companies')
      .update({
        careers_url: discovery.careerPageUrl || company.careersUrl || null,
        discovery_status: discovery.boards.length
          ? 'discovered'
          : 'pending_discovery',
        last_checked_at: new Date().toISOString(),
      })
      .eq('id', company.id);
    if (companyUpdate.error) throw new Error(companyUpdate.error.message);

    let queued = 0;
    for (const board of discovery.boards) {
      const existing = await this.supabase
        .from('ats_boards')
        .select('id, company_id, verification_status')
        .eq('platform_key', board.platform)
        .eq('board_token', board.boardToken)
        .maybeSingle();
      if (existing.error) throw new Error(existing.error.message);
      const existingBoard = existing.data as BoardRow | null;
      if (existingBoard && existingBoard.company_id !== company.id) {
        await this.supabase.from('source_errors').insert({
          ats_board_id: existingBoard.id,
          discovery_run_id: runId,
          error_type: 'company_mismatch',
          message: `Board ${board.platform}:${board.boardToken} was also discovered for company ${company.id}`,
          retryable: false,
          metadata: { candidate_company_id: company.id },
        });
        continue;
      }
      if (existingBoard?.verification_status === 'verified') continue;

      const values = {
        company_id: company.id,
        platform_key: board.platform,
        board_token: board.boardToken,
        board_url: board.boardUrl,
        verification_status: board.verificationStatus,
        confidence: board.ownership.confidence,
        company_name_match: board.ownership.companyNameMatch,
        website_match: board.ownership.websiteMatch,
        domain_match: board.ownership.domainMatch,
        careers_link_match: board.ownership.careersLinkMatch,
        branding_match: board.ownership.brandingMatch,
        verification_evidence: {
          reasons: board.ownership.reasons,
          discovered_on_url: board.discoveredOnUrl,
          discovered_from_url: board.discoveredFromUrl,
          activation_allowed: false,
        },
        discovered_by: 'career_page',
      };
      let boardId = existingBoard?.id;
      if (!existingBoard) {
        const inserted = await this.supabase
          .from('ats_boards')
          .insert(values)
          .select('id')
          .single();
        if (inserted.error || !inserted.data) {
          throw new Error(inserted.error?.message || 'Could not insert board');
        }
        boardId = String(inserted.data.id);
      } else if (existingBoard.verification_status !== 'verified') {
        const updated = await this.supabase
          .from('ats_boards')
          .update(values)
          .eq('id', existingBoard.id);
        if (updated.error) throw new Error(updated.error.message);
      }
      if (!boardId) throw new Error('Discovered board is missing an id');

      const queuedResult = await this.supabase
        .from('source_verification_queue')
        .insert({
          ats_board_id: boardId,
          reason: board.queueReason,
          priority:
            board.queueReason === 'ready_for_explicit_verification' ? 1 : 2,
        });
      const queueError = queuedResult.error as PostgrestFailure | null;
      if (queueError && queueError.code !== '23505') {
        throw new Error(queueError.message);
      }
      if (!queueError) queued += 1;
    }
    return queued;
  }

  private async failRun(runId: string, message: string) {
    await this.supabase
      .from('discovery_runs')
      .update({
        status: 'failed',
        error_message: message,
        completed_at: new Date().toISOString(),
      })
      .eq('id', runId);
  }
}
