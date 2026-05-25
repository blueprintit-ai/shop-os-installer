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

### 1. Claude Max subscription (paid, about $100 per month, paid to Anthropic, not us)

Sign up at **https://claude.ai**. Pick the Max plan, not Pro. Pro is too slow for daily Shop OS use. You can downgrade later if you find you don't need it.

### 2. Node.js (free, about 3 minutes to install)

Download from **https://nodejs.org**. Click the green "Get Node.js®" button. Double-click the installer that downloads. Click Next a few times. Done.

### 3. Claude Code (free, about 5 minutes to install)

Download from **https://claude.ai/code**. Pick the right installer for your machine (Mac or Windows). Double-click. Install. When it asks you to sign in, use the same Claude account from step 1.

### 4. Obsidian (free, about 3 minutes to install)

Download from **https://obsidian.md**. Pick the right installer for your machine (Mac or Windows). Double-click. Install.

Obsidian is the app you will use to browse your Shop OS vault: read notes, see your job folders, search across everything. Think of it as Finder plus Notes plus a wiki, in one window.

**Important:** When Obsidian first opens, it will ask you to either create a new vault or open an existing one. **Skip this for now.** You will open the Shop OS vault after the install command runs.

If Obsidian offers to set up Obsidian Sync or any paid features, skip those too. You do not need them.

## Install Shop OS: one command, about 30 seconds

Open Terminal (Mac: press Cmd+Space, type `terminal`, press Enter) or PowerShell (Windows: press the Windows key, type `powershell`, press Enter).

Paste this command and press Enter:

```
npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install
```

The first time you run this, it downloads the installer. That takes about 20 seconds. Then it will ask you for your license key.

Paste your license key when prompted. The installer takes care of the rest automatically and tells you exactly what to do next.

## After install: your first session

The installer prints `✓ Shop OS installation complete!` along with the exact next steps. Here they are spelled out.

### Step 1. Open your vault in Obsidian

Launch Obsidian. Click "Open folder as vault". You may need to click the small folder icon in the corner first to access this option.

Select the "Shop OS Vault" folder the installer created in your home directory. Click Open.

You will now see your vault in Obsidian's main window. There is not much in it yet, just a `CLAUDE.md` file and a `Raw/` folder. That is about to change.

### Step 2. Open Claude Code in the same folder

In Terminal or PowerShell, type:

```
cd ~/Shop\ OS\ Vault
claude
```

That launches Claude Code in your vault. You will see a `Claude>` prompt waiting for you.

### Step 3. Run the onboarding interview

At the Claude prompt, type:

```
/os-setup
```

This kicks off a 10-minute onboarding interview that asks about your shop name, owner, key staff, services, and daily routines. As you answer, Obsidian's file list on the left side will fill up with the notes Claude is creating for you. You can watch your vault populate in real time.

By the end of the interview, you have a configured Shop OS vault ready to use. We send a follow-up document called "Your First Week with Shop OS" that walks you through what to do next.

## Need help?

Reply to your welcome email. A real human (Glenn) reads every message and responds within one business hour.

Common first-time issues, already documented:

- **`node: command not found`** means you skipped step 2 of the prerequisites. Install Node.js and try again.
- **`claude: command not found`** means you skipped step 3. Install Claude Code and sign in.
- **`License rejected`** means the key was mistyped. Double-check you pasted the full key including the `SHOP-` prefix and all three groups of four characters.
- **Anything else** gets answered by reply email, usually with a 15-minute screen-share to fix the issue live.

Welcome aboard.

<p class="signature">
<strong>Glenn Chua</strong><br>
Blueprint IT<br>
glenn@blueprintit.ai
</p>
