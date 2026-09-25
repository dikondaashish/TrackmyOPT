"""Build this campaign's original illustration and local review page. Never sends mail.

Requires Python 3 and Pillow. Override CAMPAIGN_FONT_DIR if Trebuchet MS is not
installed in the macOS system fonts directory. Run from any working directory.
"""
from pathlib import Path
import html
import os
import shutil

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)
FONT_DIR = Path(os.environ.get("CAMPAIGN_FONT_DIR", "/System/Library/Fonts/Supplemental"))
SCALE = 2


def font(size, bold=False):
    return ImageFont.truetype(str(FONT_DIR / f"Trebuchet MS{' Bold' if bold else ''}.ttf"), size * SCALE)


def illustration(progress):
    im = Image.new("RGB", (1200, 496), "#184fc4")
    d = ImageDraw.Draw(im)

    def box(coords, fill, radius=0, outline=None, width=1):
        d.rounded_rectangle(tuple(round(x * SCALE) for x in coords), radius=radius * SCALE,
                            fill=fill, outline=outline, width=width * SCALE)

    def line(coords, fill, width=2):
        d.line(tuple(round(x * SCALE) for x in coords), fill=fill, width=width * SCALE)

    def circle(coords, fill, outline=None, width=1):
        d.ellipse(tuple(round(x * SCALE) for x in coords), fill=fill, outline=outline, width=width * SCALE)

    def text(x, y, content, size, fill, bold=False):
        d.text((x * SCALE, y * SCALE), content, font=font(size, bold), fill=fill, anchor="mt")

    # A journey illustration, not a product screenshot or customer data.
    line((72, 110, 528, 110), "#6088da", 2)
    line((72, 110, 72 + 456 * progress, 110), "#bad8ff", 3)
    centers = [72, 224, 376, 528]
    labels = ["Chrome tools", "OPT dates", "Case status", "Career tools"]
    sublabels = ["Application help", "Clearer planning", "Next actions", "Reach out"]
    for i, x in enumerate(centers):
        active = progress >= i / 3
        circle((x - 34, 76, x + 34, 144), "#edf4ff" if active else "#3264cb")
        ink = "#184fc4" if active else "#d5e5ff"
        if i == 0:
            box((x - 20, 91, x + 20, 120), None, 4, ink, 2)
            line((x - 12, 126, x + 12, 126), ink, 2)
            line((x, 120, x, 126), ink, 2)
            circle((x - 3, 97, x + 3, 103), ink)
            line((x, 103, x, 112), ink, 2)
        elif i == 1:
            box((x - 19, 90, x + 19, 126), None, 5, ink, 2)
            line((x - 19, 101, x + 19, 101), ink)
            line((x - 10, 85, x - 10, 95), ink, 3)
            line((x + 10, 85, x + 10, 95), ink, 3)
            for dx, yy in [(-9, 110), (2, 110), (13, 110), (-9, 119), (2, 119)]:
                circle((x + dx - 2, yy - 2, x + dx + 2, yy + 2), ink)
        elif i == 2:
            box((x - 18, 87, x + 18, 132), None, 4, ink, 2)
            line((x - 9, 98, x + 9, 98), ink)
            line((x - 9, 106, x + 9, 106), ink)
            line((x - 8, 118, x - 2, 123, x + 10, 113), ink, 3)
        else:
            box((x - 23, 91, x + 16, 118), None, 6, ink, 2)
            line((x - 14, 118, x - 14, 127, x - 4, 118), ink)
            line((x - 13, 101, x + 6, 101), ink)
            line((x - 13, 108, x + 1, 108), ink)
            line((x + 23, 104, x + 23, 128, x + 12, 128, x + 18, 135), ink)
        text(x, 168, labels[i], 14, "#f7faff", True)
        text(x, 193, sublabels[i], 10, "#d9e7ff")
    text(300, 23, "ONE JOURNEY. A LITTLE MORE CLARITY.", 11, "#d9e7ff", True)
    return im


def hero_background(progress):
    """A quiet calendar → case → outreach route behind the real HTML headline."""
    im = Image.new("RGB", (600, 244), "#184fc4")
    d = ImageDraw.Draw(im)
    muted = "#2f64cd"
    rail = "#5681d8"
    bright = "#a9c7ff"

    # Regular rows suggest a dated journey without implying real deadlines.
    for y in range(24, 244, 28):
        d.line((400, y, 599, y), fill="#2056c6", width=1)
    for x in range(412, 600, 28):
        d.line((x, 0, x, 243), fill="#2056c6", width=1)

    centers = [49, 118, 187]
    d.line((534, centers[0], 534, centers[-1]), fill=rail, width=2)
    active_y = centers[0] + (centers[-1] - centers[0]) * progress
    d.line((534, centers[0], 534, active_y), fill=bright, width=3)

    for i, y in enumerate(centers):
        active = progress >= i / 2
        color = bright if active else rail
        d.line((427, y, 502, y), fill=color if active else muted, width=2)
        d.ellipse((511, y - 23, 557, y + 23), fill="#275dca", outline=color, width=2)
        if i == 0:  # Calendar
            d.rounded_rectangle((523, y - 11, 545, y + 11), radius=3, outline=color, width=2)
            d.line((523, y - 4, 545, y - 4), fill=color, width=2)
            d.ellipse((528, y + 1, 531, y + 4), fill=color)
            d.ellipse((537, y + 1, 540, y + 4), fill=color)
        elif i == 1:  # Case record
            d.rounded_rectangle((524, y - 12, 544, y + 12), radius=2, outline=color, width=2)
            d.line((529, y - 5, 539, y - 5), fill=color, width=2)
            d.line((529, y + 1, 539, y + 1), fill=color, width=2)
            d.line((529, y + 7, 536, y + 7), fill=color, width=2)
        else:  # Outreach message
            d.rounded_rectangle((522, y - 10, 546, y + 7), radius=4, outline=color, width=2)
            d.line((527, y + 7, 527, y + 12, 533, y + 7), fill=color, width=2)
            d.line((527, y - 3, 540, y - 3), fill=color, width=2)
        # Small progress ticks read as a timeline rather than decoration.
        for j in range(4):
            x = 410 + j * 8
            d.line((x, y - 4, x, y + 4), fill=color if active else muted, width=2)

    # The only moving element is a single light travelling between checkpoints.
    d.ellipse((528, active_y - 6, 540, active_y + 6), fill="#d8e8ff")
    return im


# Every frame includes all four concepts. A complete first frame also works
# for clients with animation disabled. One brief pass, no infinite loop.
still = illustration(1)
still.save(ASSETS / "next-steps.png", optimize=True)
frames = [still] + [illustration(i / 23) for i in range(24)] + [still]
frames[0].save(ASSETS / "next-steps.gif", save_all=True, append_images=frames[1:],
               duration=[700] + [80] * 24 + [1000], optimize=True, disposal=2)
hero_still = hero_background(1)
hero_still.save(ASSETS / "hero-route.png", optimize=True)
hero_frames = [hero_still] + [hero_background(i / 23) for i in range(24)] + [hero_still]
hero_frames[0].save(ASSETS / "hero-route.gif", save_all=True,
                    append_images=hero_frames[1:],
                    duration=[700] + [80] * 24 + [1000], optimize=True,
                    disposal=2)
shutil.copyfile(ROOT.parents[3] / "apps/web/public/TrackMyOPT Logo/Favicon.png", ASSETS / "logo.png")

email = (ROOT / "email.html").read_text()
email = email.replace("{{ASSET_BASE_URL}}", "assets")
email = email.replace("{{POSTAL_ADDRESS}}", "[Verified sender postal address to be added]")
email = email.replace('href="{{UNSUBSCRIBE_URL}}"', 'href="#unsubscribe-preview" aria-disabled="true" onclick="return false"')
(ROOT / "preview-email.html").write_text(email)

subject = "Important notice from TrackMyOPT: New OPT tools"
preview = f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Monday update · TrackMyOPT</title>
<style>
*{{box-sizing:border-box}}body{{margin:0;background:#e7edf6;color:#172d4e;font-family:Arial,Helvetica,sans-serif}}
.toolbar{{padding:22px 28px;background:#fdfefe;border-bottom:1px solid #d3dfed;display:flex;align-items:center;gap:24px;flex-wrap:wrap}}
.identity{{display:flex;align-items:center;gap:12px;margin-right:auto}}.identity img{{width:32px;height:32px}}
.identity strong{{font-size:16px}}.identity small{{display:block;color:#526781;font-size:12px;margin-top:4px}}
.badge{{padding:7px 11px;border-radius:20px;background:#fff0d3;color:#74511a;font-size:12px;font-weight:700}}
.controls{{display:flex;gap:6px}}button,.file{{border:1px solid #cad7e8;background:#fdfefe;color:#294d86;padding:10px 13px;border-radius:7px;cursor:pointer;font:600 13px Arial;text-decoration:none}}
button[aria-pressed=true]{{background:#184fc4;color:#f7faff;border-color:#184fc4}}button:focus-visible,a:focus-visible{{outline:3px solid #3a73e5;outline-offset:3px}}
.envelope{{max-width:880px;margin:28px auto 16px;padding:0 24px}}.envelope p{{font-size:13px;line-height:22px;color:#526781;margin:6px 0}}
.envelope h1{{font-size:22px;line-height:30px;letter-spacing:-.5px;margin:10px 0}}.notice{{padding:14px 18px;background:#f5f8fc;border:1px solid #d3dfed;border-radius:8px}}
.stage{{margin:0 auto 40px;max-width:100%;transition:width .25s ease-out;width:680px}}iframe{{display:block;width:100%;height:2400px;border:0;background:#edf2f8}}
@media(prefers-reduced-motion:reduce){{.stage{{transition:none}}}}@media(max-width:600px){{.toolbar{{padding:16px;gap:14px}}.envelope{{padding:0 16px;margin-top:20px}}.envelope h1{{font-size:20px}}}}
</style></head><body>
<header class="toolbar"><div class="identity"><img src="assets/logo.png" alt=""><div><strong>TrackMyOPT / Product update</strong><small>Monday, September 28, 2026</small></div></div>
<span class="badge">Draft · not sent</span><div class="controls" aria-label="Preview width"><button type="button" id="desktop" aria-pressed="true">Desktop</button><button type="button" id="mobile" aria-pressed="false">Mobile</button></div><a class="file" href="email.txt">Plain text ↗</a></header>
<main><section class="envelope" aria-label="Email details"><p><strong>From</strong> TrackMyOPT &lt;support@trackmyopt.com&gt; &nbsp; / &nbsp; <strong>To</strong> Eligible product-update subscribers</p>
<h1>{html.escape(subject)}</h1><p>A major Chrome extension update, clearer OPT dates and case tracking, new networking tools, and more.</p>
<p class="notice">Review preview. The animation plays once; its first frame works as a still. Before sending, host the images and insert your email provider’s unsubscribe URL and verified postal address. No send is scheduled.</p></section>
<div class="stage" id="stage"><iframe id="email" title="TrackMyOPT product update email" src="preview-email.html"></iframe></div></main>
<script>
const stage=document.getElementById('stage'), frame=document.getElementById('email');
function fit(){{frame.style.height=frame.contentDocument.documentElement.scrollHeight+'px'}}
frame.addEventListener('load',()=>{{fit();new ResizeObserver(fit).observe(frame.contentDocument.body)}});
for(const [id,width] of [['desktop',680],['mobile',375]])document.getElementById(id).onclick=()=>{{stage.style.width=width+'px';for(const name of ['desktop','mobile'])document.getElementById(name).setAttribute('aria-pressed',String(name===id));}};
</script></body></html>'''
(ROOT / "preview.html").write_text(preview)
print(f"Built preview: {ROOT / 'preview.html'}")
print(f"Animated illustration: {(ASSETS / 'next-steps.gif').stat().st_size:,} bytes")
