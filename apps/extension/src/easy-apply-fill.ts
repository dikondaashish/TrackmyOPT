/**
 * TrackMyOPT — job application prefill entry (popup-injected via activeTab).
 *
 * Thin wrapper: the actual fill logic + all safety invariants live in the
 * shared engine (easy-apply-engine.ts), which the on-page job widget also uses.
 */

import { runPrefill } from './easy-apply-engine';

void runPrefill();
