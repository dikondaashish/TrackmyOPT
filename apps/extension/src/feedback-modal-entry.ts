/**
 * TrackMyOPT — open the feedback modal on the CURRENT PAGE (injected via
 * activeTab when the user clicks "Feedback" in the popup). The modal itself
 * lives in feedback.ts and is shared with the job widget's "Send feedback"
 * link, so both entry points open the exact same on-page, centered modal —
 * never inside the small toolbar popup.
 */

import { openFeedbackModal } from './feedback';

openFeedbackModal();
