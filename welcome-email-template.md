---
type: customer-email-template
project: shop-os
status: ready-to-use
tags: [shop-os, customer-onboarding, email-template]
---

# Shop OS Welcome Email Template

Use this when you issue a Shop OS Foundation license by hand. The automated path (Stripe/PayPal purchase) already sends this email from the Worker, so this file is for manual sends and for reading the copy without digging through TypeScript.

**Source of truth:** `Projects/shop-os-license-server/src/email/welcome-template.ts`. Change the copy there and the automated email changes with it. Keep this file in sync when you do.

Replace `{{CUSTOMER_NAME}}`, `{{LICENSE_KEY}}`, `{{BOOKING_URL}}`, and `{{PDF_URL}}` before sending.

---

## Subject line

```
Welcome to Shop OS, your license key and next steps
```

## Sender

```
Blueprint.ai <glenn@blueprintit.ai>
```

Brand, not a person. Reply-to stays `glenn@blueprintit.ai`.

## Attachments

- `shop-os-welcome.pdf` (built from `customer-welcome.md`, license key injected)
- `shop-os-first-week-guide.pdf` (built from `first-week-guide.md`)

## Plain-text body

```
Hi {{CUSTOMER_NAME}},

Your Shop OS Foundation license key is below, along with the onboarding
hour we run together and the short list of things to have ready before
it.


YOUR LICENSE KEY
────────────────────────────────────────────────────────────

    {{LICENSE_KEY}}

Save it somewhere safe (a password manager, a folder in your inbox). We
enter it for you during the call and you will not be asked for it again.
Keep this email so you can find the key later. It is also embedded in
the attached PDF.


BOOK YOUR ONBOARDING HOUR
────────────────────────────────────────────────────────────

Shop OS is set up with you, not by you. One booking, one hour, two
halves:

  First 30 minutes, setup. We get on a screen share and set Shop OS up on
  your machine: every prerequisite, your license, and your Shop OS Vault
  in the folder you choose. By the halfway mark you have a working Shop
  Brain.

  Second 30 minutes, training. We walk you and whoever else should be in
  the room through running it day to day.

Pick your time here (look for "Shop OS Foundation Setup"):

    {{BOOKING_URL}}

One booking covers both halves. Pick an hour when you will not be pulled
onto the floor.


INSTALL IT YOURSELF (OPTIONAL)
────────────────────────────────────────────────────────────

Prefer to get hands-on before the call? Your personal install page is
ready. The installer it gives you already carries your license key, so
there is nothing to type:

    https://shop-os-license-server.glenn-15d.workers.dev/install?key={{LICENSE_KEY}}

Pick Mac or Windows on that page, download your installer, and
double-click it. If anything gets stuck, stop there and bring it to
your booked hour: we finish it together. Self-installing does not use
up your setup and training session, and we still recommend booking it.


BEFORE THE CALL
────────────────────────────────────────────────────────────

Five minutes of prep, so we spend the call on your business instead of
on downloads:

  1. A Claude subscription. Shop OS runs on Claude. If you do not have an
     account yet, set one up at https://claude.ai/onboarding and have the
     login handy.

  2. Your computer login password. The install asks for it partway
     through. If someone else administers the machine, get them on the
     call with us.

  3. A decision on where the vault should live. Your home folder,
     Documents, or Desktop if you work on one computer. Inside Dropbox,
     iCloud Drive, or OneDrive if you want it synced across machines.

  4. Thirty uninterrupted minutes on the computer you actually work on,
     with the license key above within reach.


FOR THE SECOND HALF
────────────────────────────────────────────────────────────

  1. Decide who should be in the room for the training half. Anyone who
     answers the same questions all day belongs on this call.

  2. Pull together real material to seed the vault: past quotes, a few
     email threads, SOPs, supplier price lists. We use your own documents
     during the session rather than a demo set.

  3. Bring the three questions your team asks you most. We answer them
     out of your own vault before the call ends.


NEED HELP?
────────────────────────────────────────────────────────────

Reply to this email. We will respond ASAP.

The attached PDF covers the same ground and is yours to keep. You can
also re-download it any time from:

    {{PDF_URL}}

Welcome aboard.

Blueprint.ai
Blueprint IT, LLC
glenn@blueprintit.ai
www.blueprintit.ai
```

## HTML body

Do not keep a second copy of the HTML here. It drifted from the Worker last time. Instead, pull the live branded HTML from the admin preview endpoint:

```
GET https://shop-os-license-server.glenn-15d.workers.dev/admin/preview-welcome-email?key=SHOP-XXXX-YYYY-ZZZZ&name=Marco
```

Add `&format=text` for the plain-text rendering. Both require the admin bearer token. View source, copy, paste into a mailer that respects inline CSS (ConvertKit, Beehiiv, Resend, Postmark). For Gmail, use the plain-text body above: Gmail strips a lot of inline CSS on send and plain text tests cleaner.

## Notes for whoever sends this

- **The booking link is the point of this email.** If nothing else lands, they should book the hour. Do not bury it.
- **Calendly hosts ONE 1-hour event** ("Shop OS Foundation Setup"), not two 30-minute ones. Do not write copy telling customers to book two separate sessions.
- **Customize per customer** if you want extra warmth. Reference what they ordered, mention your discovery call. The template above is the floor, not the ceiling.
- **The 1-business-hour SLA in the closing matches your [[Context/organization|operator response SLA]].** Do not promise faster.
- **Self install is a personalized LINK, never raw commands.** Since 2026-08-30 the email offers an optional "Install it yourself" section pointing to `https://shop-os-license-server.glenn-15d.workers.dev/install?key={{LICENSE_KEY}}`, where the customer downloads `Install Shop OS.bat` / `Install Shop OS.command` with their key baked in. Do not paste raw terminal commands into the email. The booking link stays first and stays recommended; self-installing does not use up the included setup and training session.

## Where this template lives

- This file: `Projects/shop-os-installer/welcome-email-template.md`
- Automated send: `Projects/shop-os-license-server/src/email/welcome-template.ts`
- Booking URL: `CALENDLY_SETUP_URL` on the Worker (currently `https://calendly.com/blueprintit/shop-os-foundation-setup`), falling back to `CALENDLY_CONSULTATION_URL`
- Admin dashboard quick-copy version: `Projects/shop-os-license-server/src/admin-html.ts` (`buildEmailTemplate`)

<span style="background-color:#F4EFE3; color:#020309; padding:2px 8px; border-radius:3px; font-size:0.85em;">🤖 Blueprint IT Vault Operator, last edited: 2026-08-18T00:00:00Z</span>
