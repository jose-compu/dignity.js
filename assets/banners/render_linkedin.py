#!/usr/bin/env python3
"""Render a dignity.js LinkedIn release banner (1584×396 PNG)."""

from __future__ import annotations

import argparse
import textwrap
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LOGO = ROOT / "docs" / "assets" / "dignity-logo.png"
WIDTH, HEIGHT = 1584, 396
BG = (250, 246, 238)
INK = (26, 26, 26)
MUTED = (90, 86, 82)
ACCENT = (37, 99, 235)


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = []
    if bold:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
            ]
        )
    else:
        candidates.extend(
            [
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
                "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
            ]
        )
    for path in candidates:
        if Path(path).is_file():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def _rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    outline: tuple[int, int, int],
    width: int,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, outline=outline, width=width)


def render_banner(
    *,
    output: Path,
    logo_path: Path,
    version: str,
    title: str,
    date: str,
    highlights: list[str],
    packages: list[str],
    install_line: str,
) -> None:
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), BG + (255,))
    draw = ImageDraw.Draw(canvas)

    frame = (72, 48, WIDTH - 72, HEIGHT - 48)
    _rounded_rect(draw, frame, radius=26, outline=INK, width=3)

    logo = Image.open(logo_path).convert("RGBA")
    logo_h = 132
    logo_w = int(logo.width * (logo_h / logo.height))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_x = frame[0] + 44
    logo_y = (HEIGHT - logo_h) // 2
    canvas.paste(logo, (logo_x, logo_y), logo)

    text_x = logo_x + logo_w + 56
    text_right = frame[2] - 44
    max_text_w = text_right - text_x

    version_font = _load_font(62, bold=True)
    title_font = _load_font(24, bold=True)
    body_font = _load_font(20)
    small_font = _load_font(17)

    y = logo_y + 8
    version_label = version if version.startswith("v") else f"v{version}"
    draw.text((text_x, y), version_label, font=version_font, fill=INK)
    y += 70

    if title:
        draw.text((text_x, y), title, font=title_font, fill=INK)
        y += 34

    if date:
        draw.text((text_x, y), date, font=small_font, fill=MUTED)
        y += 28

    for line in highlights:
        wrapped = textwrap.wrap(line, width=52)
        for segment in wrapped:
            draw.text((text_x, y), segment, font=body_font, fill=INK)
            y += 26
        y += 4

    for pkg in packages:
        draw.text((text_x, y), pkg, font=body_font, fill=ACCENT)
        y += 28

    if install_line:
        draw.text((text_x, y), install_line, font=small_font, fill=MUTED)

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, format="PNG", optimize=True)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--version", required=True, help='e.g. "1.1.3" or "v1.1.3"')
    parser.add_argument("--title", default="")
    parser.add_argument("--date", default="")
    parser.add_argument(
        "--highlight",
        action="append",
        default=[],
        dest="highlights",
        help="Release highlight (repeatable)",
    )
    parser.add_argument(
        "--package",
        action="append",
        default=[],
        dest="packages",
        help="Package line (repeatable)",
    )
    parser.add_argument("--install", default="", help="Install command line")
    args = parser.parse_args()

    render_banner(
        output=args.output,
        logo_path=args.logo,
        version=args.version,
        title=args.title,
        date=args.date,
        highlights=args.highlights,
        packages=args.packages,
        install_line=args.install,
    )


if __name__ == "__main__":
    main()