"""Fit sequential narration takes to the approved, unchanged 90-second timeline."""
import json
import subprocess
import wave
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent
WORK = OUT / 'work-audio'
WORK.mkdir(exist_ok=True)
RATE = 48000

def ffmpeg(*args):
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-threads', '1',
                    '-filter_threads', '1', *map(str, args)], check=True)

def duration(path):
    return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries',
        'format=duration', '-of', 'default=nw=1:nk=1', str(path)], text=True))

meta = json.loads((OUT / 'audio-generation.json').read_text())
master = bytearray(90 * RATE * 2)
for segment in meta['segments']:
    ident = segment['id']
    trimmed = WORK / f'{ident}-trimmed.wav'
    # Trim only very quiet edge padding; preserve all spoken content.
    edge = 'silenceremove=start_periods=1:start_duration=0.01:start_threshold=-50dB'
    ffmpeg('-i', OUT / segment['path'], '-af', f'{edge},areverse,{edge},areverse',
           '-ar', RATE, '-ac', 1, '-c:a', 'pcm_s16le', trimmed)
    seconds = duration(trimmed)
    slot = segment['end'] - segment['start']
    # Let the delivery breathe within its scene; atempo preserves vocal pitch.
    tempo = max(0.88, seconds / (slot - 0.25))
    if tempo > 1.2:
        raise ValueError(f'Segment {ident} needs a faster new take: {tempo:.3f}')
    fitted = WORK / f'{ident}-fitted.wav'
    ffmpeg('-i', trimmed, '-af', f'atempo={tempo:.8f},afade=t=in:d=0.008,afade=t=out:st={seconds/tempo-0.015:.6f}:d=0.015',
           '-ar', RATE, '-ac', 1, '-c:a', 'pcm_s16le', fitted)
    with wave.open(str(fitted), 'rb') as source:
        frames = source.readframes(source.getnframes())
    start = round((segment['start'] + 0.06) * RATE) * 2
    assert start + len(frames) <= round(segment['end'] * RATE) * 2
    master[start:start + len(frames)] = frames
    segment.update(trimmed_duration=round(seconds, 4), tempo=round(tempo, 6),
                   narration_start=round(start / (RATE * 2), 4),
                   narration_end=round((start + len(frames)) / (RATE * 2), 4))
with wave.open(str(WORK / 'aligned.wav'), 'wb') as output:
    output.setparams((1, 2, RATE, 0, 'NONE', 'not compressed'))
    output.writeframes(master)
ffmpeg('-i', WORK / 'aligned.wav', '-af', 'loudnorm=I=-16:TP=-2:LRA=7',
       '-ar', RATE, '-ac', 1, '-c:a', 'pcm_s16le', OUT / 'composition/assets/narration.wav')
(OUT / 'narration-timing.json').write_text(json.dumps(meta, indent=2) + '\n')
print(json.dumps({'segments': len(meta['segments']), 'duration': 90,
                  'max_tempo': max(s['tempo'] for s in meta['segments'])}))
