---
type: customer-pdf
project: shop-os
audience: Shop OS Foundation customer
tags: [shop-os, customer-onboarding, onboarding-pack]
---

# Welcome to Shop OS

Your Shop OS Foundation license key is below, along with the onboarding hour we run together and everything worth having ready before it.

Shop OS is set up with you, not by you. One booking, one hour: the first half we install it on your machine, the second half we train you and your team.

## Your license key

```
SHOP-XXXX-YYYY-ZZZZ
```

Save it somewhere safe (a password manager, a folder in your inbox). We enter it for you during the call and you will not be asked for it again.

## Your onboarding hour

**First 30 minutes, setup.** We get on a screen share and set Shop OS up on your machine. Every prerequisite, your license, and your Shop OS Vault in the folder you choose. By the halfway mark you have a working Shop Brain.

**Second 30 minutes, training.** We walk you and whoever else should be in the room through running it day to day: how to seed context, how to ask it real questions, how to put routines on a schedule.

The booking link is in your welcome email, listed as "Shop OS Foundation Setup". One booking covers both halves. Pick an hour when you will not be pulled onto the floor.

## Before the call

Five minutes of prep, so we spend the call on your business instead of on downloads.

1. **A Claude subscription.** Shop OS runs on Claude. If you do not have an account yet, set one up at **https://claude.ai/onboarding** and have the login handy.
2. **Your computer login password.** The install asks for it partway through, so developer tools can be installed. If someone else administers the machine, get them on the call with us.
3. **A decision on where the vault should live.** Your home folder, Documents, or Desktop if you work on one computer. Inside Dropbox, iCloud Drive, or OneDrive if you want it synced across machines. We create the folder for you on the call, so there is nothing to set up ahead of time.
4. **Thirty uninterrupted minutes** on the computer you actually work on, with the license key above within reach.

## For the training half

1. **Decide who should be in the room.** Anyone who answers the same questions all day belongs on this call.
2. **Pull together real material to seed the vault:** past quotes, a few email threads, SOPs, supplier price lists. We use your own documents during the session rather than a demo set.
3. **Bring the three questions your team asks you most.** We answer them out of your own vault before the call ends.

## What we build in the first half

The installer we run together handles Node.js, Claude Code, and Obsidian, picks up your license, and creates your Shop OS Vault in the folder you picked. Then we run `/bp-setup`, a guided interview that builds your Shop Brain from scratch.

It covers 9 topics: your shop, what you build and who buys it, how jobs flow from estimate to delivery, how you price your work, where customers come from, why they pick you, how you communicate, what you are focused on right now, and the tools you use. Say **next** to move ahead on any topic, or **done** to wrap up early. By the end, your vault reflects your actual business.

After the call we send a follow-up document called "Your First Week with Shop OS" that walks you through what to do next.

## Letting your team use Shop OS Chat

Inside your vault folder, alongside `CLAUDE.md` and `Raw/`, the installer also drops a file called `Shop OS Chat.command` (Mac) or `Shop OS Chat.bat` (Windows). This is the read-only chat your team can use to ask questions about anything in the vault. Suppliers, past jobs, customer history, contract terms, all searchable from a simple chat window. We cover it in the training half of the call.

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

- **Cannot make your booked time?** Reschedule from the confirmation email in your calendar invite. No need to ask us first.
- **Not sure which computer to use?** Pick the one you work on daily. We can add a second machine later, and syncing the vault through Dropbox, iCloud Drive, or OneDrive is the usual way to do it.
- **Someone else runs IT for you?** Forward them this document and put them on the call. The first thirty minutes is all they need to stay for.
- **Anything else** gets answered by reply email, or on the call.

Welcome aboard.

<div class="signature" style="page-break-inside: avoid; break-inside: avoid;">
<strong>Blueprint.ai</strong><br>
Blueprint IT, LLC<br>
<a href="mailto:glenn@blueprintit.ai">glenn@blueprintit.ai</a><br>
<a href="https://blueprintit.ai">www.blueprintit.ai</a>
</div>
