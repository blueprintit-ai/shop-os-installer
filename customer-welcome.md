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

Your license key was included in the welcome email we sent you. It looks like this:

```
SHOP-XXXX-YYYY-ZZZZ
```

Save it somewhere safe (1Password, a sticky note, a folder in your inbox). You will paste it once during install. We will never ask you to re-enter it after that.

## Before you start: Claude Pro subscription

**Already have Claude Pro or Max?** You're all set. Skip to the next section.

If not, sign up at **https://claude.ai** and pick the **Pro** plan (~$20/month from Anthropic, not from us). Pro is the right starting point for Shop OS. As your Shop Brain grows and your team uses it every day, you can upgrade to the **Max** plan (~$100/month) for higher usage limits. Start with Pro.

## Install Shop OS: one command

Open Terminal (Mac: press Cmd+Space, type `terminal`, press Enter) or PowerShell (Windows: press the Windows key, type `powershell`, press Enter, then right-click and choose **Run as administrator**).

Copy and paste **one** of these commands, then press Enter:

**Mac** (in Terminal):
```
curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh | bash
```

**Windows** (in PowerShell as Administrator):
```powershell
irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 | iex
```

This script will:
1. Install Node.js (if you don't have it)
2. Install Claude Code (if you don't have it)
3. Install Obsidian (if you don't have it)
4. Ask you for your license key
5. Ask you where to create your Shop OS Vault folder

The script creates the vault folder for you, so you don't need to make it yourself. Just pick a location when prompted:
- **One computer only?** Your home folder, Documents, or Desktop.
- **Multiple computers?** Put it inside Dropbox, iCloud Drive, or OneDrive so it syncs across your machines.

The whole thing takes about 5 minutes depending on your internet speed.

## After install: your first session

The installer prints `✓ Shop OS installation complete!` along with the exact next steps. Here they are spelled out.

### Step 1. Open your vault in Obsidian

Launch Obsidian. Click "Open folder as vault". You may need to click the small folder icon in the corner first to access this option.

Select the "Shop OS Vault" folder the installer created in your home directory. Click Open.

You will now see your vault in Obsidian's main window. There is not much in it yet, just a `CLAUDE.md` file and a `Raw/` folder. That is about to change.

### Step 2. Open your vault in Claude Code

Launch the Claude Code app you installed in step 3 of the prerequisites. On Mac it lives in your Applications folder. On Windows it is pinned to the Start menu under "Claude Code".

When the app opens, it shows a folder picker, sometimes shown as a list of recent folders or an "Open folder" button. Pick the **Shop OS Vault** folder in your home directory. This is the same folder you just opened in Obsidian.

Claude Code remembers your choice. Next time you launch the app it opens straight into your vault. No terminal, no commands to memorize.

You will see a chat panel with a prompt waiting for input. That is where you talk to Claude about your shop.

### Step 3. Run the onboarding interview

At the Claude prompt, type:

```
/os-setup
```

This kicks off a 10-minute onboarding interview that asks about your shop name, owner, key staff, services, and daily routines. As you answer, Obsidian's file list on the left side will fill up with the notes Claude is creating for you. You can watch your vault populate in real time.

By the end of the interview, you have a configured Shop OS vault ready to use. We send a follow-up document called "Your First Week with Shop OS" that walks you through what to do next.

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

<p class="signature">
<strong>Glenn Chua</strong>, Founder<br>
Blueprint IT, LLC<br>
<a href="mailto:glenn@blueprintit.ai">glenn@blueprintit.ai</a><br>
<a href="https://blueprintit.ai">www.blueprintit.ai</a>
</p>
