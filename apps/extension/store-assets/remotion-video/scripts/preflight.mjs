import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { resolve, relative, isAbsolute } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { getVideoMetadata } from '@remotion/renderer';

export async function validatePlan(plan, media) {
  const errors = [],
    seen = new Set();
  if (!Number.isInteger(plan.fps) || plan.fps <= 0)
    errors.push('fps must be a positive integer');
  for (const shot of plan.scenes) {
    if (seen.has(shot.id)) errors.push(shot.id + ': duplicate shot id');
    seen.add(shot.id);
    if (!/^recordings\/[a-z0-9-]+\.mp4$/.test(shot.recording)) {
      errors.push(shot.id + ': use a local MP4 inside public/recordings');
      continue;
    }
    if (!shot.reviewed)
      errors.push(shot.id + ': footage needs a visual/privacy review');
    if (
      !Number.isFinite(shot.durationSeconds) ||
      shot.durationSeconds <= 0 ||
      !Number.isFinite(shot.trimStartSeconds) ||
      shot.trimStartSeconds < 0 ||
      !Number.isFinite(shot.playbackRate) ||
      shot.playbackRate <= 0
    ) {
      errors.push(shot.id + ': invalid timing');
      continue;
    }
    if (!Number.isInteger(shot.durationSeconds * plan.fps))
      errors.push(shot.id + ': duration must resolve to a whole frame');
    try {
      const metadata = await media(shot.recording);
      if (!metadata) {
        errors.push(shot.id + ': recording missing');
        continue;
      }
      const needed =
        shot.trimStartSeconds + shot.durationSeconds * shot.playbackRate;
      if (metadata.durationInSeconds + 1 / plan.fps < needed)
        errors.push(
          shot.id +
            ': clip is too short for the requested trim and playback speed'
        );
    } catch (error) {
      errors.push(shot.id + ': cannot inspect recording: ' + error.message);
    }
  }
  return errors;
}
if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(resolve(process.argv[1])).href
) {
  const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
  const plan = JSON.parse(
    readFileSync(resolve(root, 'src/shot-list.json'), 'utf8')
  );
  const recordings = resolve(root, 'public/recordings');
  const errors = await validatePlan(plan, async (name) => {
    const file = resolve(root, 'public', name);
    if (!existsSync(file)) return null;
    const rel = relative(realpathSync(recordings), realpathSync(file));
    if (rel.startsWith('..') || isAbsolute(rel))
      throw new Error('recording points outside public/recordings');
    return getVideoMetadata(file);
  });
  if (errors.length) {
    console.error(
      'Final render is not ready:\n' + errors.map((x) => ' - ' + x).join('\n')
    );
    process.exitCode = 1;
  } else
    console.log(
      'PASS: all recordings exist, are reviewed, and cover their timeline ranges.'
    );
}
