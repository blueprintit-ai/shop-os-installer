---
type: customer-pdf
project: shop-os
audience: Shop OS Foundation customer
tags: [shop-os, customer-onboarding, install-pack]
---

# Welcome to Shop OS

Thanks for picking up Shop OS Foundation. This document walks you through everything you need to know to install, run your first session, and start using Shop OS in your business.

It takes about 15 minutes to install the prerequisites and another 30 seconds to run the install command. The whole thing should be done inside half an hour.

## Your license key

Your license key was included in the welcome email we sent you. It looks like this:

```
SHOP-XXXX-YYYY-ZZZZ
```

Save it somewhere safe (1Password, a sticky note, a folder in your inbox). You will paste it once during install. We will never ask you to re-enter it after that.

## Before you install: four downloads, about 15 minutes total

Shop OS runs on top of four things. All four are required. All four are simple double-click installers; no terminal commands needed for these.

### 1. Claude Pro subscription (Paid, ~$20 per month, paid to Anthropic, not us)

**Already have a Claude Pro or Max subscription? Skip ahead to step 2.**

Sign up at **https://claude.ai** and pick the **Pro** plan. Pro is the right starting point for Shop OS. As your Shop Brain grows and your team uses it every day, you may find you want higher usage limits, and you can upgrade to the **Max** plan (about $100 per month) any time. Start with Pro.

### 2. Node.js (free, about 3 minutes to install)

Download from **https://nodejs.org**. Click the green "Get Node.js®" button. Double-click the installer that downloads. Click Next a few times. Done.

### 3. Claude Code (free, about 5 minutes to install)

Download from **https://claude.ai/code**. Pick the right installer for your machine (Mac or Windows). Double-click. Install. When it asks you to sign in, use the same Claude account from step 1.

### 4. Obsidian (free, about 3 minutes to install)

Download from **https://obsidian.md**. Pick the right installer for your machine (Mac or Windows). Double-click. Install.

Obsidian is the app you will use to browse your Shop OS vault: read notes, see your job folders, search across everything. Think of it as Finder plus Notes plus a wiki, in one window.

**Important:** When Obsidian first opens, it will ask you to either create a new vault or open an existing one. **Skip this for now.** You will open the Shop OS vault after the install command runs.

If Obsidian offers to set up Obsidian Sync or any paid features, skip those too. You do not need them.

## Create your vault folder

Before running the install command, create an empty folder called **Shop OS Vault** using Finder (Mac) or File Explorer (Windows). The installer will ask you to point it at this folder.

### Where to put the folder

Pick a location based on how you work:

- **One computer only**: anywhere you like. Your home folder, your Documents folder, your Desktop. The fastest option since nothing syncs.
- **Multiple computers (shop + home + laptop)**: put the folder **inside your Dropbox folder**, your **iCloud Drive folder**, or your **OneDrive folder**. Any computer signed in to the same sync account will see the same vault.

If you go the multi-device route: make sure the sync app (Dropbox, iCloud Drive, or OneDrive) is installed, signed in, and finished its initial sync **before** running the install command. Sync occasionally lags a minute or two. If you save a note on one machine and it has not appeared on another yet, wait a moment.

### How to create the folder

1. Open Finder (Mac) or File Explorer (Windows).
2. Navigate to the location you chose above.
3. Right-click on empty space, choose **New Folder**.
4. Name the folder exactly: `Shop OS Vault`.

Leave that Finder / File Explorer window open. You will drag the folder out of it in a moment.

### How much disk space

Day one your vault is under 50 MB. After a month of typical cabinet-shop use, expect 100 to 500 MB. A busy shop importing many photos and PDFs may reach 2 to 5 GB by year-end. Make sure the drive you pick has at least 10 GB free.

## Install Shop OS: one command, about 30 seconds

Open Terminal (Mac: press Cmd+Space, type `terminal`, press Enter) or PowerShell (Windows: press the Windows key, type `powershell`, press Enter).

Paste this command and press Enter:

```
npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install
```

The first time you run this, it downloads the installer. That takes about 20 seconds. Then it walks you through two prompts:

1. **Your license key.** Paste it and press Enter.
2. **The folder you just created.** The cleanest way: **drag the Shop OS Vault folder from Finder / File Explorer directly into the terminal window**. The full path appears automatically. Press Enter.

If drag-and-drop does not work, you can copy the folder's path instead:

- **Mac**: right-click the folder, hold the **Option** key, then choose **"Copy [folder name] as Pathname"**. Paste with Cmd+V into terminal.
- **Windows**: hold **Shift** and right-click the folder, then choose **"Copy as path"**. Paste with Ctrl+V into PowerShell.

The installer takes care of the rest automatically and tells you exactly what to do next.

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
