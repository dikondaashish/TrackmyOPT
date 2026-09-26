// Sequential Gemini generation through the Hyperframes media-use audio adapter.
// Credentials stay in the process environment; never put them in this package.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';
const out = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const adapter = process.env.MEDIA_USE_GEMINI_ADAPTER || join(homedir(), '.agents/skills/media-use/audio/scripts/lib/gemini-tts.mjs');
const { synthesizeGemini } = await import(pathToFileURL(adapter).href);
const request = JSON.parse(readFileSync(join(out, 'audio_request.json'), 'utf8'));
const metadata = { model: request.tts_model, voice: request.voice, segments: [] };
for (const line of request.lines) {
  const file = join(out, 'composition/assets/voice', `${line.id}.wav`);
  if (!existsSync(file)) {
    const result = await synthesizeGemini({ text: line.text, voiceId: request.voice,
      model: request.tts_model, style: request.style, wavAbs: file });
    if (!result.ok) throw new Error(result.error);
  }
  const duration = Number(execFileSync('ffprobe', ['-v', 'error', '-show_entries',
    'format=duration', '-of', 'default=nw=1:nk=1', file], { encoding: 'utf8' }).trim());
  if (!(duration > 0)) throw new Error(`Invalid audio duration: ${line.id}`);
  metadata.segments.push({ ...line, source_duration: duration, path: `composition/assets/voice/${line.id}.wav` });
  writeFileSync(join(out, 'audio-generation.json'), JSON.stringify(metadata, null, 2) + '\n');
  console.log(`Segment ${line.id}: ${duration.toFixed(2)}s for ${(line.end-line.start).toFixed(1)}s slot`);
}
