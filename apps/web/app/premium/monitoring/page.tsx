import { Suspense } from 'react';
import { MonitoringEmailOffer } from './MonitoringEmailOffer';
export const metadata = {
  title: 'Daily case monitoring | TrackMyOPT',
  robots: { index: false, follow: false },
  referrer: 'no-referrer',
};
export default function MonitoringPage() {
  return (
    <Suspense>
      <MonitoringEmailOffer />
    </Suspense>
  );
}
