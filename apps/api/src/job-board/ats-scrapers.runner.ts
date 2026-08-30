import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import * as path from 'node:path';

export interface ScrapedAtsJob {
  external_job_id: string;
  title: string;
  company_name: string;
  location: string | null;
  department: string | null;
  description: string | null;
  job_url: string | null;
  posted_at: string | null;
}

export interface AuthorizedAtsSourceInput {
  ats_type: string;
  board_token: string;
  base_url: string;
}

interface ScraperResponse {
  jobs: ScrapedAtsJob[];
}

export function fetchAuthorizedAtsJobs(
  source: AuthorizedAtsSourceInput,
): Promise<ScrapedAtsJob[]> {
  return new Promise((resolve, reject) => {
    const scriptPath = [
      path.resolve(process.cwd(), 'scripts/job-board/fetch_ats_jobs.py'),
      path.resolve(process.cwd(), '../../scripts/job-board/fetch_ats_jobs.py'),
    ].find(existsSync);
    if (!scriptPath) {
      reject(new Error('ats-scrapers runner script was not found'));
      return;
    }

    const child = spawn(
      process.env.ATS_SCRAPERS_PYTHON || 'python3',
      [scriptPath],
      {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe'],
      },
    );
    let stdout = '';
    let stderr = '';

    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.once('error', reject);
    child.once('close', (code) => {
      if (code !== 0) {
        reject(
          new Error(`ats-scrapers exited with code ${code}: ${stderr.trim()}`),
        );
        return;
      }
      try {
        const response = JSON.parse(stdout) as ScraperResponse;
        if (!Array.isArray(response.jobs))
          throw new Error('Invalid scraper response');
        resolve(response.jobs);
      } catch (error) {
        reject(
          error instanceof Error
            ? error
            : new Error('Invalid scraper response'),
        );
      }
    });
    child.stdin.end(JSON.stringify(source));
  });
}
