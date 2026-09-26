import {
  AbsoluteFill,
  interpolate,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import { theme, clamp } from './style';
export const Opening = () => {
  const f = useCurrentFrame(),
    { fps } = useVideoConfig();
  const settle = spring({
    frame: f - 10,
    fps,
    config: { damping: 24, stiffness: 80 },
  });
  const second = spring({
    frame: f - 45,
    fps,
    config: { damping: 24, stiffness: 80 },
  });
  const reveal = interpolate(f, [130, 170], [0, 1], clamp);
  return (
    <AbsoluteFill
      style={{
        background: theme.ink,
        color: theme.ivory,
        fontFamily: theme.font,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse at 85% 80%, #123F81 0%, transparent 62%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          width: 1100,
          height: 1100,
          right: -380,
          top: -300,
          border: '1px solid #456CA655',
          borderRadius: '50%',
          scale: 1 + f / 1800,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 78,
          fontSize: 36,
          fontWeight: 650,
          letterSpacing: -1,
        }}
      >
        TrackMy<span style={{ color: theme.ice }}>OPT</span>
      </div>
      <div style={{ position: 'absolute', top: 260, left: 110, right: 100 }}>
        <div
          style={{
            fontSize: 152,
            lineHeight: 1.06,
            letterSpacing: -7,
            fontWeight: 650,
            translate: `0 ${(1 - settle) * 80}px`,
            opacity: settle,
          }}
        >
          Your next chapter.
        </div>
        <div
          style={{
            fontSize: 152,
            lineHeight: 1.06,
            letterSpacing: -7,
            fontWeight: 650,
            color: theme.ice,
            marginTop: 12,
            translate: `0 ${(1 - second) * 80}px`,
            opacity: second,
          }}
        >
          Less busywork.
        </div>
        <div
          style={{
            height: 5,
            width: interpolate(f, [90, 150], [0, 680], clamp),
            background: theme.blue,
            marginTop: 52,
          }}
        />
        <div
          style={{
            fontSize: 40,
            marginTop: 40,
            color: theme.muted,
            opacity: reveal,
            translate: `0 ${(1 - reveal) * 20}px`,
          }}
        >
          Prepare applications. Track opportunities. Follow your timeline.
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          bottom: 92,
          display: 'flex',
          gap: 70,
          fontSize: 27,
          color: theme.muted,
          opacity: reveal,
        }}
      >
        <span>Chrome extension</span>
        <span>Built for your OPT journey</span>
      </div>
    </AbsoluteFill>
  );
};
