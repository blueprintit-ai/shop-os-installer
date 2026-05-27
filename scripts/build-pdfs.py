#!/usr/bin/env python3
"""Build branded PDFs from the customer-facing markdown docs.

Renders welcome-email-template.md and first-week-guide.md as Blueprint IT
branded PDFs using Chrome headless. Pure-Python markdown -> HTML, then
Chrome -> PDF. No external service required.

Brand: parchment background (#F4EFE3), near-black ink (#020309),
blueprint/drafting aesthetic, monospace for technical signal,
section symbols (§) as anchors, all-caps section labels.
"""

from __future__ import annotations

import re
import subprocess
import sys
from html import escape
from pathlib import Path

import markdown

ROOT = Path(__file__).resolve().parent.parent
DIST = ROOT / "dist"

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

BRAND_CSS = """
/* ============================================================
   Blueprint IT — Shop OS Foundation customer documents.
   Visual language matches blueprintit.ai/shop-ossi:
   warm paper base, blueprint grid overlay, cyan + rust accents,
   node-cloud cover banner, "Blueprint IT" wordmark.
============================================================ */

:root {
  --paper: #f4efe3;
  --paper-2: #ede6d4;
  --paper-line: #d9ceb0;
  --ink: #0c1e2f;
  --ink-soft: #2a3f55;
  --ink-mute: #6a7788;
  --cyan: #1c6ea4;
  --cyan-soft: #2e8fc9;
  --rust: #c2461f;
  --gold: #b68a2c;
}

@page {
  size: letter;
  margin: 0.85in 0.75in 1.0in 0.75in;
  background: #f4efe3;
  @bottom-left {
    content: "Blueprint IT  \\00B7  Shop OS Foundation";
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2a3f55;
    border-top: 0.5pt solid #1c6ea4;
    padding-top: 6pt;
    vertical-align: top;
  }
  @bottom-right {
    content: "blueprintit.ai  \\00B7  page " counter(page);
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #2a3f55;
    border-top: 0.5pt solid #1c6ea4;
    padding-top: 6pt;
    vertical-align: top;
  }
}

* { box-sizing: border-box; }

/* Warm paper background (no grid overlay — kept clean for readability). */
html, body {
  background-color: #f4efe3;
  color: #0c1e2f;
  font-family: Georgia, "Iowan Old Style", "Apple Garamond", serif;
  font-size: 11pt;
  line-height: 1.55;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ---- Cover ---- */

.cover {
  border-bottom: 1.5pt solid #0c1e2f;
  padding-bottom: 18pt;
  margin-bottom: 24pt;
  page-break-after: always;
  break-after: page;
}

/* Node-cloud banner: SVG accent at the top of the cover.
   Matches the live ParticleBrainCanvas on shop-ossi (lateral brain
   silhouette, cyan body, gold edges, rust accents). Static SVG so
   it renders in PDF and email without JS. */
.cover-art {
  width: 100%;
  margin: -8pt 0 16pt;
  opacity: 0.78;
  line-height: 0;
  border-bottom: 0.75pt solid #1c6ea4;
  padding-bottom: 8pt;
}
.cover-art img {
  width: 100%;
  height: 105pt;
  object-fit: cover;
  object-position: center;
  display: block;
}

.cover-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 12pt;
}

.cover .wordmark {
  font-family: Georgia, serif;
  font-size: 13pt;
  font-weight: 600;
  letter-spacing: -0.005em;
  color: #0c1e2f;
}
.cover .wordmark em {
  font-style: italic;
  color: #c2461f;
  font-weight: 600;
  margin-left: 0;
}
.cover .wordmark-tag {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8pt;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #2a3f55;
  margin-left: 10pt;
  font-weight: 400;
}

.cover .doc-no {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 9pt;
  color: #1c6ea4;
  letter-spacing: 0.08em;
}
.cover .title {
  font-family: Georgia, serif;
  font-size: 28pt;
  font-weight: 600;
  margin-top: 10pt;
  letter-spacing: -0.01em;
  color: #0c1e2f;
}
.cover .tagline {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #1c6ea4;
  margin-top: 8pt;
}

/* ---- Section structure ---- */

h2 {
  font-family: Georgia, serif;
  font-size: 16pt;
  font-weight: 600;
  margin: 28pt 0 6pt 0;
  page-break-after: avoid;
  break-after: avoid;
  page-break-inside: avoid;
  break-inside: avoid;
  border-top: 1pt solid #1c6ea4;
  padding-top: 14pt;
  color: #0c1e2f;
}
h2::before {
  content: attr(data-anchor) "\\A";
  display: block;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #1c6ea4;
  font-weight: 500;
  margin-bottom: 4pt;
  white-space: pre;
}
h3 {
  font-family: Georgia, serif;
  font-size: 12.5pt;
  font-weight: 600;
  margin: 18pt 0 4pt 0;
  page-break-after: avoid;
  break-after: avoid;
  color: #0c1e2f;
}
h4 {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 9pt;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 14pt 0 4pt 0;
  color: #2a3f55;
}

p { margin: 0 0 9pt 0; }
strong { font-weight: 600; color: #0c1e2f; }
em { font-style: italic; color: #1c6ea4; }

a {
  color: #1c6ea4;
  text-decoration: underline;
  text-underline-offset: 2px;
  text-decoration-thickness: 0.5pt;
}

ul, ol { margin: 0 0 10pt 18pt; padding: 0; }
li { margin: 0 0 4pt 0; }

/* ---- Code / monospace ---- */

code {
  font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 9.5pt;
  background: #ede6d4;
  padding: 1pt 4pt;
  border-radius: 2pt;
  color: #0c1e2f;
}

pre {
  background: #ede6d4;
  border-left: 2.5pt solid #1c6ea4;
  padding: 10pt 12pt;
  margin: 10pt 0;
  overflow: hidden;
  page-break-inside: avoid;
  break-inside: avoid;
}
pre code {
  background: transparent;
  padding: 0;
  font-size: 9pt;
  line-height: 1.5;
  white-space: pre-wrap;
  word-wrap: break-word;
}

/* ---- Tables ---- */

table {
  width: 100%;
  border-collapse: collapse;
  margin: 10pt 0;
  font-size: 9.5pt;
  page-break-inside: avoid;
  break-inside: avoid;
}
th {
  text-align: left;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-weight: 600;
  padding: 6pt 8pt;
  border-bottom: 1.5pt solid #0c1e2f;
  background: transparent;
  color: #1c6ea4;
}
td {
  padding: 6pt 8pt;
  border-bottom: 0.5pt solid #d9ceb0;
  vertical-align: top;
}
tr:last-child td { border-bottom: none; }

/* ---- Callouts (rendered from blockquotes) ---- */

blockquote {
  border-left: 3pt solid #1c6ea4;
  background: #ede6d4;
  margin: 12pt 0;
  padding: 10pt 14pt;
  font-family: Georgia, serif;
  font-size: 10.5pt;
  page-break-inside: avoid;
  break-inside: avoid;
  color: #0c1e2f;
}
blockquote p:last-child { margin-bottom: 0; }

/* ---- Horizontal rule = section divider ---- */

hr {
  border: none;
  border-top: 1px solid #1c6ea4;
  margin: 24pt 0;
  opacity: 0.45;
}

/* ---- Image / ASCII diagram boxes ---- */

pre.ascii-diagram {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  background: #ede6d4;
  font-size: 8.5pt;
  line-height: 1.35;
}

/* ---- Signature block ---- */

.signature {
  margin-top: 10pt;
  line-height: 1.5;
  font-family: Georgia, serif;
  page-break-inside: avoid;
  break-inside: avoid;
}

/* ---- Page break helpers ---- */

.page-break { page-break-before: always; break-before: page; }
"""


def render_markdown(md_text: str) -> str:
    """Run python-markdown with tables, fenced code, attr_list extensions."""
    md = markdown.Markdown(
        extensions=["tables", "fenced_code", "attr_list", "sane_lists"],
        output_format="html5",
    )
    html = md.convert(md_text)
    return html


def annotate_h2_with_section_numbers(html: str) -> str:
    """Add data-anchor='§ 01' style attributes to each h2 in document order."""
    sections = []

    def replace(match: re.Match) -> str:
        idx = len(sections) + 1
        sections.append(idx)
        return f'<h2 data-anchor="§ {idx:02d}">'

    return re.sub(r"<h2>", replace, html)


def wrap_in_template(body_html: str, title: str, doc_number: str, subtitle: str, svg_content: str = "") -> str:
    svg_html = svg_content if svg_content else '<img src="../assets/node-cloud.svg" alt="" />'
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{escape(title)}</title>
<style>{BRAND_CSS}</style>
</head>
<body>

<div class="cover">
  <div class="cover-art">
    {svg_html}
  </div>
  <div class="cover-meta">
    <span class="wordmark">Blueprint<em>IT</em><span class="wordmark-tag">Schematics for the AI-native business</span></span>
    <span class="doc-no">{escape(doc_number)}</span>
  </div>
  <div class="title">{escape(title)}</div>
  <div class="tagline">{escape(subtitle)}</div>
</div>

{body_html}

</body>
</html>
"""


def md_to_pdf(src_md: Path, out_pdf: Path, title: str, doc_number: str, subtitle: str) -> None:
    raw = src_md.read_text(encoding="utf-8")
    # Strip YAML frontmatter if present
    if raw.startswith("---\n"):
        end = raw.find("\n---\n", 4)
        if end != -1:
            raw = raw[end + 5:]
    # Strip the H1 title (we use the cover title instead)
    raw = re.sub(r"^# .+\n", "", raw, count=1, flags=re.MULTILINE)
    # Source files are em-dash-free per brand rules; if any sneak in,
    # fail loudly during build rather than silently mangling output.
    if "—" in raw:
        offending = next(line for line in raw.splitlines() if "—" in line)
        raise SystemExit(f"em dash found in {src_md.name}: {offending!r}")

    html_body = render_markdown(raw)
    html_body = annotate_h2_with_section_numbers(html_body)

    # Inline SVG to avoid path resolution issues in template HTML
    svg_file = ROOT / "assets" / "node-cloud.svg"
    svg_content = svg_file.read_text(encoding="utf-8") if svg_file.exists() else ""

    full_html = wrap_in_template(html_body, title=title, doc_number=doc_number, subtitle=subtitle, svg_content=svg_content)
    html_path = out_pdf.with_suffix(".html")
    html_path.write_text(full_html, encoding="utf-8")

    print(f"  - rendered HTML : {html_path.name}", file=sys.stderr)

    # Also write template version for license server (per-customer PDF generation)
    if "shop-os-welcome" in str(out_pdf):
        template_path = out_pdf.parent / "shop-os-welcome-template.html"
        template_path.write_text(full_html, encoding="utf-8")
        print(f"  - template HTML : {template_path.name}", file=sys.stderr)

    # Chrome headless -> PDF
    chrome_cmd = [
        CHROME,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--virtual-time-budget=2000",
        f"--print-to-pdf={out_pdf}",
        f"file://{html_path}",
    ]
    result = subprocess.run(chrome_cmd, capture_output=True, text=True)
    if result.returncode != 0:
        print(result.stdout, file=sys.stderr)
        print(result.stderr, file=sys.stderr)
        raise SystemExit(f"Chrome PDF failed: exit {result.returncode}")
    if not out_pdf.exists() or out_pdf.stat().st_size == 0:
        raise SystemExit(f"PDF was not created or is empty: {out_pdf}")
    print(f"  - rendered PDF  : {out_pdf.name} ({out_pdf.stat().st_size // 1024} KB)", file=sys.stderr)


def main() -> int:
    DIST.mkdir(parents=True, exist_ok=True)

    targets = [
        {
            "src": ROOT / "customer-welcome.md",
            "out": DIST / "shop-os-welcome.pdf",
            "title": "Welcome to Shop OS",
            "doc_number": "DOC § SOS-WELCOME-01",
            "subtitle": "Your license, install steps, and first session",
        },
        {
            "src": ROOT / "first-week-guide.md",
            "out": DIST / "shop-os-first-week-guide.pdf",
            "title": "Your First Week with Shop OS",
            "doc_number": "DOC § SOS-GUIDE-01",
            "subtitle": "Obsidian basics, seeding, the operator, the optimizer",
        },
    ]

    for t in targets:
        if not t["src"].exists():
            raise SystemExit(f"source not found: {t['src']}")
        print(f"§ building {t['out'].name}", file=sys.stderr)
        md_to_pdf(t["src"], t["out"], t["title"], t["doc_number"], t["subtitle"])

    print("\ndone.", file=sys.stderr)
    return 0


if __name__ == "__main__":
    sys.exit(main())
