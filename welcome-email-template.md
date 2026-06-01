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
with a one-command install that takes about 5 minutes.


YOUR LICENSE KEY
────────────────────────────────────────────────────────────
        {{LICENSE_KEY}}
────────────────────────────────────────────────────────────

Save this key somewhere safe (1Password, a sticky note, an email folder).
You will paste it once during install. We will never ask you to re-enter
it after that.


BEFORE YOU START — Claude Pro subscription
────────────────────────────────────────────────────────────

Shop OS works on top of Claude Pro. Sign up at https://claude.ai and
pick the Pro plan (~$20/month from Anthropic, not from us).

Pro is the right starting point for Shop OS. As your Shop Brain grows
and your team uses it every day, you can upgrade to the Max plan
(~$100/month) for higher usage limits. Start with Pro.


STEP 0 — Set up Claude Code Terminal (first-time only)
────────────────────────────────────────────────────────────

If you have never used Claude Code Terminal on this computer, watch
this 60-second walkthrough first:

    {{VIDEO_URL}}

It covers signing in with your Claude account through your browser and
picking a color theme, so the install command below runs end-to-end
without stopping for setup screens. If you already use Claude Code on
this machine, skip ahead.


INSTALL SHOP OS — one command, ~5 minutes
────────────────────────────────────────────────────────────

Open Terminal (Mac: press Cmd+Space, type "terminal", Enter) or
PowerShell (Windows: press Windows key, type "powershell", Enter,
then right-click and choose "Run as Administrator").

MAC (in Terminal), copy and paste these three lines:
    curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh -o setup.sh
    chmod +x setup.sh
    ./setup.sh

WINDOWS (in PowerShell as Administrator), copy and paste these three lines:
    irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 -o setup.ps1
    Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process
    .\setup.ps1

This script will automatically:
  · Install Node.js (if you don't have it)
  · Install Claude Code (if you don't have it)
  · Install Obsidian (if you don't have it)
  · Ask for your license key (paste {{LICENSE_KEY}})
  · Ask where to create your Shop OS Vault folder
    Pick: Your home folder, Documents, Desktop,
    OR inside Dropbox/iCloud Drive/OneDrive (for syncing
    across multiple computers)

The script creates the vault folder for you, so you don't
need to make it ahead of time.

The whole thing takes about 5 minutes depending on your
internet speed.


AFTER INSTALL — your first session
────────────────────────────────────────────────────────────

The installer prints "✓ Shop OS installation complete!" and launches
Claude Code Terminal into your new vault automatically. At the Claude
prompt, type:

    /bp-setup

This kicks off a 10-minute onboarding interview that asks about your
shop name, owner, key staff, services, and daily routines.

By the end of the interview, you'll have a configured Shop OS vault
ready to use. We'll send a follow-up email with a "first week" guide
that walks you through what to do next, including how to open the
vault in Obsidian to browse and edit notes.


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
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:0 0 4px;">Thanks for picking up <em style="font-style:italic;color:#1c6ea4;">Shop OS Foundation</em>. Your license key is below, along with a one-command install that takes about 5 minutes.</p>
</td></tr>

<tr><td style="padding:28px 0 0;">
<div style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#1c6ea4;border-top:1px solid #1c6ea4;padding-top:14px;margin-bottom:6px;">§ 01 &nbsp;·&nbsp; Your license key</div>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:20px 16px;text-align:center;font-family:Menlo,'SF Mono',monospace;font-size:18px;letter-spacing:3px;color:#0c1e2f;font-weight:600;margin-top:8px;">{{LICENSE_KEY}}</div>
<p style="font-family:Georgia,serif;font-size:13px;line-height:1.55;color:#2a3f55;margin:10px 0 0;font-style:italic;">Save this somewhere safe. You will paste it once during install. We will never ask you to re-enter it.</p>
</td></tr>

<tr><td style="padding:28px 0 0;">
<div style="font-family:Menlo,'SF Mono',monospace;font-size:9px;text-transform:uppercase;letter-spacing:2.2px;color:#1c6ea4;border-top:1px solid #1c6ea4;padding-top:14px;margin-bottom:6px;">§ 02 &nbsp;·&nbsp; Install Shop OS</div>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:8px 0 12px;">First, sign up for Claude Pro at <a href="https://claude.ai" style="color:#1c6ea4;text-decoration:underline;text-underline-offset:2px;">claude.ai</a> (~$20/month from Anthropic). New to Claude Code Terminal? Watch this 60-second setup walkthrough first: <a href="{{VIDEO_URL}}" style="color:#1c6ea4;text-decoration:underline;text-underline-offset:2px;">{{VIDEO_URL}}</a>. Then run these commands:</p>
<p style="font-family:Georgia,serif;font-size:12px;font-weight:600;color:#1c6ea4;margin:12px 0 6px;">Mac (in Terminal), copy and paste all three lines:</p>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:12px 12px;margin:0 0 16px;font-family:Menlo,'SF Mono',monospace;font-size:10px;color:#0c1e2f;line-height:1.5;word-break:break-all;">curl -fsSL https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-macos.sh -o setup.sh<br/>chmod +x setup.sh<br/>./setup.sh</div>
<p style="font-family:Georgia,serif;font-size:12px;font-weight:600;color:#1c6ea4;margin:12px 0 6px;">Windows (in PowerShell as Administrator), copy and paste all three lines:</p>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:12px 12px;margin:0 0 12px;font-family:Menlo,'SF Mono',monospace;font-size:10px;color:#0c1e2f;line-height:1.5;word-break:break-all;">irm https://raw.githubusercontent.com/blueprintit-ai/shop-os-installer/main/scripts/setup-windows.ps1 -o setup.ps1<br/>Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process<br/>.\setup.ps1</div>
<p style="font-family:Georgia,serif;font-size:15px;line-height:1.55;color:#0c1e2f;margin:8px 0 0;">The script installs everything automatically (Node.js, Claude Code, Obsidian). When prompted, paste your license key:</p>
<div style="background:#ede6d4;border-left:3px solid #1c6ea4;padding:14px 16px;margin:12px 0 0;font-family:Menlo,'SF Mono',monospace;font-size:13px;letter-spacing:2px;color:#0c1e2f;text-align:center;font-weight:600;">{{LICENSE_KEY}}</div>
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

- **Customize per customer** if you want extra warmth. Reference what they ordered, mention your discovery call, etc. The template above is the floor, not the ceiling.
- **The license key appears TWICE** in the email by design. Customers lose things; redundancy in two places helps.
- **The 1-business-hour SLA in the closing matches your [[Context/organization|operator response SLA]].** Don't promise faster.
- **The "common first-time issues" section is preempting the most likely support tickets.** Add to it as you see real customer questions.

## Where this template lives

- This file: `Projects/shop-os-installer/welcome-email-template.md` (you can edit anytime)
- The admin dashboard at `https://shop-os-license-server.glenn-15d.workers.dev/admin` generates a customized version of this email per-customer on the fly (click "Show email template" after issuing a license). That generator is in `Projects/shop-os-license-server/src/admin-html.ts` if you want to tweak the inline version.

<span style="background-color:#F4EFE3; color:#020309; padding:2px 8px; border-radius:3px; font-size:0.85em;">🤖 Blueprint IT Vault Operator, last edited: 2026-05-28T00:00:00Z</span>
