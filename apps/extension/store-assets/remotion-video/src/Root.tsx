import { Composition, Folder } from 'remotion';
import plan from './shot-list.json';
import { Opening } from './Opening';
import { Closing } from './Closing';
import { Feature } from './Feature';
import { Walkthrough, totalFrames } from './Walkthrough';
import { ReleaseTour, releaseTourFrames } from './ReleaseTour';
export const Root = () => (
  <>
    <Composition
      id="ReleaseTour"
      component={ReleaseTour}
      durationInFrames={releaseTourFrames}
      fps={plan.fps}
      width={1920}
      height={1080}
    />
    <Composition
      id="DetailedWalkthrough"
      component={Walkthrough}
      durationInFrames={totalFrames}
      fps={plan.fps}
      width={1920}
      height={1080}
    />
    <Composition
      id="Opening"
      component={Opening}
      durationInFrames={plan.openingSeconds * plan.fps}
      fps={plan.fps}
      width={1920}
      height={1080}
    />
    <Composition
      id="Closing"
      component={Closing}
      durationInFrames={plan.closingSeconds * plan.fps}
      fps={plan.fps}
      width={1920}
      height={1080}
    />
    <Folder name="Features">
      {plan.scenes.map((shot, index) => (
        <Composition
          key={shot.id}
          id={`Feature-${shot.id}`}
          component={Feature}
          durationInFrames={shot.durationSeconds * plan.fps}
          fps={plan.fps}
          width={1920}
          height={1080}
          defaultProps={{ shot, index }}
        />
      ))}
    </Folder>
  </>
);
