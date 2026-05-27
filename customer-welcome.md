---
type: customer-pdf
project: shop-os
audience: Shop OS Foundation customer
tags: [shop-os, customer-onboarding, install-pack]
---

# Welcome to Shop OS

Thanks for picking up Shop OS Foundation. This document walks you through everything you need to know to install, run your first session, and start using Shop OS in your business.

Installation takes about 5 minutes total (depending on your internet speed). It's one command that installs everything automatically.

## Your license key

```
SHOP-XXXX-YYYY-ZZZZ
```

Save it somewhere safe (1Password, a sticky note, a folder in your inbox). You will paste it once during install. We will never ask you to re-enter it after that.

## Before you start: Claude Pro subscription

**Already have Claude Pro or Max?** You're all set. Skip to the next section.

If not, sign up at **https://claude.ai** and pick the **Pro** plan (~$20/month from Anthropic, not from us). Pro is the right starting point for Shop OS. As your Shop Brain grows and your team uses it every day, you can upgrade to the **Max** plan (~$100/month) for higher usage limits. Start with Pro.

## Step 0: Set up Claude Code Terminal (first-time only)

If you have never used Claude Code Terminal on this computer, watch this 60-second walkthrough first: **{{VIDEO_URL}}**. It covers signing in with your Claude account through your browser and picking a color theme, so the one-command install below runs end-to-end without stopping for setup screens. If you already use Claude Code on this machine, skip ahead.

## Install Shop OS: One Command

Open Terminal (Mac: press Cmd+Space, type `terminal`, press Enter) or PowerShell (Windows: press the Windows key, type `powershell`, press Enter, then right-click and choose **Run as administrator**).

**Mac** (in Terminal), copy and paste this line:
```
/bin/bash -c "$(curl -fsSL https://shop-os-license-server.glenn-15d.workers.dev/installer-macos.sh)"
```

**Windows** (in PowerShell as Administrator), copy and paste this line:
```powershell
&([scriptblock]::Create((iwr 'https://shop-os-license-server.glenn-15d.workers.dev/installer-windows.ps1').Content))
```

> **Heads up, Mac users:** you will be asked for your Mac login password near the start. That is Homebrew installing developer tools. Type your password (the cursor will not move, that is normal) and press Enter.

The script will:

1. Install Node.js (if you don't have it)
2. Install Claude Code (if you don't have it)
3. Install Obsidian (if you don't have it)
4. Prompt you for your license key
5. Open a folder picker - click to choose where to install, then enter a name for your vault (default: "Shop OS Vault")

The script creates the vault folder for you, so you don't need to make it yourself. Just pick a location when prompted:
- **One computer only?** Your home folder, Documents, or Desktop.
- **Multiple computers?** Put it inside Dropbox, iCloud Drive, or OneDrive so it syncs across your machines.

The whole thing takes about 5 minutes depending on your internet speed.

## After install: your first session

The installer prints `✓ Shop OS installation complete!` and launches Claude Code into your new vault automatically. At the Claude prompt, type:

```
/bp-setup
```

This kicks off a 10-minute onboarding interview that asks about your shop name, owner, key staff, services, and daily routines. By the end of the interview, you have a configured Shop OS vault ready to use. We send a follow-up document called "Your First Week with Shop OS" that walks you through what to do next, including how to open the vault in Obsidian to browse and edit notes.

## Letting your team use Shop OS Chat

Inside your vault folder, alongside `CLAUDE.md` and `Raw/`, the installer also dropped a file called `Shop OS Chat.command` (Mac) or `Shop OS Chat.bat` (Windows). This is the read-only chat your team can use to ask questions about anything in the vault. Suppliers, past jobs, customer history, contract terms, all searchable from a simple chat window.

### How it works

Anyone in your shop double-clicks the file. A small terminal window opens (this is normal, it is the chat server running). The default browser opens to `localhost` with the chat page.

The first time the person uses it on this computer, the page asks for their name. From then on, the browser remembers and goes straight to the chat. When they end a conversation (either by clicking "End conversation" or closing the tab), the full transcript saves into a `Chats/` folder inside your vault. You can read those later from Obsidian or ask Claude Code "what did Marco ask about the Smith job last week?"

### What it can and cannot do

The chat is **read-only**. It can answer questions, search the vault, summarize anything stored there. It cannot create, edit, or delete files. If someone asks it to "add a note about today's call," it will politely say it cannot, and direct them to ask you or to use Claude Code.

This is on purpose. Your team gets fast answers without any risk of accidentally changing customer records, supplier lists, or contracts. You stay the one with write access via Claude Code.

### First launch is slower

The very first launch takes about 20 to 30 seconds while the chat downloads from GitHub. Every launch after that is instant.

## Need help?

Reply to your welcome email. We will respond ASAP.

Common first-time issues, already documented:

- **`node: command not found`** during the install command means you skipped step 2 of the prerequisites. Install Node.js and try again.
- **Claude Code app will not launch or cannot find your vault** means you skipped step 3 of the prerequisites or signed in with a different account. Reinstall from claude.ai/code and sign in with the same Claude account from step 1.
- **`License rejected`** means the key was mistyped. Double-check you pasted the full key including the `SHOP-` prefix and all three groups of four characters.
- **Anything else** gets answered by reply email, usually with a 15-minute screen-share to fix the issue live.

Welcome aboard.

<div class="signature" style="page-break-inside: avoid; break-inside: avoid;">
<strong>Glenn Chua</strong>, Founder<br>
Blueprint IT, LLC<br>
<a href="mailto:glenn@blueprintit.ai">glenn@blueprintit.ai</a><br>
<a href="https://blueprintit.ai">www.blueprintit.ai</a>
</div>
