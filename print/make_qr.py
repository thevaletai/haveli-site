"""Make printable QR codes for the Haveli menu.
Run: PYTHONPATH=<folder with segno> python3 print/make_qr.py"""
import io, segno
from PIL import Image, ImageDraw, ImageFont

URL = "https://thevaletai.github.io/haveli-site/menu.html"
DPI = 300
GOLD, GOLD_HI, INK = (217, 169, 79), (247, 224, 140), (11, 9, 7)
COPPER = "/System/Library/Fonts/Supplemental/Copperplate.ttc"
AVENIR = "/System/Library/Fonts/Avenir Next.ttc"

def qr_image(px):
    # high error correction so a smudge or fold still scans
    q = segno.make(URL, error="h")
    buf = io.BytesIO(); q.save(buf, kind="png", scale=40, border=4, dark="#000000", light="#ffffff")
    return Image.open(buf).convert("RGB").resize((px, px), Image.NEAREST)

def centered(d, y, text, font, fill, w):
    tw = d.textlength(text, font=font); d.text(((w - tw) / 2, y), text, font=font, fill=fill)

def card(w_in=4, h_in=6):
    W, H = int(w_in * DPI), int(h_in * DPI)
    im = Image.new("RGB", (W, H), INK); d = ImageDraw.Draw(im)
    m = int(.12 * DPI)
    d.rectangle([m, m, W - m, H - m], outline=GOLD, width=6)
    d.rectangle([m + 18, m + 18, W - m - 18, H - m - 18], outline=(120, 92, 40), width=2)
    logo = Image.open("assets/logo-hero.webp").convert("RGBA")
    lw = int(W * .72); logo = logo.resize((lw, round(logo.height * lw / logo.width)), Image.LANCZOS)
    im.paste(logo, ((W - lw) // 2, int(.38 * DPI)), logo)
    y = int(.38 * DPI) + logo.height + int(.16 * DPI)
    centered(d, y, "SCAN FOR OUR MENU", ImageFont.truetype(COPPER, 74, index=0), GOLD_HI, W)
    y += int(.36 * DPI)
    qs = int(W * .66); pad = int(.1 * DPI)
    d.rounded_rectangle([(W - qs) // 2 - pad, y - pad, (W + qs) // 2 + pad, y + qs + pad], radius=28, fill="white")
    im.paste(qr_image(qs), ((W - qs) // 2, y))
    y += qs + pad + int(.2 * DPI)
    centered(d, y, "Point your phone camera at the code", ImageFont.truetype(AVENIR, 40, index=0), (200, 188, 165), W)
    centered(d, H - m - int(.42 * DPI), "INDIAN ROOTS · CANADIAN HOME", ImageFont.truetype(COPPER, 40, index=0), GOLD, W)
    return im

c = card()
c.save("print/haveli-menu-qr-card-4x6.pdf", resolution=DPI)
c.save("print/haveli-menu-qr-card-4x6.png", dpi=(DPI, DPI))
# four cards on one letter sheet, with thin cut marks
sheet = Image.new("RGB", (int(8.5 * DPI), int(11 * DPI)), "white")
cw, ch = c.size; gx = (sheet.width - 2 * cw) // 3; gy = (sheet.height - 2 * ch) // 3
for r in range(2):
    for col in range(2):
        sheet.paste(c, (gx + col * (cw + gx), gy + r * (ch + gy)))
sheet.save("print/haveli-menu-qr-4-per-letter-page.pdf", resolution=DPI)
qr_image(2400).save("print/haveli-menu-qr-plain.png", dpi=(DPI, DPI))
print("done:", URL)
