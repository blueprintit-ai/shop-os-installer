#!/usr/bin/env python3
"""Generate the Blueprint IT node cloud SVG used as a background accent
in customer-facing PDFs and the welcome email header.

Approximates the lateral-view brain silhouette from
blueprint-it-website/src/components/ParticleBrainCanvas.jsx using static
positioned dots (cyan/gold/rust) with proximity-based connecting lines.
No animation, no JS. Pure SVG, embeds in any HTML or PDF cleanly.

Output: assets/node-cloud.svg

Re-run any time to tweak palette/density. Output is deterministic via
the fixed RNG seed.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "assets" / "node-cloud.svg"

# Canvas dimensions: 4:1 banner aspect, sized for header strip usage.
# Wider than the live canvas to fit a horizontal cover banner without
# vertical cropping.
VBW = 1600
VBH = 400

# Brain ellipse center + radii (approximates the live canvas)
CX = VBW * 0.42
CY = VBH * 0.54
RW = VBW * 0.26
RH = VBH * 0.74

# Cerebellum cluster center (lower-right bump)
CB_CX = VBW * 0.62
CB_CY = VBH * 0.78
CB_R = VBH * 0.20

# Brand palette (matches shop-ossi exactly)
CYAN = "#1c6ea4"
CYAN_SOFT = "#2e8fc9"
GOLD = "#b68a2c"
RUST = "#c2461f"

# Counts
N_BRAIN = 95
N_CEREBELLUM = 18
N_OUTLIERS = 18  # scattered dots filling the wide banner

# Proximity-line settings
LINE_DIST = 90  # max distance for a line
LINE_OPACITY_MAX = 0.32
LINE_NEIGHBORS = 3  # each node connects to up to N nearest

random.seed(42)  # deterministic output


def in_ellipse(x, y, cx, cy, rw, rh):
    dx = (x - cx) / rw
    dy = (y - cy) / rh
    return dx * dx + dy * dy <= 1.0


def pick_color(x, y, cx, cy, rw, rh):
    """Color rule: nodes near edges get gold, occasional rust, mostly cyan."""
    dx = (x - cx) / rw
    dy = (y - cy) / rh
    edge_dist = math.sqrt(dx * dx + dy * dy)
    r = random.random()
    if edge_dist > 0.78 and r < 0.55:
        return GOLD
    if r < 0.08:
        return RUST
    if r < 0.16:
        return GOLD
    return CYAN


def gen_brain_nodes():
    nodes = []
    # Cerebrum body via rejection sampling inside the ellipse
    tries = 0
    while len(nodes) < N_BRAIN and tries < N_BRAIN * 40:
        tries += 1
        # Sample uniformly inside ellipse bounding box, reject outside
        x = random.uniform(CX - RW * 1.05, CX + RW * 1.05)
        y = random.uniform(CY - RH * 1.05, CY + RH * 1.05)
        if not in_ellipse(x, y, CX, CY, RW, RH):
            continue
        # Slight "front concave" tweak: push out a small bite from the
        # lower-left to suggest the frontal lobe / temporal divide
        dx = (x - CX) / RW
        dy = (y - CY) / RH
        if dx < -0.55 and dy > 0.45 and random.random() < 0.6:
            continue
        # Minimum-distance check vs existing nodes (looser-packed cloud)
        too_close = False
        for nx, ny, _, _ in nodes:
            if (x - nx) ** 2 + (y - ny) ** 2 < 24 ** 2:
                too_close = True
                break
        if too_close:
            continue
        color = pick_color(x, y, CX, CY, RW, RH)
        radius = random.choice([3.0, 3.4, 3.8, 4.2, 4.6, 5.5])
        nodes.append((x, y, color, radius))
    return nodes


def gen_cerebellum_nodes():
    nodes = []
    tries = 0
    while len(nodes) < N_CEREBELLUM and tries < N_CEREBELLUM * 30:
        tries += 1
        # Polar sample inside cerebellum circle
        ang = random.uniform(0, 2 * math.pi)
        rad = CB_R * math.sqrt(random.random())
        x = CB_CX + rad * math.cos(ang)
        y = CB_CY + rad * math.sin(ang)
        too_close = False
        for nx, ny, _, _ in nodes:
            if (x - nx) ** 2 + (y - ny) ** 2 < 18 ** 2:
                too_close = True
                break
        if too_close:
            continue
        r = random.random()
        color = GOLD if r < 0.35 else CYAN
        radius = random.choice([2.8, 3.2, 3.6, 4.0])
        nodes.append((x, y, color, radius))
    return nodes


def gen_outlier_nodes():
    """Stray dots floating around the main cloud for organic depth."""
    nodes = []
    for _ in range(N_OUTLIERS):
        # Place around the main cloud, outside the ellipse but within view
        for _ in range(20):  # retry limit
            x = random.uniform(40, VBW - 40)
            y = random.uniform(20, VBH - 20)
            if in_ellipse(x, y, CX, CY, RW * 1.05, RH * 1.05):
                continue
            # Not too close to cerebellum either
            if (x - CB_CX) ** 2 + (y - CB_CY) ** 2 < (CB_R * 1.4) ** 2:
                continue
            break
        color = CYAN_SOFT if random.random() < 0.6 else GOLD
        radius = random.choice([2.2, 2.6, 3.0])
        nodes.append((x, y, color, radius))
    return nodes


def compute_lines(nodes):
    """For each node, connect to its N nearest neighbors within LINE_DIST."""
    lines = []
    seen = set()
    for i, (x1, y1, _, _) in enumerate(nodes):
        dists = []
        for j, (x2, y2, _, _) in enumerate(nodes):
            if j == i:
                continue
            d = math.hypot(x1 - x2, y1 - y2)
            if d <= LINE_DIST:
                dists.append((d, j))
        dists.sort()
        for d, j in dists[:LINE_NEIGHBORS]:
            key = (min(i, j), max(i, j))
            if key in seen:
                continue
            seen.add(key)
            opacity = LINE_OPACITY_MAX * (1.0 - d / LINE_DIST)
            x2, y2, _, _ = nodes[j]
            lines.append((x1, y1, x2, y2, opacity))
    return lines


def build_svg(nodes, lines):
    out = []
    out.append(
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {VBW} {VBH}" '
        f'width="100%" height="100%" preserveAspectRatio="xMidYMid meet" '
        f'role="img" aria-label="Blueprint IT node cloud">'
    )
    # Lines layer first so dots sit on top
    out.append('<g stroke="#1c6ea4" stroke-width="1.4" stroke-linecap="round" fill="none">')
    for x1, y1, x2, y2, op in lines:
        out.append(
            f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" '
            f'stroke-opacity="{op:.3f}" />'
        )
    out.append("</g>")
    # Dots layer
    out.append("<g>")
    for x, y, color, r in nodes:
        out.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r}" fill="{color}" />')
    out.append("</g>")
    out.append("</svg>")
    return "\n".join(out)


def main():
    brain = gen_brain_nodes()
    cerebellum = gen_cerebellum_nodes()
    outliers = gen_outlier_nodes()
    all_nodes = brain + cerebellum + outliers
    lines = compute_lines(all_nodes)

    svg = build_svg(all_nodes, lines)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(svg, encoding="utf-8")
    size_kb = OUT.stat().st_size / 1024
    print(f"wrote {OUT.relative_to(ROOT)}: {len(all_nodes)} nodes, {len(lines)} lines, {size_kb:.1f} KB")


if __name__ == "__main__":
    main()
