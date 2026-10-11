"""Draw original educational GIF frames, independent of the generated cover.

Run from the repository root with Python 3 and Pillow installed.
No student data, API access or external services are used.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

OUTPUT = Path(__file__).resolve().parents[2] / 'apps/web/public/blog/fbar-2026'
FONT_PATHS = [
    Path('/System/Library/Fonts/Supplemental/Arial.ttf'),
    Path('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'),
]
font_path = next((path for path in FONT_PATHS if path.exists()), None)
if font_path is None:
    raise RuntimeError('Install Arial or DejaVu Sans before generating the GIF.')

INK, BLUE, MUTED = '#172554', '#1d4ed8', '#475569'
PAPER, MINT, AMBER, LINE = '#f8fafc', '#ccfbf1', '#fef3c7', '#cbd5e1'


def font(size):
    return ImageFont.truetype(str(font_path), size)


def text(draw, position, content, size=24, color=INK):
    draw.text(position, content, font=font(size), fill=color)


def frame(step):
    canvas = Image.new('RGB', (960, 720), PAPER)
    draw = ImageDraw.Draw(canvas)
    text(draw, (42, 28), 'TrackMyOPT  /  Fictional student walkthrough', 23, BLUE)
    text(draw, (42, 78), 'Same F-1 status. Different calendar years.', 36)
    text(draw, (42, 133), 'Residency first. Foreign accounts second.', 25, MUTED)
    text(draw, (42, 192), 'ARJUN  |  India  |  First arrival: August 2023', 26)

    for index, year in enumerate(range(2023, 2029)):
        x = 42 + index * 149
        active = index <= step if step < 6 else True
        fill = (MINT if index < 5 else AMBER) if active else '#e2e8f0'
        draw.rounded_rectangle((x, 238, x + 132, 362), radius=14, fill=fill, outline=LINE, width=2)
        text(draw, (x + 16, 254), str(year), 31, BLUE)
        text(draw, (x + 20, 308), 'Year ' + str(index + 1), 19)
        if step == index:
            draw.rounded_rectangle((x, 238, x + 132, 362), radius=14, outline=BLUE, width=4)

    messages = [
        ('2023 counts as year one.', 'A partial qualifying calendar year still counts.'),
        ('2024 is year two.', 'Keep track of all earlier exempt-individual years.'),
        ('2025: OPT, still F-1.', 'Starting authorized OPT does not restart the count.'),
        ('2026: STEM OPT, still F-1.', '$18,000 abroad: generally no FBAR while nonresident.'),
        ('2027 is the fifth qualifying year.', 'Eligible student days are generally excluded.'),
        ('2028: reassess residency.', 'Count days unless a valid exception applies. No automatic FBAR.'),
        ('COMPARE PRIYA: first arrival in 2020.', 'Her first five qualifying years were 2020 through 2024.'),
        ('PRIYA: residency review begins in 2025.', '$25,000 abroad: FBAR if U.S. person + threshold met.'),
    ]
    headline, explanation = messages[step]
    draw.rounded_rectangle((42, 390, 918, 505), radius=14, fill=AMBER if step >= 5 else MINT)
    text(draw, (62, 409), headline, 30)
    text(draw, (62, 455), explanation, 22)
    text(draw, (42, 552), '1  Determine U.S.-person status for FBAR.', 26)
    text(draw, (42, 598), '2  Check reportable foreign accounts and the $10,000 aggregate threshold.', 22)
    text(draw, (42, 654), 'Assumptions apply. See the full guide for exceptions, elections and dates.', 19, MUTED)
    return canvas


OUTPUT.mkdir(parents=True, exist_ok=True)
frames = [frame(step) for step in range(8)]
frames[-1].save(OUTPUT / 'student-example-static.png')
frames[0].save(OUTPUT / 'student-example.gif', save_all=True, append_images=frames[1:],
               duration=[2400, 2000, 2600, 3200, 2600, 4200, 3200, 4200], loop=0, optimize=True)
print('Created 8-frame GIF (24.4 seconds) and static reduced-motion alternative.')
