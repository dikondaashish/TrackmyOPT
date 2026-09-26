import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { theme, clamp } from './style';
export const Closing = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: theme.blue,
        color: 'white',
        fontFamily: theme.font,
        padding: 110,
        justifyContent: 'center',
      }}
    >
      <div style={{ fontSize: 36, position: 'absolute', top: 85 }}>
        TrackMyOPT
      </div>
      <div
        style={{
          fontSize: 146,
          fontWeight: 650,
          lineHeight: 1.02,
          letterSpacing: -6,
          opacity: interpolate(f, [8, 35], [0, 1], clamp),
          translate: `0 ${interpolate(f, [8, 35], [32, 0], clamp)}px`,
        }}
      >
        Make room for
        <br />
        what comes next.
      </div>
      <div style={{ fontSize: 44, marginTop: 50 }}>
        Get TrackMyOPT for Chrome.
      </div>
      <div style={{ fontSize: 30, position: 'absolute', bottom: 90 }}>
        trackmyopt.com
      </div>
    </AbsoluteFill>
  );
};
