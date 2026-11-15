#!/usr/bin/env python3
"""Render a dignity.js LinkedIn release banner (1584×396 PNG)."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LOGO = ROOT / "docs" / "assets" / "dignity-logo.png"
WIDTH, HEIGHT = 1584, 396
BG = (250, 246, 238)
INK = (26, 26, 26)
MUTED = (90, 86, 82)
ACCENT = (37, 99, 235)
FRAME = (72, 48, WIDTH - 72, HEIGHT - 48)
FRAME_RADIUS = 26
FRAME_OUTLINE_W = 3
INSET = 22
LINE_GAP = 4
META_GAP = 2
HIGHLIGHT_GAP = 5
CONTENT_PAD = 3
MIN_READABLE = 28
MIN_SUBTITLE = 29
BASE_HIGHLIGHT = 42
MIN_HIGHLIGHT = 38
HIGHLIGHT_MAX_LINES = 2
BASE_VERSION = 60
VERSION_GAP_AFTER = 6
LOGO_MAX_H = 108
TEXT_LOGO_GAP = 32


@dataclass(frozen=True)
class TextLine:
    text: str
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont
    fill: tuple[int, int, int]
    gap_after: int = LINE_GAP


def _load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = (
        [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
        ]
        if bold
        else [
            "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
            "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
        ]
    )
    for path in candidates:
        if Path(path).is_file():
            return ImageFont.truetype(path, size=size)
    return ImageFont.load_default()


def _text_width(
    draw: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont | ImageFont.ImageFont
) -> int:
    if not text:
        return 0
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0]


def _wrap_on_spaces(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    max_width: int,
) -> list[str]:
    words = text.split()
    if not words:
        return []
    lines: list[str] = []
    current = words[0]
    for word in words[1:]:
        trial = f"{current} {word}"
        if _text_width(draw, trial, font) <= max_width:
            current = trial
        else:
            lines.append(current)
            current = word
    lines.append(current)
    return lines


def _wrap_highlight(
    draw: ImageDraw.ImageDraw,
    text: str,
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont,
    max_width: int,
    max_lines: int = HIGHLIGHT_MAX_LINES,
) -> list[str]:
    lines = _wrap_on_spaces(draw, text, font, max_width)
    if len(lines) <= max_lines:
        return lines
    words = text.split()
    if len(words) < 2:
        return lines[:max_lines]
    best: list[str] | None = None
    for split in range(1, len(words)):
        first = " ".join(words[:split])
        second = " ".join(words[split:])
        if _text_width(draw, first, font) <= max_width and _text_width(draw, second, font) <= max_width:
            best = [first, second]
            break
    return best if best else lines[:max_lines]


def _layout_positions(
    draw: ImageDraw.ImageDraw,
    lines: list[TextLine],
    text_x: int,
    start_y: int,
) -> tuple[list[tuple[TextLine, int]], int, int]:
    y = start_y
    top = start_y
    bottom = start_y
    placed: list[tuple[TextLine, int]] = []
    for line in lines:
        if not line.text:
            continue
        box = draw.textbbox((text_x, y), line.text, font=line.font)
        top = min(top, box[1])
        bottom = max(bottom, box[3])
        placed.append((line, y))
        y = box[3] + line.gap_after
    return placed, top, bottom


def _rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    outline: tuple[int, int, int],
    width: int,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, outline=outline, width=width)


def _build_lines(
    draw: ImageDraw.ImageDraw,
    *,
    version: str,
    title: str,
    date: str,
    highlights: list[str],
    packages: list[str],
    install_line: str,
    max_width: int,
    head_scale: float,
    highlight_px: int,
) -> list[TextLine]:
    version_font = _load_font(max(40, int(BASE_VERSION * head_scale)), bold=True)
    title_font = _load_font(MIN_SUBTITLE, bold=True)
    highlight_font = _load_font(highlight_px, bold=True)
    readable_font = _load_font(MIN_READABLE)
    meta_font = _load_font(MIN_READABLE)

    lines: list[TextLine] = []
    version_label = version if version.startswith("v") else f"v{version}"
    lines.append(TextLine(version_label, version_font, INK, gap_after=VERSION_GAP_AFTER))

    if title:
        lines.append(TextLine(title, title_font, INK))

    if date:
        lines.append(TextLine(date, readable_font, MUTED, gap_after=META_GAP))

    for highlight in highlights:
        segments = _wrap_highlight(draw, highlight, highlight_font, max_width)
        for i, segment in enumerate(segments):
            gap = HIGHLIGHT_GAP if i < len(segments) - 1 else LINE_GAP
            lines.append(TextLine(segment, highlight_font, INK, gap_after=gap))

    for pkg in packages:
        lines.append(TextLine(pkg, readable_font, ACCENT, gap_after=META_GAP))

    if install_line:
        lines.append(TextLine(install_line, meta_font, MUTED, gap_after=0))

    return lines


def _fits(
    draw: ImageDraw.ImageDraw,
    lines: list[TextLine],
    text_x: int,
    start_y: int,
    inner_top: int,
    inner_bottom: int,
    max_width: int,
) -> bool:
    if any(_text_width(draw, ln.text, ln.font) > max_width for ln in lines if ln.text):
        return False
    _, top, bottom = _layout_positions(draw, lines, text_x, start_y)
    return top >= inner_top and bottom <= inner_bottom - CONTENT_PAD


def _layout_logo_and_text_x(logo_path: Path, inner_top: int, inner_bottom: int) -> tuple[Image.Image, int, int, int, int]:
    logo = Image.open(logo_path).convert("RGBA")
    logo_h = min(LOGO_MAX_H, inner_bottom - inner_top)
    logo_w = int(logo.width * (logo_h / logo.height))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_x = FRAME[0] + INSET
    logo_y = (HEIGHT - logo_h) // 2
    logo_cy = logo_y + logo_h // 2
    text_x = logo_x + logo_w + TEXT_LOGO_GAP
    text_right = FRAME[2] - INSET
    max_text_w = text_right - text_x
    return logo, logo_x, logo_y, logo_cy, max_text_w


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

    _rounded_rect(draw, FRAME, radius=FRAME_RADIUS, outline=INK, width=FRAME_OUTLINE_W)

    inner_top = FRAME[1] + FRAME_OUTLINE_W + INSET
    inner_bottom = FRAME[3] - FRAME_OUTLINE_W - INSET

    logo, logo_x, logo_y, logo_cy, max_text_w = _layout_logo_and_text_x(
        logo_path, inner_top, inner_bottom
    )
    canvas.paste(logo, (logo_x, logo_y), logo)

    head_scale = 1.0
    highlight_px = BASE_HIGHLIGHT
    lines: list[TextLine] = []
    start_y = inner_top

    for _ in range(28):
        lines = _build_lines(
            draw,
            version=version,
            title=title,
            date=date,
            highlights=highlights,
            packages=packages,
            install_line=install_line,
            max_width=max_text_w,
            head_scale=head_scale,
            highlight_px=highlight_px,
        )
        _, top_at_zero, bottom_at_zero = _layout_positions(draw, lines, logo_x + logo.width + TEXT_LOGO_GAP, 0)
        block_h = bottom_at_zero - top_at_zero
        start_y = logo_cy - block_h // 2
        text_x = logo_x + logo.width + TEXT_LOGO_GAP
        if _fits(draw, lines, text_x, start_y, inner_top, inner_bottom, max_text_w):
            break
        if highlight_px > MIN_HIGHLIGHT:
            highlight_px -= 1
            continue
        if head_scale > 0.88:
            head_scale *= 0.97
            continue
        start_y = max(
            inner_top,
            inner_bottom - block_h - CONTENT_PAD,
        )
        break

    text_x = logo_x + logo.width + TEXT_LOGO_GAP
    placed, _, _ = _layout_positions(draw, lines, text_x, start_y)
    for line, y in placed:
        draw.text((text_x, y), line.text, font=line.font, fill=line.fill)

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