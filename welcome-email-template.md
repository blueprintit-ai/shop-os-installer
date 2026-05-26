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
with everything you need to get installed in under 30 minutes.


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


SHOP OS CHAT, FOR YOUR TEAM
────────────────────────────────────────────────────────────

Inside your vault folder, the installer dropped a file called
"Shop OS Chat.command" (Mac) or "Shop OS Chat.bat" (Windows).
Anyone in your shop can double-click it to open a simple chat
window where they can ask questions about your vault.

The chat is READ-ONLY. It can answer anything, search across
notes, pull customer history, supplier prices, past job records.
It cannot create, edit, or delete anything. Your team gets fast
answers, you keep write access via Claude Code.

Every conversation saves to your vault as a transcript in a new
"Chats/" folder, so you can review later what was asked.

First launch takes about 20 seconds to download. After that,
it's instant.


NEED HELP?
────────────────────────────────────────────────────────────

Reply to your welcome email. We will respond ASAP.

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

Glenn Chua, Founder
Blueprint IT, LLC
glenn@blueprintit.ai
www.blueprintit.ai
```

## HTML body (paste-ready, branded version)

Drop this into a rich-text mailer (Gmail compose in rich mode, ConvertKit, Beehiiv, etc.). Branded to match `blueprintit.ai/shop-ossi`: cyan rule + Blueprint IT wordmark + cyan section markers, no external images so it renders even when "Show images" is blocked. Replace `{{CUSTOMER_NAME}}`, `{{LICENSE_KEY}}`, and `{{PDF_URL}}` before sending.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Welcome to Shop OS</title>
</head>
<body style="margin:0;padding:0;background:#f4efe3;color:#0c1e2f;font-family:Georgia,'Iowan Old Style',serif;-webkit-font-smoothing:antialiased;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:#f4efe3;">
<tr><td align="center" style="padding:32px 16px;">

<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;width:100%;">

<tr><td style="border-top:3px solid #1c6ea4;height:0;line-height:0;font-size:0;">&nbsp;</td></tr>

<tr><td style="padding:14px 0 18px;border-bottom:1px solid #d9ceb0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr>
<td style="font-family:Georgia,serif;font-size:15px;font-weight:600;color:#0c1e2f;letter-spacing:-0.005em;">Blueprint<em style="font-style:italic;color:#c2461f;font-weight:600;">IT</em><span style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#2a3f55;font-weight:400;font-style:normal;margin-left:10px;">&nbsp;&nbsp;Schematics for the AI-native business</span></td>
<td align="right" style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:1.4px;color:#1c6ea4;white-space:nowrap;">DOC § SOS-WELCOME-01</td>
</tr>
</table>
</td></tr>

<tr><td style="padding:24px 0 4px;">
<h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;margin:0;color:#0c1e2f;letter-spacing:-0.01em;line-height:1.1;">Welcome to Shop OS</h1>
<div style="font-family:Menlo,'SF Mono',monospace;font-size:10px;text-transform:uppercase;letter-spacing:2.4px;color:#1c6ea4;margin-top:8px;">Your license, install steps, and first session</div>
</td></tr>

<tr><td style="padding:22px 0 0;">
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:0 0 12px;">Hi {{CUSTOMER_NAME}},</p>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:0 0 4px;">Thanks for picking up <em style="font-style:italic;color:#1c6ea4;">Shop OS Foundation</em>. Your license key is below, along with everything you need to get installed in under 30 minutes.</p>
</td></tr>

<tr><td style="padding:28px 0 0;">
<div style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#1c6ea4;border-top:1px solid #1c6ea4;padding-top:14px;margin-bottom:6px;">§ 01 &nbsp;·&nbsp; Your license key</div>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:20px 16px;text-align:center;font-family:Menlo,'SF Mono',monospace;font-size:18px;letter-spacing:3px;color:#0c1e2f;font-weight:600;margin-top:8px;">{{LICENSE_KEY}}</div>
<p style="font-family:Georgia,serif;font-size:13px;line-height:1.55;color:#2a3f55;margin:10px 0 0;font-style:italic;">Save this somewhere safe. You will paste it once during install. We will never ask you to re-enter it.</p>
</td></tr>

<tr><td style="padding:28px 0 0;">
<div style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#1c6ea4;border-top:1px solid #1c6ea4;padding-top:14px;margin-bottom:6px;">§ 02 &nbsp;·&nbsp; Install Shop OS</div>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:8px 0 12px;">The full install guide is attached to this email as a PDF. You can also <a href="{{PDF_URL}}" style="color:#1c6ea4;text-decoration:underline;text-underline-offset:2px;">re-download it any time</a>.</p>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:0 0 8px;">Open the PDF and follow the four prerequisites (Claude Max, Node.js, Claude Code, Obsidian), then run this one command in Terminal (Mac) or PowerShell (Windows):</p>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:14px 14px;margin:10px 0;font-family:Menlo,'SF Mono',monospace;font-size:11px;color:#0c1e2f;line-height:1.5;word-break:break-all;">npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install</div>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:12px 0 8px;">When the installer asks for your license key, paste this:</p>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:14px 16px;margin:8px 0 0;font-family:Menlo,'SF Mono',monospace;font-size:13px;letter-spacing:2px;color:#0c1e2f;text-align:center;font-weight:600;">{{LICENSE_KEY}}</div>
</td></tr>

<tr><td style="padding:28px 0 0;">
<div style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#1c6ea4;border-top:1px solid #1c6ea4;padding-top:14px;margin-bottom:6px;">§ 03 &nbsp;·&nbsp; Need help?</div>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:8px 0 0;">Reply to your welcome email. We will respond ASAP.</p>
</td></tr>

<tr><td style="padding:32px 0 0;">
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:0;">Welcome aboard.</p>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.5;color:#0c1e2f;margin:18px 0 0;">
<strong style="font-weight:600;">Glenn Chua</strong>, Founder<br/>
Blueprint<em style="font-style:italic;color:#c2461f;font-weight:600;">IT</em>, LLC<br/>
<a href="mailto:glenn@blueprintit.ai" style="color:#1c6ea4;text-decoration:underline;text-underline-offset:2px;">glenn@blueprintit.ai</a><br/>
<a href="https://blueprintit.ai" style="color:#1c6ea4;text-decoration:underline;text-underline-offset:2px;">www.blueprintit.ai</a>
</p>
</td></tr>

<tr><td style="padding:32px 0 0;">
<table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
<tr><td style="border-top:1px solid #1c6ea4;height:0;line-height:0;font-size:0;">&nbsp;</td></tr>
<tr><td style="padding:14px 0 0;font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#6a7788;">
Blueprint IT &nbsp;·&nbsp; Shop OS Foundation &nbsp;·&nbsp; <a href="https://blueprintit.ai" style="color:#6a7788;text-decoration:none;">blueprintit.ai</a>
</td></tr>
</table>
</td></tr>

</table>

</td></tr>
</table>
</body>
</html>
```

**Which version to use:**

- **Plain text above:** copy-paste into Gmail (Gmail strips a lot of CSS on send; plain text tests cleaner and avoids the spam folder for cold-ish recipients).
- **HTML version here:** use in mailers that respect inline CSS (ConvertKit, Beehiiv, Resend, Postmark). The Worker's automated path already uses an identical template; this manual version is for parity when issuing licenses by hand via the admin dashboard.

## Notes for whoever sends this

- **Customize per customer** if you want extra warmth — reference what they ordered, mention your discovery call, etc. The template above is the floor, not the ceiling.
- **The license key appears TWICE** in the email by design. Customers lose things; redundancy in two places helps.
- **The 1-business-hour SLA in the closing matches your [[Context/organization|operator response SLA]].** Don't promise faster.
- **The "common first-time issues" section is preempting the most likely support tickets.** Add to it as you see real customer questions.

## Where this template lives

- This file: `Projects/shop-os-installer/welcome-email-template.md` (you can edit anytime)
- The admin dashboard at `https://shop-os-license-server.glenn-15d.workers.dev/admin` generates a customized version of this email per-customer on the fly (click "Show email template" after issuing a license). That generator is in `Projects/shop-os-license-server/src/admin-html.ts` if you want to tweak the inline version.
