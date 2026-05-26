---
type: customer-guide
project: shop-os
status: ready-to-use
audience: Shop OS Foundation customer (non-technical)
tags: [shop-os, customer-onboarding, first-week]
---

# Shop OS: Your First Week

You finished the install and the onboarding interview. The vault is in Obsidian. Now what?

This guide covers the four things you need to know to start running your shop on Shop OS:

1. **How to use Obsidian to browse your vault.** 10 minutes. Read this first.
2. **How to feed your shop's existing materials into the vault.** Seeding. About an hour the first week.
3. **How to set up your daily morning briefing.** The `/os-operator` skill. 5-10 minute setup, then automatic.
4. **How to keep the vault healthy over time.** The `/os-optimizer` skill. 15 minutes once a month.

You can skip around, but section 1 is worth reading first if you've never used Obsidian.

---

## 1. How to use Obsidian to browse your vault

Obsidian is the app you use to **read, browse, and edit** your Shop OS vault. Think of it like Finder + Notes + a wiki rolled into one window. Claude Code does the AI work; Obsidian is where you actually look at the results.

You don't need to learn most of Obsidian's features. The basics get you 95% of the way there.

### The window layout

When you first open your Shop OS vault in Obsidian, you'll see three areas:

```
┌─────────────────────────────────────────────────────────┐
│  Left sidebar          │  Main pane                     │
│  (file explorer)       │  (whatever note you're reading)│
│                        │                                │
│  ├ CLAUDE.md           │  # Shop OS Vault               │
│  ├ Context/            │                                │
│  │  └ organization.md  │  Welcome to your Shop OS       │
│  ├ Projects/           │  vault. This is the operating  │
│  │  ├ Acme Cabinets/   │  system Blueprint IT installed │
│  │  └ Henderson/       │  for [your shop]...            │
│  ├ Raw/                │                                │
│  └ Team/               │                                │
└─────────────────────────────────────────────────────────┘
```

- **Left sidebar**: a tree of every folder and file in your vault. Click any file to open it in the main pane.
- **Main pane**: the note you're currently reading. By default it's read-only; double-click anywhere to edit.
- **Right sidebar** (might be hidden): shows backlinks, outline, and other contextual info. Toggle with `Cmd+Shift+B` (Mac) or `Ctrl+Shift+B` (Windows). You can ignore this for now.

### The 4 keyboard shortcuts you'll actually use

| Shortcut (Mac / Windows) | What it does |
|---|---|
| `Cmd+O` / `Ctrl+O` | Quick-open any file. Type a few letters of the filename, hit Enter. |
| `Cmd+Shift+F` / `Ctrl+Shift+F` | Search across every note in the vault. |
| `Cmd+,` / `Ctrl+,` | Settings (you rarely need this). |
| `Cmd+G` / `Ctrl+G` | Open the graph view. Visualizes your vault as a network of connected notes. Fun to look at; not essential. |

### Wikilinks: the magic of Obsidian

Throughout your vault, you'll see text in `[[double brackets]]`. These are **wikilinks**. Click any wikilink to jump to that note. If the note doesn't exist yet, clicking creates it.

Example: if a note about a customer mentions `[[Hooker Furnishings]]`, clicking that link takes you to the Hooker Furnishings supplier note. From there, you can navigate to all the jobs that used Hooker products, or to the latest Hooker price list. Everything is connected.

You don't need to type wikilinks yourself. Claude Code does that for you when it writes notes.

### How to add a new note manually (if you ever want to)

Three ways:

1. **Right-click** any folder in the left sidebar → "New note" → type the name → start typing
2. **Cmd+N / Ctrl+N** creates a new note in the current folder
3. **Type a wikilink** like `[[New customer name]]` in any existing note, click it, and Obsidian creates the note for you

But honestly, the better workflow is: tell Claude Code what you want to add, and Claude writes the note. Example: "Add a note in Projects/Acme/ that the customer called today to push delivery to next Friday." Claude creates and saves it. You see it appear in the Obsidian sidebar in real time.

### What to do if Obsidian feels overwhelming

Two things:

1. **Don't install any community plugins.** Shop OS doesn't need them and they can complicate things. The default Obsidian install has everything you need.
2. **Don't sign up for Obsidian Sync.** Your vault lives on your computer (and in Dropbox if you put it there). Obsidian Sync is a paid subscription you don't need.

Obsidian is just a viewer. You can always edit the same files in TextEdit, Notepad, VSCode, or any other text editor if Obsidian ever feels like too much. The vault is just a folder of plain markdown files.

### Pro move: keep Obsidian open while you work

Open Obsidian to the vault first thing each morning. Read your operator's morning briefing (we'll set that up in section 3). Throughout the day, glance at it whenever you need to look something up: a supplier price, a customer's past job, your own notes from last week.

When you need to ADD or CHANGE something, that's when you switch over to Claude Code (also in the vault folder) and tell it what you want. Claude writes the note, Obsidian shows you the result.

---

## 2. Seed your vault with what you already have

Right now your vault knows what you told it during the onboarding interview. That's a great start, but the real power kicks in once it knows the things your shop has been collecting for years: supplier price lists, contract templates, customer history, job photos, phone-call notes.

You don't need to manually copy and paste any of this. You drop the source files into the vault, ask Claude Code to read them, and it writes structured notes for you.

### Where to put materials: one folder, flat, no decisions

Open Finder (Mac) or File Explorer (Windows) and navigate to your Shop OS Vault folder. You'll see a folder called `Raw/` that the installer created for you. **That's your inbox.** Drop any file there. Claude Code reads it, decides where it belongs, files it correctly, and moves the original to `Raw/processed/` so the inbox stays clean.

```
Shop OS Vault/
├── Raw/                  ← drop everything here, flat. No subfolders to make.
│   ├── README.md
│   └── processed/        ← Claude moves digested originals here automatically
├── Context/              (your shop info, created by onboarding)
├── Projects/             (one folder per job)
├── Team/                 (your staff)
├── Resources/            (reusable templates and references)
└── CLAUDE.md             (do not edit; Claude Code uses this)
```

**Do not create subfolders inside `Raw/`.** That's the LLM's job. Pre-sorting defeats the whole point of having Claude Code do classification. Just drop and go.

### What kinds of files work

Anything readable. Claude Code handles:

- **PDFs** (contracts, price lists, invoices, scans of paper records)
- **Word docs and spreadsheets** (Excel, .docx)
- **Images** (photos, sketches, screenshots)
- **Audio recordings** (phone calls, voice memos; gets transcribed first via the `audio-transcriber` skill)
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

After you have dropped some files in `Raw/`, open Claude Code in your vault folder. Type the slash command:

```
/os-digest
```

That's it. One command, easy to remember. It runs the full workflow: reads every file in `Raw/`, classifies each one, writes a structured note in the right vault folder, moves the original to `Raw/processed/`, and gives you a report like:

```
Processed 4 files:
  - acme-vanity-contract.pdf       -> Projects/Acme Vanity/contract.md
  - hooker-march-pricing.pdf       -> Resources/pricing/hooker-2026-03.md
  - henderson-kitchen-finished.jpg -> Projects/Henderson Kitchen/photos/
  - unknown.txt                    -> could not classify, left in Raw/
```

You skim the report, approve. If something landed in the wrong spot, tell Claude "move the [filename] note into [correct folder]". It learns the pattern for next time.

### How much should I seed?

Start with the things you reference weekly:

- Your 3-5 most-used supplier price lists
- Your current open jobs (contract + scope + photos)
- The last 3 months of completed jobs (photos + final price)
- Your shop's standard contract template
- Any SOPs or training docs you have

That gives Claude Code enough context to be useful for daily questions. You can always add more later.

---

## 3. Set up your daily morning briefing with `/os-operator`

The operator is the autonomous part of Shop OS. You set it up once. After that, it runs on a schedule and writes a fresh briefing to your `Daily/` folder every morning before you walk into the shop.

A typical morning briefing for a cabinet shop:

> **Monday 2026-05-25**
>
> **Today on the floor:** Aviemore kitchen install (Greg + Pete), Henderson vanity finish (Marco)
>
> **Shipping today:** Patel DIY Closet pickup at 2pm
>
> **Open follow-ups:** Smith needs quote revision by Wednesday, Sherwood has not responded since Friday
>
> **Material orders arriving:** Hooker shipment expected Tuesday AM
>
> **This week's deadlines:** Bevel cabinet drawer-front prototype (due Thursday)

You read this with your coffee and know what your day looks like before you set foot in the shop.

### Setup

In Claude Code, type:

```
/os-operator
```

The skill asks you a few questions:

| Question | Recommended answer for a cabinet shop |
|---|---|
| What cadence? | **Daily, 7:00am** (so it's ready when you arrive) |
| Where should the briefing land? | **`Daily/`** (a new dated file gets created in this folder each morning) |
| Who should the briefing address? | **You** (your name from onboarding) |
| What sections to include? | **Today on the floor, Shipping, Open follow-ups, Material orders, This week's deadlines** |

The operator wires itself up automatically. From now on, every morning at 7am, it reads your vault state and writes the briefing to your `Daily/` folder.

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

## 4. Keep the vault healthy with `/os-optimizer`

Over time your vault accumulates clutter: stale notes from finished jobs, dead links to files you moved, half-written drafts you never finished. The optimizer cleans this up.

It is not a daily tool. Run it **once a week**.

### What it does

In Claude Code, type:

```
/os-optimizer
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

---

## What you now have

After the first week, your Shop OS vault should have:

- ✅ Your shop's foundational info (Context/, set up by onboarding)
- ✅ A pile of seeded materials in their proper folders (Resources/, Projects/, Team/)
- ✅ A daily briefing arriving at 7am each morning (operator scheduled)
- ✅ A clean weekly cadence for vault health (optimizer reminder set)

From here, the more you use it, the smarter it gets. Drop your customer call notes into the vault as they happen. Drop new supplier docs in `Raw/` as they arrive. Ask Claude Code questions about your shop's history and it will have real answers.

## What's next (when you want more)

When you're ready to go further, ask about these add-ons:

| Add-on | What it does | When to ask about it |
|---|---|---|
| **Shop OS Pro** | Adds `os-evolver` (the vault gets smarter automatically) and `team-os` (multi-user vault) | When your shop has 3+ people sharing the vault |
| **Marketing Pack** | 40+ pre-wired marketing skills (copy, social, email, ads, CRO, launches) | When you want to grow your shop's online presence |
| **SEO Pack** | Get your shop ranking for "custom cabinets [your city]" | When you want more inbound leads |
| **Sales Pack** | CRM prospect mining, cold email, lead qualification | When you're doing commercial / B2B work |

Reply to the welcome email to ask about pricing for any of these.

### Marketing Pack details

The Marketing Pack ships [Corey Haines's marketingskills](https://github.com/coreyhaines31/marketingskills) into your vault. Forty-plus pre-wired AI marketing skills, each one connected to your Shop OS so it already knows your brand voice, your ICP, your past projects, and your current customers before you ask it anything.

What you get:

- **Copy:** website pages, landing pages, follow-up emails, cold outreach to GCs and designers
- **Social:** LinkedIn posts, Instagram captions, Facebook content, ready to publish
- **Visual:** image generation for Instagram carousels, social headers, before / after mockups
- **Video:** short-form scripts and storyboards for project tours
- **Email:** newsletter sequences, post-install follow-ups, win-back campaigns
- **Ads:** Meta and Google ad creative, headline variations, audience targeting
- **CRO:** homepage and pricing-page optimization, popup and signup-flow tuning
- **Launches:** new showroom announcements, new product-line reveals, Product Hunt-style sequences
- **Lead magnets:** gated guides like "Cabinet Buyer's Checklist" that grow your email list
- **Strategy:** competitor profiling, customer research synthesis, content-strategy planning

Every skill reads your `Context/` first, so the output sounds like your shop, not generic boilerplate. Reply to your welcome email to get pricing and onboarding.

## Need help?

Reply to your welcome email. We will respond ASAP.

<p class="signature">
<strong>Glenn Chua</strong>, Founder<br>
Blueprint IT, LLC<br>
<a href="mailto:glenn@blueprintit.ai">glenn@blueprintit.ai</a><br>
<a href="https://blueprintit.ai">www.blueprintit.ai</a>
</p>
