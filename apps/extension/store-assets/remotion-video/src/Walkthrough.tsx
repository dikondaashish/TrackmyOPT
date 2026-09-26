import { TransitionSeries, linearTiming } from '@remotion/transitions';
import { fade } from '@remotion/transitions/fade';
import { Fragment } from 'react';
import plan from './shot-list.json';
import { Opening } from './Opening';
import { Closing } from './Closing';
import { Feature } from './Feature';
export const TRANSITION = 12;
export const totalFrames =
  (plan.openingSeconds +
    plan.closingSeconds +
    plan.scenes.reduce((n, s) => n + s.durationSeconds, 0)) *
    plan.fps -
  (plan.scenes.length + 1) * TRANSITION;
export const Walkthrough = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence
      durationInFrames={plan.openingSeconds * plan.fps}
    >
      <Opening />
    </TransitionSeries.Sequence>
    {plan.scenes.map((shot, index) => (
      <Fragment key={shot.id}>
        <TransitionSeries.Transition
          presentation={fade()}
          timing={linearTiming({ durationInFrames: TRANSITION })}
        />
        <TransitionSeries.Sequence
          durationInFrames={shot.durationSeconds * plan.fps}
          name={shot.feature}
        >
          <Feature shot={shot} index={index} />
        </TransitionSeries.Sequence>
      </Fragment>
    ))}
    <TransitionSeries.Transition
      presentation={fade()}
      timing={linearTiming({ durationInFrames: TRANSITION })}
    />
    <TransitionSeries.Sequence
      durationInFrames={plan.closingSeconds * plan.fps}
    >
      <Closing />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
