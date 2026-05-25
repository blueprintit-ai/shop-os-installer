---
type: customer-email-template
project: shop-os
status: ready-to-use
tags: [shop-os, customer-onboarding, email-template]
---

# Shop OS Welcome Email Template

Paste this into your mailer (Gmail, ConvertKit, whatever) when a customer purchases Shop OS Foundation. Replace `{{LICENSE_KEY}}` and `{{CUSTOMER_NAME}}` placeholders, or pull straight from the admin dashboard which generates this content automatically per-customer (click "Show email template" after issuing).

---

## Subject line

```
Welcome to Shop OS — your license key and install instructions
```

## Plain-text body

```
Hi {{CUSTOMER_NAME}},

Thanks for picking up Shop OS Foundation. Your license key is below, along
with everything you need to get installed in the next 15 minutes.


YOUR LICENSE KEY
────────────────────────────────────────────────────────────
        {{LICENSE_KEY}}
────────────────────────────────────────────────────────────

Save this key somewhere safe (1Password, a sticky note, an email folder).
You will paste it once during install. We will never ask you to re-enter
it after that.


BEFORE YOU INSTALL — four downloads, ~15 minutes total
────────────────────────────────────────────────────────────

Shop OS runs on top of four things. All four are required and all four
are simple double-click installers (no terminal commands needed for these).

1. CLAUDE MAX SUBSCRIPTION (~$100/month, paid to Anthropic, not us)
   Sign up: https://claude.ai
   Pick the Max plan, not Pro. Pro is too slow for daily Shop OS use.
   You can downgrade later if you find you don't need it.

2. NODE.JS (free, ~3 minutes to install)
   Download: https://nodejs.org
   Click the green "Get Node.js®" button. Double-click the installer that downloads.
   Click Next a few times. Done.

3. CLAUDE CODE (free, ~5 minutes to install)
   Download: https://claude.ai/code
   Pick the right installer (Mac or Windows). Double-click. Install.
   When it asks you to sign in, use the same Claude account from step 1.

4. OBSIDIAN (free, ~3 minutes to install)
   Download: https://obsidian.md
   Pick the right installer (Mac or Windows). Double-click. Install.

   Obsidian is the app you'll use to BROWSE your Shop OS vault — read
   notes, see your job folders, search across everything. Think of it
   as Finder + Notes + a wiki, in one window.

   IMPORTANT: When Obsidian first opens, it will ask you to either
   create a new vault or open an existing one. SKIP THIS for now.
   You'll open the Shop OS vault AFTER the install command runs.

   If Obsidian offers to set up "Obsidian Sync" or any paid features,
   skip those too. You don't need them.


CREATE YOUR VAULT FOLDER
────────────────────────────────────────────────────────────

Before running the install command, create an empty folder
called "Shop OS Vault" in Finder (Mac) or File Explorer (Windows).
You'll point the installer at this folder during install.

WHERE TO PUT IT
  One computer only:
    Anywhere you like — home folder, Documents, Desktop.
    Fastest option since nothing syncs.

  Multiple computers (shop + home + laptop):
    Put the folder INSIDE your Dropbox, iCloud Drive, or
    OneDrive folder. Any computer signed in to the same
    sync account will see the same vault.

    Make sure the sync app is installed, signed in, and
    finished its initial sync BEFORE you run the install
    command below. Sync occasionally lags a minute or two.

HOW TO CREATE THE FOLDER
  1. Open Finder (Mac) or File Explorer (Windows).
  2. Navigate to the location you chose above.
  3. Right-click in empty space, choose "New Folder".
  4. Name it exactly: Shop OS Vault

  Leave that Finder / File Explorer window open. You'll drag
  the folder out of it in a moment.

DISK SPACE
  Day one: under 50 MB. After a month: 100-500 MB. A busy
  shop importing many photos and PDFs may hit 2-5 GB by
  year-end. Make sure the drive has at least 10 GB free.


INSTALL SHOP OS — one command, ~30 seconds
────────────────────────────────────────────────────────────

Open Terminal (Mac: press Cmd+Space, type "terminal", Enter)
or PowerShell (Windows: press Windows key, type "powershell", Enter).

Paste this command and press Enter:

    npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install

The first time you run this it downloads the installer. Takes
about 20 seconds. Then it walks you through two prompts:

  1. YOUR LICENSE KEY
     Paste this when asked:

         {{LICENSE_KEY}}

  2. THE FOLDER YOU JUST CREATED
     Cleanest way: drag the Shop OS Vault folder from Finder /
     File Explorer directly into the terminal window. The path
     appears automatically. Press Enter.

     If drag-and-drop doesn't work, copy the path instead:
       Mac:     right-click the folder, hold OPTION, choose
                "Copy [folder name] as Pathname".
                Paste with Cmd+V into terminal.
       Windows: hold SHIFT and right-click the folder, choose
                "Copy as path". Paste with Ctrl+V into PowerShell.

The installer takes care of the rest automatically and tells
you exactly what to do next.


AFTER INSTALL — your first session
────────────────────────────────────────────────────────────

The installer will print "✓ Shop OS installation complete!" and tell
you the exact next steps. They are:

1. OPEN YOUR VAULT IN OBSIDIAN
   Launch Obsidian. Click "Open folder as vault" (you may need to click
   the small folder icon in the corner first to access this option).
   Select the "Shop OS Vault" folder the installer created in your
   home directory. Click Open.

   You'll now see your vault in Obsidian's main window. There's not much
   in it yet — just a CLAUDE.md file and a Raw/ folder. That's about to
   change.

2. OPEN YOUR VAULT IN CLAUDE CODE
   Launch the Claude Code app you installed in step 3 of the
   prerequisites (Mac: Applications folder. Windows: Start menu,
   pinned as "Claude Code").

   When the app opens, it shows a folder picker. Sometimes that is a
   list of recent folders, sometimes an "Open folder" button. Pick the
   "Shop OS Vault" folder in your home directory. Same folder you just
   opened in Obsidian.

   Claude Code remembers your choice. Next time you launch the app it
   opens straight into your vault. No terminal, no commands to memorize.

   You'll see a chat panel waiting for input. That's where you talk
   to Claude about your shop.

3. RUN THE ONBOARDING INTERVIEW
   At the Claude prompt, type:

       /os-setup

   This kicks off a 10-minute onboarding interview that asks about your
   shop name, owner, key staff, services, and daily routines. As you
   answer, Obsidian's file list (left sidebar) will fill up with the
   notes Claude is creating for you. Watch your vault populate in
   real time.

By the end of the interview, you'll have a configured Shop OS vault
ready to use. We'll send a follow-up email with a "first week" guide
that walks you through what to do next.


NEED HELP?
────────────────────────────────────────────────────────────

Reply to this email. A real human (Glenn) reads every message and
responds within one business hour.

Common first-time issues we have already fixed in advance:

  · "node: command not found" during the install command → finish
                                  step 2 of the prerequisites
  · Claude Code app won't launch or can't find your vault → reinstall
                                  from claude.ai/code and make sure you
                                  signed in with the same Claude account
                                  from step 1 of the prerequisites
  · "License rejected" → double-check you pasted the full key including
                          the SHOP- prefix and all three groups of four
  · Anything else → reply to this email and I will hop on a 15-min screen
                    share to fix it live


Welcome aboard.

— Glenn Chua
   Blueprint IT
   glenn@blueprintit.ai
```

## HTML body (optional, if you use a rich-text mailer)

Drop this into a styled email template. Most plain-text content above maps cleanly to a single-column HTML layout. If you use Gmail, plain text is usually better — it deliverability-tests cleaner and avoids the spam folder.

## Notes for whoever sends this

- **Customize per customer** if you want extra warmth — reference what they ordered, mention your discovery call, etc. The template above is the floor, not the ceiling.
- **The license key appears TWICE** in the email by design. Customers lose things; redundancy in two places helps.
- **The 1-business-hour SLA in the closing matches your [[Context/organization|operator response SLA]].** Don't promise faster.
- **The "common first-time issues" section is preempting the most likely support tickets.** Add to it as you see real customer questions.

## Where this template lives

- This file: `Projects/shop-os-installer/welcome-email-template.md` (you can edit anytime)
- The admin dashboard at `https://shop-os-license-server.glenn-15d.workers.dev/admin` generates a customized version of this email per-customer on the fly (click "Show email template" after issuing a license). That generator is in `Projects/shop-os-license-server/src/admin-html.ts` if you want to tweak the inline version.
