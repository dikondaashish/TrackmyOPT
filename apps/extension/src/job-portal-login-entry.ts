import { runStandaloneJobPortalLoginPrefill } from './standalone-job-portal-prefill';

if (window.top === window.self) {
  runStandaloneJobPortalLoginPrefill();
}
