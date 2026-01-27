import os

universities = [
    {"file": "cmu", "text": "Carnegie Mellon", "color": "#C41230"},
    {"file": "gatech", "text": "Georgia Tech", "color": "#B3A369"},
    {"file": "usc", "text": "USC", "color": "#9D2235"},
    {"file": "nyu", "text": "NYU", "color": "#57068c"},
    {"file": "columbia", "text": "Columbia", "color": "#B9D9EB"},
    {"file": "mit", "text": "MIT", "color": "#A31F34"},
    {"file": "stanford", "text": "Stanford", "color": "#8C1515"},
    {"file": "berkeley", "text": "Berkeley", "color": "#003262"},
    {"file": "harvard", "text": "Harvard", "color": "#A51C30"},
    {"file": "cornell", "text": "Cornell", "color": "#B31B1B"},
    {"file": "uiuc", "text": "UIUC", "color": "#13294B"},
    {"file": "purdue", "text": "Purdue", "color": "#CEB888"},
    {"file": "utexas", "text": "UT Austin", "color": "#BF5700"},
    {"file": "northeastern", "text": "Northeastern", "color": "#CC0000"},
    {"file": "bu", "text": "Boston Univ", "color": "#CC0000"},
    {"file": "tamu", "text": "Texas A&M", "color": "#500000"},
    {"file": "asu", "text": "ASU", "color": "#8C1D40"},
    {"file": "uw", "text": "Washington", "color": "#4B2E83"},
    {"file": "ucla", "text": "UCLA", "color": "#2D68C4"},
    {"file": "umich", "text": "Michigan", "color": "#00274C"},
]

output_dir = "apps/web/public/unis"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

for uni in universities:
    svg_content = f'''<svg width="200" height="100" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg">
  <style>
    .text {{ font-family: serif; font-weight: bold; font-size: 24px; fill: {uni['color']}; }}
  </style>
  <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" class="text">{uni['text']}</text>
</svg>'''
    
    with open(f"{output_dir}/{uni['file']}.svg", "w") as f:
        f.write(svg_content)
    print(f"Generated {uni['file']}.svg")
