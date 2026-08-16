#!/usr/bin/env python3
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import os

SIZE = 512
OUT = Path(os.environ.get("BALI_ADMIN_ICON", "admin/icon.ico"))
OUT.parent.mkdir(parents=True, exist_ok=True)

im = Image.new("RGBA", (SIZE, SIZE), (11, 11, 13, 255))
d = ImageDraw.Draw(im)
d.rounded_rectangle((42, 42, 470, 470), 88, fill=(21, 21, 25, 255), outline=(75, 41, 52, 255), width=8)
d.ellipse((112, 94, 400, 382), fill=(112, 31, 57, 255))
d.ellipse((142, 124, 370, 352), outline=(205, 143, 160, 210), width=4)

def font(size: int, bold: bool = False):
    candidates = []
    if os.name == "nt":
        candidates += [
            f"C:/Windows/Fonts/{'arialbd' if bold else 'arial'}.ttf",
            f"C:/Windows/Fonts/{'segoeuib' if bold else 'segoeui'}.ttf",
        ]
    candidates += [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation2/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation2/LiberationSans-Regular.ttf",
    ]
    for candidate in candidates:
        if Path(candidate).is_file():
            return ImageFont.truetype(candidate, size)
    return ImageFont.load_default()

def centered(text: str, y: int, fnt, fill):
    box = d.textbbox((0, 0), text, font=fnt)
    width = box[2] - box[0]
    d.text(((SIZE - width) / 2, y), text, font=fnt, fill=fill)

centered("BALI", 186, font(72, True), (255, 255, 255, 255))
centered("COCKTAIL", 274, font(29, True), (255, 255, 255, 255))
centered("ADMIN", 407, font(18, False), (203, 143, 160, 255))

im.save(
    OUT,
    format="ICO",
    sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
)
if not OUT.is_file() or OUT.stat().st_size <= 100:
    raise SystemExit("BALI ADMIN icon generation failed")
print(f"Generated {OUT} ({OUT.stat().st_size} bytes)")
