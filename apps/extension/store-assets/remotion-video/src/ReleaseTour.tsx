import {
  AbsoluteFill,
  getStaticFiles,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from 'remotion';
import { Video } from '@remotion/media';
import { Closing } from './Closing';
import { Opening } from './Opening';
import { clamp, theme } from './style';

const fps = 30;
const openingFrames = 8 * fps;
const tourFrames = 42 * fps;
const closingFrames = 6 * fps;
const recording = 'recordings/release-tour-0.2.1.mp4';

const chapters = [
  { at: 0, label: '01 / GET STARTED', title: 'Start prepared.', detail: 'Your application companion, shown with sample data.' },
  { at: 3.5, label: '02 / SMART PREFILL', title: 'One click. Less repetition.', detail: 'Fill matching empty fields, then review.' },
  { at: 9.9, label: '03 / TAILORED RÉSUMÉS', title: 'Give each role the right emphasis.', detail: 'A prepared example; no AI request in this tour.' },
  { at: 16.3, label: '04 / JOB TRACKER', title: 'Keep the role. Keep the context.', detail: 'Follow a sample job from saved to applied.' },
  { at: 22.7, label: '05 / OPT TOOLS', title: 'See your timeline clearly.', detail: 'Illustrative dates and employment history.' },
  { at: 29.1, label: '06 / STEM OPT TOOLS', title: 'Plan for what comes next.', detail: 'An illustrative STEM timeline, alongside OPT.' },
  { at: 35.5, label: '07 / YOUR NEXT STEP', title: 'Make room for what comes next.', detail: 'Set up your profile when you are ready.' },
] as const;

const RecordedTour = () => {
  const frame = useCurrentFrame();
  const seconds = frame / fps;
  const chapterIndex = chapters.reduce((last, item, index) => seconds >= item.at ? index : last, 0);
  const chapter = chapters[chapterIndex];
  const chapterFrame = frame - Math.round(chapter.at * fps);
  const entrance = interpolate(chapterFrame, [0, 15], [0, 1], clamp);
  const fade = interpolate(frame, [0, 12, tourFrames - 15, tourFrames], [0, 1, 1, 0], clamp);
  const exists = getStaticFiles().some((file) => file.name === recording);

  return (
    <AbsoluteFill style={{ background: theme.ink, color: theme.ivory, fontFamily: theme.font, overflow: 'hidden', opacity: fade }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 75% 15%, #163B75 0%, transparent 55%)' }} />
      <div style={{ position: 'absolute', left: 96, top: 38, right: 96, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 30 }}>
          <span style={{ color: theme.ice, fontSize: 25, fontWeight: 700, letterSpacing: 2 }}>{chapter.label}</span>
          <span style={{ fontSize: 61, fontWeight: 650, letterSpacing: -2.8, lineHeight: 1.1, opacity: entrance, transform: `translateY(${(1 - entrance) * 17}px)` }}>{chapter.title}</span>
        </div>
        <div style={{ textAlign: 'right', maxWidth: 420, fontSize: 22, lineHeight: 1.32, color: theme.muted }}>
          <div style={{ color: theme.ivory, fontWeight: 700, fontSize: 24, marginBottom: 8 }}>TrackMyOPT</div>
          <div>{chapter.detail}</div>
        </div>
      </div>
      <div style={{ position: 'absolute', left: 96, top: 166, width: 1728, height: 900, borderRadius: 26, overflow: 'hidden', border: '1px solid #4B6D9D', boxShadow: '0 24px 90px #0009', background: '#E8EFF8' }}>
        {exists ? <Video src={staticFile(recording)} muted style={{ width: 1728, height: 900 }} /> : <AbsoluteFill style={{ color: theme.ink, alignItems: 'center', justifyContent: 'center', fontSize: 40 }}>Recordly release tour footage needed</AbsoluteFill>}
        <div style={{ position: 'absolute', right: 26, bottom: 24, padding: '11px 18px', borderRadius: 999, background: '#07162DEB', color: 'white', fontSize: 21, fontWeight: 650, letterSpacing: 0.3 }}>INTERACTIVE SAMPLE TOUR · FICTIONAL DATA</div>
      </div>
      <div style={{ position: 'absolute', left: 96, right: 96, bottom: 0, height: 5, background: '#183157' }}>
        <div style={{ height: '100%', width: `${100 * frame / tourFrames}%`, background: theme.blue }} />
      </div>
    </AbsoluteFill>
  );
};

export const releaseTourFrames = openingFrames + tourFrames + closingFrames;

export const ReleaseTour = () => (
  <AbsoluteFill style={{ background: theme.ink }}>
    <Sequence from={0} durationInFrames={openingFrames}><Opening /></Sequence>
    <Sequence from={openingFrames} durationInFrames={tourFrames}><RecordedTour /></Sequence>
    <Sequence from={openingFrames + tourFrames} durationInFrames={closingFrames}><Closing /></Sequence>
  </AbsoluteFill>
);
