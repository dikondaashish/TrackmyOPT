"""Cloud audio review; the key is entered privately and never saved."""
import base64
import getpass
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

out = Path(__file__).resolve().parent.parent
source = Path(sys.argv[1]) if len(sys.argv) > 1 else out / 'composition/assets/narration.wav'
destination = Path(sys.argv[2]) if len(sys.argv) > 2 else out / 'narration-review.json'
key = getpass.getpass('API key (hidden): ')
prompt = '''Transcribe the attached audio verbatim. Do not improve or rewrite the words.
Return JSON with transcript (string), segments (array of start_seconds, end_seconds,
text), and quality (object with intelligibility, speaker_consistency,
clipped_words, unexpected_sounds, music_masking_voice). Report uncertainties.
This is a product demo narration. Judge only what you hear, including any long gaps.
Use empty arrays for no detected clipped words or unexpected sounds.'''
body = {'model': 'gemini-3.8-flash', 'store': False, 'input': [
    {'type': 'text', 'text': prompt},
    {'type': 'audio', 'mime_type': 'audio/wav', 'data': base64.b64encode(source.read_bytes()).decode()}]}
req = urllib.request.Request('https://generativelanguage.googleapis.com/v1beta/interactions',
    data=json.dumps(body).encode(), headers={'x-goog-api-key': key, 'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=120) as response:
        data = json.load(response)
    texts = [c['text'] for s in data.get('steps', []) if s.get('type') == 'model_output'
             for c in s.get('content', []) if c.get('type') == 'text']
    text = '\n'.join(texts).strip()
    if text.startswith('```'):
        text = text.split('\n', 1)[1].rsplit('```', 1)[0]
    review = json.loads(text)
    destination.write_text(json.dumps(review, indent=2) + '\n')
    print(json.dumps(review.get('quality', {})))
except urllib.error.HTTPError as error:
    detail = error.read().decode().replace(key, '[REDACTED]')
    raise SystemExit(f'HTTP {error.code}: {detail}')
