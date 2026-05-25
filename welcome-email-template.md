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


BEFORE YOU INSTALL — three downloads, ~10 minutes total
────────────────────────────────────────────────────────────

Shop OS runs on top of three things. All three are required and all three
are simple double-click installers (no terminal commands needed for these).

1. CLAUDE MAX SUBSCRIPTION (~$100/month, paid to Anthropic, not us)
   Sign up: https://claude.ai
   Pick the Max plan, not Pro. Pro is too slow for daily Shop OS use.
   You can downgrade later if you find you don't need it.

2. NODE.JS (free, ~3 minutes to install)
   Download: https://nodejs.org
   Click the green "LTS" button. Double-click the installer that downloads.
   Click Next a few times. Done.

3. CLAUDE CODE (free, ~5 minutes to install)
   Download: https://claude.ai/code
   Pick the right installer (Mac or Windows). Double-click. Install.
   When it asks you to sign in, use the same Claude account from step 1.


INSTALL SHOP OS — one command, ~30 seconds
────────────────────────────────────────────────────────────

Open Terminal (Mac: press Cmd+Space, type "terminal", Enter)
or PowerShell (Windows: press Windows key, type "powershell", Enter).

Paste this command and press Enter:

    npx -y --package=github:blueprintit-ai/shop-os-installer shop-os-install

The first time you run this it will download the installer. Takes about
20 seconds. Then it will ask you for your license key.

Paste this when prompted:

    {{LICENSE_KEY}}

The installer will set everything up automatically and tell you exactly
what to do next.


AFTER INSTALL — your first session
────────────────────────────────────────────────────────────

The installer will print "✓ Shop OS installation complete!" with three
numbered next steps. Follow them:

1. cd into the Shop OS Vault folder it just created for you
2. Open Claude Code in that folder
3. Type /obsidian:os-setup and follow the onboarding interview

The onboarding interview takes about 10 minutes. It asks about your
shop name, owner, key staff, services, and how you want your daily
routines to work. You will be running your shop on AI by the end.


NEED HELP?
────────────────────────────────────────────────────────────

Reply to this email. A real human (Glenn) reads every message and
responds within one business hour.

Common first-time issues we have already fixed in advance:

  · "node: command not found" → finish step 2 above
  · "claude: command not found" → finish step 3 above
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
