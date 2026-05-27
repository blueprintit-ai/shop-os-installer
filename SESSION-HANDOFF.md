---
type: session-handoff
date: 2026-05-25
status: ready-to-resume
project: shop-os
tags: [handoff, shop-os, session-state]
---

# Shop OS session handoff — 2026-05-25

End-of-session snapshot. Read this in the next chat to pick up where we left off without re-reading the entire previous conversation.

## What got shipped over the last two sessions

In rough order, everything from the Karpathy/Nodus knowledge-graph engine through to the Shop OS Foundation product:

1. **Knowledge-graph engine for any vault.** Lives in `Projects/blueprint-os/` (the os-evolver source). Phase 1 (graph + diagnostics), Phase 1A (mechanical wikilink enricher), Phase 1B (LLM enricher), Phase 2 (vault audit), Phase 3 (note drafter for dangling refs), Phase 4 (bridge questions for cluster gaps), Phase 5 (website ingester). All Python-deterministic where possible. LLM portions refactored to be subscription-only (no Anthropic API key required); agent reads a prep file and processes it.
2. **/os-evolver skill** in the obsidian plugin wraps the engine. Lives in `BenAI/obsidian/skills/os-evolver/`. Currently held out of Shop OS Foundation as a Pro-tier feature.
3. **End-to-end deployment on CDF Vault** (`AI Clients/Capital Discount Furniture/CDF Vault/`). 7 edges -> 53 edges (7.5x), 89% -> 52% orphan rate, 0 dangling refs, 0 critical findings, STAR_TOPOLOGY resolved. Loop demonstrated on a real paying client vault. Detail: see `Intelligence/market/blueprintit-site-self-audit.md` and the CDF vault's own `Reports/knowledge-graph/`.
4. **Shop OS Foundation productization.** 28-skill bundle: 4 obsidian (`os-setup`, `assistant`, `os-operator`, `os-optimizer`), 10 meta, 14 superpowers (auto-installed for `/os-operator` scheduling). Plus `os-digest` as of obsidian v3.11.0.
5. **License server live.** Cloudflare Worker at `shop-os-license-server.glenn-15d.workers.dev`. KV-backed. Free tier.
6. **Admin dashboard live.** Same Worker, `/admin` route. Browser-based, manages licenses, generates per-customer welcome email templates.
7. **npx installer live.** Public repo `blueprintit-ai/shop-os-installer`, currently v0.1.2. One command: `npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install`.
8. **Customer-facing PDFs.** Blueprint IT branded (parchment, section symbols, monospace anchors). Built via Chrome headless from clean markdown sources. Lives in `dist/`.
9. **End-to-end install validated on a Windows mini PC.** Glenn ran the full pipeline on a fresh machine; the full chain works.
10. **`/os-digest` skill** (obsidian v3.11.0) replaces a long natural-language prompt with one slash command for processing the `Raw/` inbox.

## Where everything lives

See the `Shop OS URLs and file paths` memory entry for the full table. The shortest version:

| Component | Location |
|---|---|
| Knowledge-graph engine | `Projects/blueprint-os/` |
| Obsidian plugin (dev) | `/Users/tenguashi/Dropbox (Personal)/BenAI/obsidian/` |
| Obsidian plugin (marketplace) | `~/.claude/plugins/marketplaces/blueprint-skills/plugins/obsidian/` |
| License server source | `Projects/shop-os-license-server/` |
| Installer source | `Projects/shop-os-installer/` |
| Customer PDFs | `Projects/shop-os-installer/dist/` |
| Admin token | `~/.shopos-admin-token` (chmod 600) |
| Anthropic API key (dev only) | `~/.anthropic_key` |
| CDF client vault | `/Users/tenguashi/Dropbox (Personal)/AI Clients/Capital Discount Furniture/CDF Vault/` |

## Live URLs

- License server / admin: `https://shop-os-license-server.glenn-15d.workers.dev`
- Installer repo: `https://github.com/blueprintit-ai/shop-os-installer`
- Plugin marketplace: `https://github.com/blueprintit-ai/blueprint-skills`

## What is NOT done yet (open loops)

These are the next things to work on. Glenn paused to gather customer signal before committing. See the `Shop OS open loops` memory entry for the full list. Highlights:

1. **Foundation pricing.** No SKU price set. Need a number.
2. **Cabinet-shop-specific skills** (`shop:job-intake`, `shop:quoting-assistant`, `shop:material-orders`, `shop:daily-standup`, `shop:mozaik-bridge`). Vertical differentiation.
3. **Billing page** at `blueprintit.ai/shop-os` (or similar). Stripe webhook to auto-issue licenses.
4. **Static-render rebuild of blueprintit.ai.** Documented in `Intelligence/market/blueprintit-site-self-audit.md`. Astro recommended.
5. Optional bootstrap installer (auto-install Node.js)
6. Map `admin.blueprintit.ai` to the Worker (needs DNS migration to Cloudflare)

## How to resume in a new chat

The fast way:

```
Continuing Shop OS work. Read Projects/shop-os-installer/SESSION-HANDOFF.md
for the state of things, then we'll pick up.
```

Memory will also auto-load the Shop OS infrastructure / URLs / open-loops entries, so the new chat has context even without you typing the handoff path.

## Conventions to maintain

- All LLM work in customer-facing skills runs through the Claude Code subscription. Never reintroduce direct `ANTHROPIC_API_KEY` requirements in skills shipped to customers.
- Never use em dashes (Blueprint IT brand rule). Periods, commas, colons.
- Customer-facing PDFs use the brand template in `Projects/shop-os-installer/scripts/build-pdfs.py`. Parchment background, monospace section anchors, no em dashes.
- Foundation = subscription-only. Pro = adds os-evolver + team-os. Add-on packs = marketing/SEO/ads/sales themed bundles.
- Customer-facing slash commands use bare form: `/os-setup`, `/os-operator`, `/os-optimizer`, `/os-digest`. Not the `/obsidian:` prefix form.
