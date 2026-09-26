import {
  AbsoluteFill,
  getStaticFiles,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { Video } from '@remotion/media';
import plan from './shot-list.json';
import { theme, clamp } from './style';
export type Shot = (typeof plan.scenes)[number];
export const Feature = ({
  shot,
  index = 0,
}: {
  shot: Shot;
  index?: number;
}) => {
  const frame = useCurrentFrame(),
    { fps, durationInFrames } = useVideoConfig();
  const exists = getStaticFiles().some((f) => f.name === shot.recording);
  const entrance = spring({
    frame: frame - 5,
    fps,
    config: { damping: 24, stiffness: 95 },
  });
  const light = index % 3 === 1,
    fg = light ? theme.ink : theme.ivory,
    bg = light ? theme.ivory : theme.ink;
  return (
    <AbsoluteFill
      style={{
        background: bg,
        color: fg,
        fontFamily: theme.font,
        padding: '64px 96px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          fontSize: 29,
          display: 'flex',
          justifyContent: 'space-between',
          color: light ? '#37506E' : theme.muted,
        }}
      >
        <span>TrackMyOPT</span>
        <span>
          {String(index + 1).padStart(2, '0')} / {shot.feature}
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 70,
          marginTop: 28,
          marginBottom: 30,
          opacity: entrance,
          translate: `0 ${(1 - entrance) * 22}px`,
        }}
      >
        <div
          style={{
            fontSize: 82,
            letterSpacing: -3.5,
            fontWeight: 650,
            lineHeight: 1.05,
            whiteSpace: 'pre-line',
            flex: 1,
          }}
        >
          {shot.headline}
        </div>
        <div
          style={{
            width: 600,
            fontSize: 33,
            lineHeight: 1.35,
            color: light ? '#425471' : theme.muted,
          }}
        >
          {shot.caption}
        </div>
      </div>
      <div
        style={{
          position: 'relative',
          flex: 1,
          minHeight: 0,
          borderRadius: 20,
          overflow: 'hidden',
          background: light ? '#DFE5EB' : '#0E2546',
          border: `1px solid ${light ? '#CBD3DD' : '#315176'}`,
          boxShadow: '0 25px 55px #0003',
          opacity: interpolate(frame, [8, 24], [0, 1], clamp),
        }}
      >
        {exists ? (
          <Video
            src={staticFile(shot.recording)}
            trimBefore={Math.round(shot.trimStartSeconds * fps)}
            playbackRate={shot.playbackRate}
            muted
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
          />
        ) : (
          <AbsoluteFill
            style={{
              alignItems: 'center',
              justifyContent: 'center',
              padding: 90,
              gap: 24,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 28, color: light ? '#4F6786' : theme.ice }}>
              RECORDING NEEDED
            </div>
            <div style={{ fontSize: 54, fontWeight: 600 }}>{shot.feature}</div>
            <div
              style={{
                fontSize: 28,
                lineHeight: 1.5,
                maxWidth: 1100,
                color: light ? '#425471' : theme.muted,
              }}
            >
              {shot.capture}
            </div>
            <div
              style={{ fontSize: 22, color: light ? '#425471' : theme.muted }}
            >
              {shot.recording}
            </div>
          </AbsoluteFill>
        )}
        {exists && !shot.reviewed ? (
          <div
            style={{
              position: 'absolute',
              right: 20,
              top: 20,
              padding: '9px 16px',
              background: '#091831E8',
              fontSize: 23,
              color: 'white',
            }}
          >
            DRAFT · Footage review pending
          </div>
        ) : null}
      </div>
      <div
        style={{
          height: 4,
          marginTop: 26,
          background: light ? '#CDD7E5' : '#233A59',
        }}
      >
        <div
          style={{
            width: `${Math.min(100, (100 * frame) / (shot.durationSeconds * fps))}%`,
            height: 4,
            background: theme.blue,
          }}
        />
      </div>
      <div
        style={{
          fontSize: 22,
          marginTop: 15,
          color: light ? '#536A86' : theme.muted,
        }}
      >
        {shot.id === 'opt' || shot.id === 'stem'
          ? 'Based on saved dates and history. Confirm requirements with your DSO.'
          : exists
            ? 'Review your information before continuing.'
            : 'Storyboard preview · Not a recording of the extension'}
      </div>
    </AbsoluteFill>
  );
};
