#!/usr/bin/env python3
"""Render a dignity.js LinkedIn release banner (default 1584×792 PNG)."""

from __future__ import annotations

import argparse
from dataclasses import dataclass
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_LOGO = ROOT / "docs" / "assets" / "dignity-logo.png"
DEFAULT_WIDTH = 1584
DEFAULT_HEIGHT = 792
BG = (250, 246, 238)
INK = (26, 26, 26)
MUTED = (90, 86, 82)
ACCENT = (37, 99, 235)


@dataclass(frozen=True)
class CanvasLayout:
    width: int
    height: int
    frame: tuple[int, int, int, int]
    frame_radius: int
    frame_outline_w: int
    inset: int
    content_pad: int
    text_logo_gap: int
    logo_max_h: int


@dataclass(frozen=True)
class TextLine:
    text: str
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont
    fill: tuple[int, int, int]
    gap_after: int


def _canvas_layout(width: int, height: int) -> CanvasLayout:
    margin_x = max(72, width // 16)
    margin_y = max(72, height // 10)
    inset = max(40, height // 18)
    inner_h = height - 2 * margin_y
    return CanvasLayout(
        width=width,
        height=height,
        frame=(margin_x, margin_y, width - margin_x, height - margin_y),
        frame_radius=max(28, height // 22),
        frame_outline_w=3,
        inset=inset,
        content_pad=max(24, height // 28),
        text_logo_gap=max(40, width // 38),
        logo_max_h=min(int(inner_h * 0.45), 220),
    )


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
    group_gap: int,
) -> list[TextLine]:
    version_font = _load_font(96, bold=True)
    title_font = _load_font(40, bold=True)
    date_font = _load_font(32)
    highlight_font = _load_font(48, bold=True)
    meta_font = _load_font(34)

    lines: list[TextLine] = []
    version_label = version if version.startswith("v") else f"v{version}"
    lines.append(TextLine(version_label, version_font, INK, gap_after=10))

    if title:
        lines.append(TextLine(title, title_font, INK, gap_after=group_gap))

    if date:
        lines.append(TextLine(date, date_font, MUTED, gap_after=group_gap))

    for hi, highlight in enumerate(highlights):
        segments = _wrap_on_spaces(draw, highlight, highlight_font, max_width)
        for i, segment in enumerate(segments):
            if i < len(segments) - 1:
                gap = 16
            elif hi < len(highlights) - 1:
                gap = 16
            else:
                gap = group_gap
            lines.append(TextLine(segment, highlight_font, INK, gap_after=gap))

    for pkg in packages:
        gap = 8 if install_line else 0
        lines.append(TextLine(pkg, meta_font, ACCENT, gap_after=gap))

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
    content_pad: int,
) -> bool:
    if any(_text_width(draw, ln.text, ln.font) > max_width for ln in lines if ln.text):
        return False
    _, top, bottom = _layout_positions(draw, lines, text_x, start_y)
    return top >= inner_top and bottom <= inner_bottom - content_pad


def _layout_logo(
    layout: CanvasLayout,
    logo_path: Path,
    inner_top: int,
    inner_bottom: int,
) -> tuple[Image.Image, int, int, int, int]:
    logo = Image.open(logo_path).convert("RGBA")
    inner_w = layout.frame[2] - layout.frame[0] - 2 * layout.inset
    max_logo_w = int(inner_w * 0.38)
    logo_h = min(layout.logo_max_h, inner_bottom - inner_top)
    logo_w = int(logo.width * (logo_h / logo.height))
    if logo_w > max_logo_w:
        logo_w = max_logo_w
        logo_h = int(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_x = layout.frame[0] + layout.inset
    logo_y = (layout.height - logo_h) // 2
    logo_cy = logo_y + logo_h // 2
    text_x = logo_x + logo_w + layout.text_logo_gap
    text_right = layout.frame[2] - layout.inset
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
    width: int = DEFAULT_WIDTH,
    height: int = DEFAULT_HEIGHT,
) -> None:
    layout = _canvas_layout(width, height)
    group_gap = 32 if height >= 600 else 24
    canvas = Image.new("RGBA", (layout.width, layout.height), BG + (255,))
    draw = ImageDraw.Draw(canvas)

    _rounded_rect(
        draw,
        layout.frame,
        radius=layout.frame_radius,
        outline=INK,
        width=layout.frame_outline_w,
    )

    inner_top = layout.frame[1] + layout.frame_outline_w + layout.inset
    inner_bottom = layout.frame[3] - layout.frame_outline_w - layout.inset

    logo, logo_x, logo_y, logo_cy, max_text_w = _layout_logo(layout, logo_path, inner_top, inner_bottom)
    canvas.paste(logo, (logo_x, logo_y), logo)

    text_x = logo_x + logo.width + layout.text_logo_gap
    lines = _build_lines(
        draw,
        version=version,
        title=title,
        date=date,
        highlights=highlights,
        packages=packages,
        install_line=install_line,
        max_width=max_text_w,
        group_gap=group_gap,
    )
    _, top_at_zero, bottom_at_zero = _layout_positions(draw, lines, text_x, 0)
    block_h = bottom_at_zero - top_at_zero
    max_start = inner_bottom - layout.content_pad - block_h
    start_y = max(inner_top, min(logo_cy - block_h // 2, max_start))

    placed, _, _ = _layout_positions(draw, lines, text_x, start_y)
    for line, y in placed:
        draw.text((text_x, y), line.text, font=line.font, fill=line.fill)

    output.parent.mkdir(parents=True, exist_ok=True)
    canvas.convert("RGB").save(output, format="PNG", optimize=True)


def _parse_size(value: str) -> tuple[int, int]:
    cleaned = value.lower().replace("×", "x")
    if "x" not in cleaned:
        raise argparse.ArgumentTypeError('size must look like "1584x792"')
    w_s, h_s = cleaned.split("x", 1)
    return int(w_s), int(h_s)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, required=True)
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument(
        "--size",
        type=_parse_size,
        default=None,
        help='Canvas size as "1584x792" (overrides --width/--height)',
    )
    parser.add_argument("--version", required=True, help='e.g. "1.1.4" or "v1.1.4"')
    parser.add_argument("--title", default="")
    parser.add_argument("--date", default="")
    parser.add_argument(
        "--highlight",
        action="append",
        default=[],
        dest="highlights",
        help="Release highlight (repeatable; one item per line)",
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

    width = args.width
    height = args.height
    if args.size:
        width, height = args.size

    render_banner(
        output=args.output,
        logo_path=args.logo,
        version=args.version,
        title=args.title,
        date=args.date,
        highlights=args.highlights,
        packages=args.packages,
        install_line=args.install,
        width=width,
        height=height,
    )


if __name__ == "__main__":
    main()