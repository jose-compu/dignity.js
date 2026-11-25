#!/usr/bin/env python3
"""Render a dignity.js LinkedIn release banner (default 1584×792 PNG)."""

from __future__ import annotations

import argparse
import sys
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
BULLET_COLORS = (
    ACCENT,
    (234, 179, 8),
    (34, 197, 94),
)

MIN_INNER_MARGIN_Y = 36
HIGHLIGHT_LINE_GAP = 8
HIGHLIGHT_BLOCK_GAP = 28
BULLET_SIZE = 16
BULLET_TEXT_GAP = 12
TAGLINE_SIZE = 38
TAGLINE_GAP = 36
TAGLINE_LINE_GAP = 10
FONT_SCALE_STEP = 0.02
REF_CANVAS_HEIGHT = 792
REF_HIGHLIGHT_SIZE = 54
MIN_HIGHLIGHT_AT_REF = 30


class HighlightsTooLongError(RuntimeError):
    """Raised when highlight copy cannot fit at the minimum readable highlight size."""


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

    @property
    def inner_top(self) -> int:
        return self.frame[1] + self.frame_outline_w + self.inset

    @property
    def inner_bottom(self) -> int:
        return self.frame[3] - self.frame_outline_w - self.inset

    @property
    def inner_left(self) -> int:
        return self.frame[0] + self.inset

    @property
    def inner_right(self) -> int:
        return self.frame[2] - self.inset

    @property
    def inner_h(self) -> int:
        return self.inner_bottom - self.inner_top


@dataclass(frozen=True)
class TextRun:
    text: str
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont
    fill: tuple[int, int, int]
    x: int
    y: int


@dataclass(frozen=True)
class BulletRun:
    color: tuple[int, int, int]
    x: int
    y: int
    size: int


@dataclass(frozen=True)
class FontScale:
    version: int
    title: int
    date: int
    highlight: int
    meta: int
    group_gap: int
    title_tight: int


@dataclass(frozen=True)
class TaglineRun:
    text: str
    font: ImageFont.FreeTypeFont | ImageFont.ImageFont
    x: int
    y: int


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
        logo_max_h=min(int(inner_h * 0.52), 280),
    )


def _min_highlight_size(canvas_height: int) -> int:
    return max(1, int(round(MIN_HIGHLIGHT_AT_REF * canvas_height / REF_CANVAS_HEIGHT)))


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


def _line_height(
    draw: ImageDraw.ImageDraw, font: ImageFont.FreeTypeFont | ImageFont.ImageFont
) -> int:
    box = draw.textbbox((0, 0), "Ag", font=font)
    return box[3] - box[1]


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


def _font_scale_for(inner_h: int, scale: float) -> FontScale:
    return FontScale(
        version=max(1, int(106 * scale)),
        title=max(1, int(46 * scale)),
        date=max(1, int(36 * scale)),
        highlight=max(1, int(REF_HIGHLIGHT_SIZE * scale)),
        meta=max(1, int(38 * scale)),
        group_gap=max(20, int(32 * scale)),
        title_tight=max(6, int(10 * scale)),
    )


def _font_scale_with_highlight(inner_h: int, scale: float, highlight_size: int) -> FontScale:
    base = _font_scale_for(inner_h, scale)
    if base.highlight == highlight_size:
        return base
    coeffs = highlight_size / max(1, base.highlight)
    return FontScale(
        version=max(1, int(base.version * coeffs)),
        title=max(1, int(base.title * coeffs)),
        date=max(1, int(base.date * coeffs)),
        highlight=highlight_size,
        meta=max(1, int(base.meta * coeffs)),
        group_gap=max(14, int(base.group_gap * coeffs)),
        title_tight=max(4, int(base.title_tight * coeffs)),
    )


def _bullet_indent() -> int:
    return BULLET_SIZE + BULLET_TEXT_GAP


@dataclass
class MeasuredBlock:
    text_runs: list[TextRun]
    bullets: list[BulletRun]
    height: int
    top_offset: int


def _measure_content(
    draw: ImageDraw.ImageDraw,
    *,
    text_x: int,
    max_text_w: int,
    version: str,
    title: str,
    date: str,
    highlights: list[str],
    packages: list[str],
    install_line: str,
    fonts: FontScale,
) -> MeasuredBlock:
    version_font = _load_font(fonts.version, bold=True)
    title_font = _load_font(fonts.title, bold=True)
    date_font = _load_font(fonts.date)
    highlight_font = _load_font(fonts.highlight, bold=True)
    meta_font = _load_font(fonts.meta)

    text_runs: list[TextRun] = []
    bullets: list[BulletRun] = []
    y = 0
    content_top: int | None = None
    content_bottom = 0

    def place_text(text: str, font, fill: tuple[int, int, int], gap_after: int) -> None:
        nonlocal y, content_top, content_bottom
        box = draw.textbbox((text_x, y), text, font=font)
        if content_top is None:
            content_top = box[1]
        top_offset = content_top
        text_runs.append(TextRun(text, font, fill, text_x, y - top_offset))
        content_bottom = max(content_bottom, box[3])
        y = box[3] + gap_after

    version_label = version if version.startswith("v") else f"v{version}"
    place_text(version_label, version_font, INK, fonts.title_tight)

    if title:
        place_text(title, title_font, INK, fonts.group_gap)

    if date:
        place_text(date, date_font, MUTED, fonts.group_gap)

    highlight_indent = _bullet_indent()
    highlight_text_w = max(1, max_text_w - highlight_indent)
    hl_line_h = _line_height(draw, highlight_font)

    for hi, highlight in enumerate(highlights):
        segments = _wrap_on_spaces(draw, highlight, highlight_font, highlight_text_w)
        bullet_color = BULLET_COLORS[hi % len(BULLET_COLORS)]
        for i, segment in enumerate(segments):
            line_x = text_x + highlight_indent
            line_y = y
            box = draw.textbbox((line_x, line_y), segment, font=highlight_font)
            if content_top is None:
                content_top = box[1]
            top_offset = content_top
            rel_y = line_y - top_offset
            if i == 0:
                bullet_y = rel_y + (hl_line_h - BULLET_SIZE) // 2
                bullets.append(BulletRun(bullet_color, text_x, bullet_y, BULLET_SIZE))
            text_runs.append(TextRun(segment, highlight_font, INK, line_x, rel_y))
            content_bottom = max(content_bottom, box[3])
            gap = HIGHLIGHT_LINE_GAP if i < len(segments) - 1 else 0
            y = box[3] + gap
        if hi < len(highlights) - 1:
            y += HIGHLIGHT_BLOCK_GAP
            content_bottom = max(content_bottom, y)
        else:
            y += fonts.group_gap
            content_bottom = max(content_bottom, y)

    for pkg in packages:
        gap = 8 if install_line else 0
        place_text(pkg, meta_font, ACCENT, gap)

    if install_line:
        place_text(install_line, meta_font, MUTED, 0)

    if content_top is None:
        content_top = 0
    block_height = content_bottom - content_top
    return MeasuredBlock(text_runs, bullets, block_height, content_top)


def _block_fits_in_column(
    draw: ImageDraw.ImageDraw,
    block: MeasuredBlock,
    *,
    start_y: int,
    inner_top: int,
    inner_bottom: int,
    inner_right: int,
) -> bool:
    vertical_lo = inner_top
    vertical_hi = inner_bottom
    if start_y < vertical_lo or start_y + block.height > vertical_hi:
        return False
    for run in block.text_runs:
        box = draw.textbbox((run.x, start_y + run.y), run.text, font=run.font)
        if box[1] < vertical_lo or box[3] > vertical_hi:
            return False
        if box[2] > inner_right:
            return False
    for bullet in block.bullets:
        by0 = start_y + bullet.y
        by1 = by0 + bullet.size
        if by0 < vertical_lo or by1 > vertical_hi:
            return False
        if bullet.x + bullet.size > inner_right:
            return False
    return True


def _block_fits_horizontally(
    draw: ImageDraw.ImageDraw,
    block: MeasuredBlock,
    *,
    max_text_w: int,
    text_x: int,
) -> bool:
    for run in block.text_runs:
        w = _text_width(draw, run.text, run.font)
        if run.x < text_x:
            return False
        if run.x + w > text_x + max_text_w:
            return False
    return True


def _rounded_rect(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int, int, int],
    radius: int,
    outline: tuple[int, int, int],
    width: int,
) -> None:
    draw.rounded_rectangle(xy, radius=radius, outline=outline, width=width)


def _layout_logo(
    layout: CanvasLayout,
    logo_path: Path,
    inner_top: int,
    inner_bottom: int,
    block_cy: int,
) -> tuple[Image.Image, int, int, int]:
    logo = Image.open(logo_path).convert("RGBA")
    inner_w = layout.frame[2] - layout.frame[0] - 2 * layout.inset
    max_logo_w = int(inner_w * 0.44)
    inner_h = inner_bottom - inner_top
    logo_h = min(layout.logo_max_h, inner_h - 2 * MIN_INNER_MARGIN_Y)
    logo_w = int(logo.width * (logo_h / logo.height))
    if logo_w > max_logo_w:
        logo_w = max_logo_w
        logo_h = int(logo.height * (logo_w / logo.width))
    logo = logo.resize((logo_w, logo_h), Image.Resampling.LANCZOS)
    logo_x = layout.frame[0] + layout.inset
    logo_y = block_cy - logo_h // 2
    logo_y = max(inner_top + MIN_INNER_MARGIN_Y, min(logo_y, inner_bottom - MIN_INNER_MARGIN_Y - logo_h))
    text_x = logo_x + logo_w + layout.text_logo_gap
    text_right = layout.frame[2] - layout.inset
    max_text_w = text_right - text_x
    return logo, logo_x, logo_y, max_text_w


def _pick_font_scale(
    draw: ImageDraw.ImageDraw,
    layout: CanvasLayout,
    *,
    text_x: int,
    max_text_w: int,
    version: str,
    title: str,
    date: str,
    highlights: list[str],
    packages: list[str],
    install_line: str,
) -> tuple[FontScale, MeasuredBlock, int]:
    inner_h = layout.inner_h
    inner_top = layout.inner_top
    inner_bottom = layout.inner_bottom
    inner_right = layout.inner_right
    min_highlight = _min_highlight_size(layout.height)
    max_block_h = inner_h - 2 * MIN_INNER_MARGIN_Y

    scale_min = min_highlight / REF_HIGHLIGHT_SIZE
    scale = 1.0
    while True:
        effective = max(scale, scale_min)
        fonts = _font_scale_for(inner_h, effective)
        if fonts.highlight < min_highlight:
            fonts = _font_scale_with_highlight(inner_h, effective, min_highlight)
        block = _measure_content(
            draw,
            text_x=text_x,
            max_text_w=max_text_w,
            version=version,
            title=title,
            date=date,
            highlights=highlights,
            packages=packages,
            install_line=install_line,
            fonts=fonts,
        )
        at_min = fonts.highlight <= min_highlight
        if block.height > max_block_h:
            if at_min:
                raise HighlightsTooLongError(
                    "Release highlights are too long to fit inside the banner card at the minimum "
                    f"readable highlight size ({min_highlight}px for this canvas height)."
                )
            scale -= FONT_SCALE_STEP
            continue
        if not _block_fits_horizontally(draw, block, max_text_w=max_text_w, text_x=text_x):
            if at_min:
                raise HighlightsTooLongError(
                    "Release text is too wide to fit inside the banner card at the minimum "
                    f"readable highlight size ({min_highlight}px for this canvas height)."
                )
            scale -= FONT_SCALE_STEP
            continue
        start_y = inner_top + (inner_h - block.height) // 2
        if _block_fits_in_column(
            draw,
            block,
            start_y=start_y,
            inner_top=inner_top,
            inner_bottom=inner_bottom,
            inner_right=inner_right,
        ):
            return fonts, block, start_y
        if at_min:
            raise HighlightsTooLongError(
                "Release highlights are too long to fit inside the banner card at the minimum "
                f"readable highlight size ({min_highlight}px for this canvas height)."
            )
        if effective <= scale_min + 1e-9:
            raise HighlightsTooLongError(
                "Release highlights are too long to fit inside the banner card at the minimum "
                f"readable highlight size ({min_highlight}px for this canvas height)."
            )
        scale -= FONT_SCALE_STEP


def _pick_tagline_layout(
    draw: ImageDraw.ImageDraw,
    tagline: str,
    logo_x: int,
    logo_y: int,
    logo_w: int,
    logo_h: int,
    inner_top: int,
    inner_bottom: int,
) -> tuple[list[TaglineRun], int]:
    if not tagline:
        return [], logo_y

    size = TAGLINE_SIZE
    min_size = max(12, int(round(20 * (inner_bottom - inner_top) / REF_CANVAS_HEIGHT)))
    logo_y_out = logo_y
    runs: list[TaglineRun] = []

    while size >= min_size:
        font = _load_font(size)
        lines = _wrap_on_spaces(draw, tagline, font, logo_w)
        line_h = _line_height(draw, font)
        block_h = TAGLINE_GAP + len(lines) * line_h + max(0, len(lines) - 1) * TAGLINE_LINE_GAP
        group_h = logo_h + block_h
        proposed_logo_y = max(inner_top, inner_top + ((inner_bottom - inner_top) - group_h) // 2)
        if proposed_logo_y >= inner_top and proposed_logo_y + group_h <= inner_bottom:
            ty = proposed_logo_y + logo_h + TAGLINE_GAP
            runs = []
            for line in lines:
                lw = _text_width(draw, line, font)
                top = draw.textbbox((0, 0), line, font=font)[1]
                x = logo_x + (logo_w - lw) // 2
                runs.append(TaglineRun(line, font, x, ty - top))
                ty += line_h + TAGLINE_LINE_GAP
            for run in runs:
                box = draw.textbbox((run.x, run.y), run.text, font=run.font)
                if box[1] < inner_top or box[3] > inner_bottom:
                    runs = []
                    break
                if box[0] < logo_x or box[2] > logo_x + logo_w:
                    runs = []
                    break
            if runs:
                return runs, proposed_logo_y
        size -= 1

    font = _load_font(min_size)
    lines = _wrap_on_spaces(draw, tagline, font, logo_w)
    line_h = _line_height(draw, font)
    block_h = TAGLINE_GAP + len(lines) * line_h + max(0, len(lines) - 1) * TAGLINE_LINE_GAP
    group_h = logo_h + block_h
    logo_y_out = max(inner_top, inner_top + ((inner_bottom - inner_top) - group_h) // 2)
    ty = logo_y_out + logo_h + TAGLINE_GAP
    runs = []
    for line in lines:
        lw = _text_width(draw, line, font)
        top = draw.textbbox((0, 0), line, font=font)[1]
        x = logo_x + (logo_w - lw) // 2
        runs.append(TaglineRun(line, font, x, ty - top))
        ty += line_h + TAGLINE_LINE_GAP
    return runs, logo_y_out


def assert_banner_within_card(
    draw: ImageDraw.ImageDraw,
    layout: CanvasLayout,
    *,
    block: MeasuredBlock,
    start_y: int,
    tagline_runs: list[TaglineRun],
) -> None:
    if not _block_fits_in_column(
        draw,
        block,
        start_y=start_y,
        inner_top=layout.inner_top,
        inner_bottom=layout.inner_bottom,
        inner_right=layout.inner_right,
    ):
        raise AssertionError("Right-column text extends outside the card inner bounds.")
    for run in tagline_runs:
        box = draw.textbbox((run.x, run.y), run.text, font=run.font)
        if box[1] < layout.inner_top or box[3] > layout.inner_bottom:
            raise AssertionError("Tagline extends outside the card inner bounds.")
        if box[0] < layout.inner_left or box[2] > layout.inner_right:
            raise AssertionError("Tagline extends outside the card horizontal bounds.")


V170_BOUNDS_CHECK = {
    "width": DEFAULT_WIDTH,
    "height": DEFAULT_HEIGHT,
    "version": "1.7.0",
    "title": "Node stream origin",
    "date": "November 2026",
    "tagline": "The scalable data layer for decentralized browser apps",
    "highlights": (
        "Origin from a Node process",
        "File bytes when no ffmpeg",
        "Relays verify signed chunks",
    ),
    "packages": (),
    "install": "npm install dignity.js@1.7.0",
}


def run_bounds_check(logo_path: Path = DEFAULT_LOGO) -> None:
    layout = _canvas_layout(V170_BOUNDS_CHECK["width"], V170_BOUNDS_CHECK["height"])
    canvas = Image.new("RGBA", (layout.width, layout.height), BG + (255,))
    draw = ImageDraw.Draw(canvas)

    inner_top = layout.inner_top
    inner_bottom = layout.inner_bottom
    inner_h = layout.inner_h

    provisional_text_x = layout.frame[0] + layout.inset + int(inner_h * 0.44) + layout.text_logo_gap
    text_right = layout.frame[2] - layout.inset
    provisional_max_w = text_right - provisional_text_x

    _, block, start_y = _pick_font_scale(
        draw,
        layout,
        text_x=provisional_text_x,
        max_text_w=provisional_max_w,
        version=V170_BOUNDS_CHECK["version"],
        title=V170_BOUNDS_CHECK["title"],
        date=V170_BOUNDS_CHECK["date"],
        highlights=list(V170_BOUNDS_CHECK["highlights"]),
        packages=list(V170_BOUNDS_CHECK["packages"]),
        install_line=V170_BOUNDS_CHECK["install"],
    )

    block_cy = inner_top + inner_h // 2
    logo, logo_x, logo_y, max_text_w = _layout_logo(
        layout, logo_path, inner_top, inner_bottom, block_cy
    )
    text_x = logo_x + logo.width + layout.text_logo_gap

    _, block, start_y = _pick_font_scale(
        draw,
        layout,
        text_x=text_x,
        max_text_w=max_text_w,
        version=V170_BOUNDS_CHECK["version"],
        title=V170_BOUNDS_CHECK["title"],
        date=V170_BOUNDS_CHECK["date"],
        highlights=list(V170_BOUNDS_CHECK["highlights"]),
        packages=list(V170_BOUNDS_CHECK["packages"]),
        install_line=V170_BOUNDS_CHECK["install"],
    )

    tagline_runs, _ = _pick_tagline_layout(
        draw,
        V170_BOUNDS_CHECK["tagline"],
        logo_x,
        logo_y,
        logo.width,
        logo.height,
        inner_top,
        inner_bottom,
    )
    assert_banner_within_card(draw, layout, block=block, start_y=start_y, tagline_runs=tagline_runs)


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
    tagline: str = "",
) -> None:
    layout = _canvas_layout(width, height)
    canvas = Image.new("RGBA", (layout.width, layout.height), BG + (255,))
    draw = ImageDraw.Draw(canvas)

    _rounded_rect(
        draw,
        layout.frame,
        radius=layout.frame_radius,
        outline=INK,
        width=layout.frame_outline_w,
    )

    inner_top = layout.inner_top
    inner_bottom = layout.inner_bottom
    inner_h = layout.inner_h

    provisional_text_x = layout.frame[0] + layout.inset + int(inner_h * 0.44) + layout.text_logo_gap
    text_right = layout.frame[2] - layout.inset
    provisional_max_w = text_right - provisional_text_x

    _, block, _ = _pick_font_scale(
        draw,
        layout,
        text_x=provisional_text_x,
        max_text_w=provisional_max_w,
        version=version,
        title=title,
        date=date,
        highlights=highlights,
        packages=packages,
        install_line=install_line,
    )

    block_cy = inner_top + inner_h // 2

    logo, logo_x, logo_y, max_text_w = _layout_logo(
        layout, logo_path, inner_top, inner_bottom, block_cy
    )
    text_x = logo_x + logo.width + layout.text_logo_gap

    _, block, start_y = _pick_font_scale(
        draw,
        layout,
        text_x=text_x,
        max_text_w=max_text_w,
        version=version,
        title=title,
        date=date,
        highlights=highlights,
        packages=packages,
        install_line=install_line,
    )

    tagline_runs, logo_y = _pick_tagline_layout(
        draw, tagline, logo_x, logo_y, logo.width, logo.height, inner_top, inner_bottom
    )

    assert_banner_within_card(draw, layout, block=block, start_y=start_y, tagline_runs=tagline_runs)

    canvas.paste(logo, (logo_x, logo_y), logo)

    for run in tagline_runs:
        draw.text((run.x, run.y), run.text, font=run.font, fill=MUTED)

    for bullet in block.bullets:
        draw.rounded_rectangle(
            (
                bullet.x,
                start_y + bullet.y,
                bullet.x + bullet.size,
                start_y + bullet.y + bullet.size,
            ),
            radius=3,
            fill=bullet.color,
        )

    for run in block.text_runs:
        draw.text((run.x, start_y + run.y), run.text, font=run.font, fill=run.fill)

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
    parser.add_argument("--output", type=Path, default=None)
    parser.add_argument("--logo", type=Path, default=DEFAULT_LOGO)
    parser.add_argument("--width", type=int, default=DEFAULT_WIDTH)
    parser.add_argument("--height", type=int, default=DEFAULT_HEIGHT)
    parser.add_argument(
        "--size",
        type=_parse_size,
        default=None,
        help='Canvas size as "1584x792" (overrides --width/--height)',
    )
    parser.add_argument("--version", default="", help='e.g. "1.1.4" or "v1.1.4"')
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
    parser.add_argument("--tagline", default="", help="Short line under the logo saying what dignity.js is")
    parser.add_argument(
        "--check",
        action="store_true",
        help="Verify the v1.7.0 highlight set fits within the card (no PNG written)",
    )
    args = parser.parse_args()

    if args.check:
        run_bounds_check(logo_path=args.logo)
        print("Banner bounds check passed (v1.7.0 highlights).")
        return

    if args.output is None:
        parser.error("--output is required unless --check is set")

    width = args.width
    height = args.height
    if args.size:
        width, height = args.size

    if not args.version:
        parser.error("--version is required unless --check is set")

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
        tagline=args.tagline,
    )


if __name__ == "__main__":
    try:
        main()
    except HighlightsTooLongError as exc:
        print(f"error: {exc}", file=sys.stderr)
        sys.exit(1)