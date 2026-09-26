"""Extract one real encoded frame per scene into review sheets (Pillow + FFmpeg)."""
import json
import subprocess
from pathlib import Path
from PIL import Image, ImageDraw
out = Path(__file__).resolve().parent.parent
frames = out / 'validation-frames'
frames.mkdir(exist_ok=True)
story = json.loads((out / 'storyboard.json').read_text())
numbers = [round((s['start'] + min(1.2, s['duration'] / 2)) * 30) for s in story['scenes']]
select = '+'.join(f'eq(n,{n})' for n in numbers)
subprocess.run(['ffmpeg','-y','-v','error','-threads','1','-i',str(out/'brag.mp4'),'-vf',f"select='{select}',scale=640:360",'-fps_mode','vfr',str(frames/'frame-%02d.jpg')],check=True)
files=sorted(frames.glob('frame-*.jpg'))
assert len(files)==len(numbers),(len(files),len(numbers))
for start in range(0,len(files),9):
    sheet=Image.new('RGB',(1920,3*390),'#dce3ee')
    draw=ImageDraw.Draw(sheet)
    for j,f in enumerate(files[start:start+9]):
        x=(j%3)*640;y=(j//3)*390
        sheet.paste(Image.open(f),(x,y+30))
        s=story['scenes'][start+j]
        draw.text((x+10,y+8),f"{s['start']}s  {s['image']}",fill='#0f172a')
    sheet.save(frames/f'review-{start//9+1}.jpg',quality=90)
print(f'Extracted {len(files)} scene proof frames from final MP4.')
