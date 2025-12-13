---
title: "Shipping PPL: A License for the Age of Promptware"
excerpt: "We needed a license for our AI co-founders. So we built one. Introducing the Public Prompt License (PPL) v0.1."
author: huan
categories: announcement
tags:
  - opensource
  - license
  - ai
  - prompt-engineering
  - ppl
image: /assets/2025/12-shipping-public-prompt-license-ppl/ppl-gpl-for-prompts.webp
---

> Where is the GPL for Prompts?

Last week, I wrote [From GPL to Prompts](https://preangel.ai/blog/2025/12/02/from-gpl-to-prompts/) to highlight a growing problem: **English is becoming source code**, but our open source licenses are stuck in the era of C and Java.

I asked the question. Today, I am sharing the answer.

We are releasing the **Public Prompt License (PPL)**, a new family of open-source licenses designed specifically for the AI-Native era.

---

## The Promptware Trigger

As we were building **[Promptware OS](https://ship.fail/blog/2025/12/13/promptware-os-ships-unix-architecture-for-ai-co-founders/)**—our operating system for AI co-founders—we hit a wall. We wanted to share our "kernel" prompts and "skills" libraries as true open source.

But when we looked at the existing options, they didn't fit:

*   **MIT** is great, but it doesn't define what "source" means for an agent.
*   **AGPL** is powerful, but ambiguous. If you talk to my agent over an API, do I have to send you the Python wrapper or the System Prompt?
*   **SSPL** tries to solve the cloud gap, but it claims the entire "Service Stack" (OS, hardware, backups), which makes it toxic for many developers and unacceptable to the Open Source Initiative (OSI).

We needed something that protected the **soul** of the agent (the prompts) without overreaching into the **body** (the infrastructure).

## Enter PPL v0.1

So we drafted the **Public Prompt License (PPL)**.

It is not just a text file; it is a "Legal Spec" for AI agents.

### The Core Innovation: "Prompt Source"

The heart of PPL is a rigorous definition of **[Prompt Source](https://github.com/ShipFail/public-prompt-license/blob/main/DEFINITIONS.md)**. It explicitly includes:

*   System Prompts & Personas
*   Tool Descriptions & Schemas
*   Routing Logic & Orchestration
*   Knowledge Structure (like Promptware's bootloaders)

Crucially, it explicitly **excludes** the underlying inference engine (vLLM, Ollama), the OS, and the hardware.

This is our **Infrastructure Exclusion**. Unlike SSPL, we are not trying to tax the cloud provider. We simply want to ensure that the *cognitive logic*—the part that makes the agent unique—remains free.

### The Three Variants

We created a family of three licenses to match the software ecosystem:

1.  **PPL-M (MIT-style):** For the builders. Use these prompts anywhere, even in closed products. Just keep the credit.
2.  **PPL-A (Apache-style):** For the enterprise. Includes patent grants for prompting techniques and clear attribution.
3.  **PPL-S (Service-style):** For the commons. If you run this agent as a service, you must share the prompts. This ensures that the *knowledge* embedded in our agents remains open.

![License for English](/assets/2025/12-shipping-public-prompt-license-ppl/license-for-english.webp)

## An Invitation to Pilot

This is not just legal theory. We are applying PPL to **Promptware OS** and our internal Ship.Fail projects starting today.

We are releasing PPL as **Draft 0.1 (Request for Comment)**. We know it isn't perfect yet. That is why we need you.

We invite you to:

1.  **Read the Spec:** Check out the [DEFINITIONS.md](https://github.com/ShipFail/public-prompt-license/blob/main/DEFINITIONS.md) in the repo.
2.  **Pilot it:** If you are building an agent, try adding `PPL-M` or `PPL-S` to your repo.
3.  **Break it:** Tell us where the definitions fail.

The future of open source isn't just about code anymore. It's about the prompts that steer our world.

Let's build that commons together.

👉 **[Star the Repository on GitHub](https://github.com/ShipFail/public-prompt-license)**
