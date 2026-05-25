---
type: customer-guide
project: shop-os
status: ready-to-use
audience: Shop OS Foundation customer (non-technical)
tags: [shop-os, customer-onboarding, first-week]
---

# Shop OS: Your First Week

You finished the install and the onboarding interview. The vault is in Obsidian. Now what?

This guide covers the three things you need to know to start running your shop on Shop OS:

1. **How to feed your shop's existing materials into the vault** (seeding)
2. **How to set up your daily morning briefing** (the `/obsidian:os-operator` skill)
3. **How to keep the vault healthy over time** (the `/obsidian:os-optimizer` skill)

You can skip around. Section 1 takes about an hour the first week; sections 2 and 3 are one-time setups that take 5-10 minutes each.

---

## 1. Seed your vault with what you already have

Right now your vault knows what you told it during the onboarding interview. That's a great start, but the real power kicks in once it knows the things your shop has been collecting for years — supplier price lists, contract templates, customer history, job photos, phone-call notes.

You don't need to manually copy and paste any of this. You drop the source files into the vault, ask Claude Code to read them, and it writes structured notes for you.

### Where to put materials — one folder, flat, no decisions

Open Finder (Mac) or File Explorer (Windows) and navigate to your Shop OS Vault folder. You'll see a folder called `Raw/` that the installer created for you. **That's your inbox.** Drop any file there — Claude Code reads it, decides where it belongs, files it correctly, and moves the original to `Raw/processed/` so the inbox stays clean.

```
Shop OS Vault/
├── Raw/                  ← drop everything here, flat. No subfolders to make.
│   ├── README.md
│   └── processed/        ← Claude moves digested originals here automatically
├── Context/              (your shop info — created by onboarding)
├── Projects/             (one folder per job)
├── Team/                 (your staff)
├── Resources/            (reusable templates and references)
└── CLAUDE.md             (don't edit — Claude Code uses this)
```

**Do not create subfolders inside `Raw/`.** That's the LLM's job. Pre-sorting defeats the whole point of having Claude Code do classification. Just drop and go.

### What kinds of files work

Anything readable. Claude Code handles:

- **PDFs** (contracts, price lists, invoices, scans of paper records)
- **Word docs and spreadsheets** (Excel, .docx)
- **Images** (photos, sketches, screenshots)
- **Audio recordings** (phone calls, voice memos — gets transcribed first via the `audio-transcriber` skill)
- **Plain text and Markdown**
- **Web pages saved as PDF** (right-click → "Save as PDF" works in most browsers)

### What Claude does with each type

| You drop | Claude figures out it's a... | And files it as |
|---|---|---|
| `acme-vanity-contract.pdf` | Customer contract | New `Projects/Acme Vanity/` folder with contract terms, milestones, dates |
| `hooker-march-pricing.pdf` | Supplier price list | `Resources/pricing/hooker-2026-03.md` |
| `henderson-kitchen-finished.jpg` | Job photo | `Projects/Henderson Kitchen/photos/` with style + material tags |
| `2026-05-23-smith-call.m4a` | Customer phone call | Transcribed, summarized into `Projects/Smith/calls/2026-05-23.md` |
| `cabinet-finishing-sop.docx` | Internal SOP | `Resources/sops/cabinet-finishing.md` |

You don't need to memorize this table. Just drop files in `Raw/` and let Claude decide.

### How to actually trigger the digest

After you have dropped some files in `Raw/`, open Claude Code in your vault folder. Type:

```
Process everything in Raw/. For each file, decide where it belongs, write a summary
in the right place, and move the original to Raw/processed/. Report back what you did.
```

Claude reads each file, classifies it, writes the new note to the correct folder, moves the original to `Raw/processed/`, and gives you a report like:

> Processed 4 files:
> - `acme-vanity-contract.pdf` → created `Projects/Acme Vanity/contract.md` and moved to processed/
> - `hooker-march-pricing.pdf` → created `Resources/pricing/hooker-2026-03.md` and moved to processed/
> - `henderson-kitchen-finished.jpg` → added to `Projects/Henderson Kitchen/photos/` and moved to processed/
> - `unknown.txt` → couldn't classify, left in Raw/ for you to look at

You skim the report, approve. If something landed in the wrong spot, tell Claude "move the [filename] note into [correct folder]" — it learns the pattern for next time.

### How much should I seed?

Start with the things you reference weekly:
- Your 3-5 most-used supplier price lists
- Your current open jobs (contract + scope + photos)
- The last 3 months of completed jobs (photos + final price)
- Your shop's standard contract template
- Any SOPs or training docs you have

That gives Claude Code enough context to be useful for daily questions. You can always add more later.

---

## 2. Set up your daily morning briefing — `/obsidian:os-operator`

The operator is the autonomous part of Shop OS. You set it up once. After that, it runs on a schedule and writes a fresh briefing to your `Daily/` folder every morning before you walk into the shop.

A typical morning briefing for a cabinet shop:

> **Monday 2026-05-25**
>
> **Today on the floor:** Aviemore kitchen install (Greg + Pete), Henderson vanity finish (Marco)
> **Shipping today:** Patel sectional pickup at 2pm
> **Open follow-ups:** Smith needs quote revision by Wednesday, Sherwood has not responded since Friday
> **Material orders arriving:** Hooker shipment expected Tuesday AM
> **This week's deadlines:** Bevel cabinet drawer-front prototype (due Thursday)

You read this with your coffee and know what your day looks like before you set foot in the shop.

### Setup

In Claude Code, type:

```
/obsidian:os-operator
```

The skill asks you a few questions:

| Question | Recommended answer for a cabinet shop |
|---|---|
| What cadence? | **Daily, 7:00am** (so it's ready when you arrive) |
| Where should the briefing land? | **`Daily/YYYY-MM-DD.md`** (default) |
| Who should the briefing address? | **You** (your name from onboarding) |
| What sections to include? | **Today on the floor, Shipping, Open follow-ups, Material orders, This week's deadlines** |
| Do you want a Telegram/email notification when it runs? | **Yes if you check those at 7am**, otherwise no (it lands in the vault either way) |

The operator wires itself up automatically. From now on, every morning at 7am, it reads your vault state, writes the briefing, and (if you opted in) pings you on Telegram.

### When to NOT run the operator

It costs Claude Max subscription tokens each run. If you take a vacation or close the shop for a week, you can pause it. In Claude Code, type:

```
Pause the operator until [date]
```

When you come back:

```
Resume the operator
```

### How to change what's in the briefing

Just edit `Context/operator.md` in your vault and tell Claude Code what you want different. Example:

```
In Context/operator.md, add "Cash position" as a section to the morning briefing, and remove "Material orders arriving."
```

The next morning's briefing reflects the change.

---

## 3. Keep the vault healthy — `/obsidian:os-optimizer`

Over time your vault accumulates clutter: stale notes from finished jobs, dead links to files you moved, half-written drafts you never finished. The optimizer cleans this up.

It's not a daily tool — run it **once a month**, usually on a slow day. Takes about 15 minutes of your time.

### What it does

In Claude Code, type:

```
/obsidian:os-optimizer
```

The optimizer scans every note in your vault against seven quality frameworks:

| Framework | What it catches | Example |
|---|---|---|
| Karpathy LLM Wiki | Broken links, orphaned notes, missing cross-references | A note that mentions "Henderson" but doesn't link to the customer's project |
| Anthropic CLAUDE.md | Schema doc completeness | Your CLAUDE.md is missing a section that confuses Claude |
| Caveman compression | Bloated instruction docs | Your operator prompt is 4000 words when it could be 800 |
| Chroma context rot | Stale content that contradicts newer notes | An old supplier note that conflicts with this month's price list |
| Memory hygiene | Notes that should be archived | Job from 2024 still cluttering active project list |
| Progressive disclosure | Skills that load too much at once | (mostly relevant for the OS itself) |
| General hygiene | Inconsistent naming, missing frontmatter | Files named with mixed case conventions |

When it finishes, you get an HTML dashboard in your browser showing every finding grouped by framework. Each finding has:
- What it found
- Why it matters
- A suggested fix
- A button to approve the fix (it edits the file for you)

### How to use the dashboard

Don't try to fix everything. The optimizer surfaces dozens of findings; most are minor. Focus on:

1. **Anything in the "critical" or "high" severity** at the top — these are real problems
2. **Broken wikilinks** — these break navigation
3. **Orphaned customer projects** — these mean you have a customer file that's not connected to anything

Approve the fixes for those. Ignore the rest unless you have time.

### When to run it

| Cadence | When |
|---|---|
| First month | Run it 2-3 weeks in, after you've seeded the vault and used it daily |
| Steady state | Once a month on a slow day (the 1st of each month works as a habit) |
| After big imports | Any time you batch-add a lot of materials (new supplier list, year-end records, etc.) |

---

## What you now have

After the first week, your Shop OS vault should have:

- ✅ Your shop's foundational info (Context/, set up by onboarding)
- ✅ A pile of seeded materials in their proper folders (Resources/, Projects/, Team/)
- ✅ A daily briefing arriving at 7am each morning (operator scheduled)
- ✅ A clean monthly cadence for vault health (optimizer reminder set)

From here, the more you use it, the smarter it gets. Drop your customer call notes into the vault as they happen. Drop new supplier docs in `Raw/` as they arrive. Ask Claude Code questions about your shop's history and it will have real answers.

## What's next (when you want more)

When you're ready to go further, ask about these add-ons:

| Add-on | What it does | When to ask about it |
|---|---|---|
| **Shop OS Pro** | Adds `os-evolver` (the vault gets smarter automatically) and `team-os` (multi-user vault) | When your shop has 3+ people sharing the vault |
| **Marketing Pack** | LinkedIn post writer, newsletter, case studies, infographics | When you want to grow your shop's online presence |
| **SEO Pack** | Get your shop ranking for "custom cabinets [your city]" | When you want more inbound leads |
| **Sales Pack** | CRM prospect mining, cold email, lead qualification | When you're doing commercial / B2B work |

Reply to the welcome email to ask about pricing for any of these.

## Need help?

Reply to your welcome email. Glenn responds within one business hour.

— Blueprint IT
