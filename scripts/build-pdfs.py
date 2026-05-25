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
@page {
  size: letter;
  margin: 0.85in 0.75in 1.0in 0.75in;
  background: #F4EFE3;
  @bottom-left {
    content: "Blueprint IT  ·  Shop OS Foundation";
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5C544A;
    border-top: 0.5pt solid #C4BBA7;
    padding-top: 6pt;
    vertical-align: top;
  }
  @bottom-right {
    content: "blueprintit.ai  ·  page " counter(page);
    font-family: "SF Mono", Menlo, Consolas, monospace;
    font-size: 7.5pt;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: #5C544A;
    border-top: 0.5pt solid #C4BBA7;
    padding-top: 6pt;
    vertical-align: top;
  }
}

* { box-sizing: border-box; }

html, body {
  background: #F4EFE3;
  color: #020309;
  font-family: Georgia, "Iowan Old Style", "Apple Garamond", serif;
  font-size: 11pt;
  line-height: 1.55;
  margin: 0;
  padding: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* ---- Cover header ---- */

.cover {
  border-bottom: 1px solid #020309;
  padding-bottom: 18pt;
  margin-bottom: 24pt;
}
.cover .wordmark {
  font-family: "SF Mono", "JetBrains Mono", "Iosevka", "Menlo", Consolas, monospace;
  font-size: 9pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #020309;
}
.cover .doc-no {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 9pt;
  color: #5C544A;
  float: right;
  letter-spacing: 0.08em;
}
.cover .title {
  font-family: Georgia, serif;
  font-size: 28pt;
  font-weight: 600;
  margin-top: 14pt;
  letter-spacing: -0.01em;
}
.cover .tagline {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8.5pt;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: #5C544A;
  margin-top: 6pt;
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
  border-top: 1px solid #C4BBA7;
  padding-top: 14pt;
}
h2::before {
  content: attr(data-anchor) "\\A";
  display: block;
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 8pt;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #5C544A;
  font-weight: 400;
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
}
h4 {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  font-size: 9pt;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 14pt 0 4pt 0;
  color: #5C544A;
}

p { margin: 0 0 9pt 0; }
strong { font-weight: 600; }
em { font-style: italic; color: #2A2820; }

a { color: #020309; text-decoration: underline; text-underline-offset: 2px; }

ul, ol { margin: 0 0 10pt 18pt; padding: 0; }
li { margin: 0 0 4pt 0; }

/* ---- Code / monospace ---- */

code {
  font-family: "SF Mono", "JetBrains Mono", Menlo, Consolas, monospace;
  font-size: 9.5pt;
  background: #E9E0CB;
  padding: 1pt 4pt;
  border-radius: 2pt;
}

pre {
  background: #E9E0CB;
  border-left: 2pt solid #020309;
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
  border-bottom: 1.5pt solid #020309;
  background: transparent;
}
td {
  padding: 6pt 8pt;
  border-bottom: 0.5pt solid #C4BBA7;
  vertical-align: top;
}
tr:last-child td { border-bottom: none; }

/* ---- Callouts (rendered from blockquotes) ---- */

blockquote {
  border-left: 3pt solid #020309;
  background: #ECE3CE;
  margin: 12pt 0;
  padding: 10pt 14pt;
  font-family: Georgia, serif;
  font-size: 10.5pt;
  page-break-inside: avoid;
  break-inside: avoid;
}
blockquote p:last-child { margin-bottom: 0; }

/* ---- Horizontal rule = section divider ---- */

hr {
  border: none;
  border-top: 1px solid #C4BBA7;
  margin: 24pt 0;
}

/* ---- Image / ASCII diagram boxes ---- */

pre.ascii-diagram {
  font-family: "SF Mono", Menlo, Consolas, monospace;
  background: #ECE3CE;
  font-size: 8.5pt;
  line-height: 1.35;
}

/* Footer is now rendered via @page @bottom-* margin boxes (above),
   so it lives inside the page margin and never overlaps body content. */

/* ---- Signature block ---- */

.signature {
  margin-top: 10pt;
  line-height: 1.5;
  font-family: Georgia, serif;
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


def wrap_in_template(body_html: str, title: str, doc_number: str, subtitle: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>{escape(title)}</title>
<style>{BRAND_CSS}</style>
</head>
<body>

<div class="cover">
  <span class="wordmark">Blueprint IT § Schematics for the AI-native business</span>
  <span class="doc-no">{escape(doc_number)}</span>
  <div style="clear:both;"></div>
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

    full_html = wrap_in_template(html_body, title=title, doc_number=doc_number, subtitle=subtitle)
    html_path = out_pdf.with_suffix(".html")
    html_path.write_text(full_html, encoding="utf-8")

    print(f"  - rendered HTML : {html_path.name}", file=sys.stderr)

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
