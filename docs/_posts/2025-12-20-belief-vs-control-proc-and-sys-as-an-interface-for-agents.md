---
title: "Belief vs Control: /proc and /sys as an Interface for Agents"
date: 2025-12-20
author: huan
categories: engineering
tags:
  - promptwareos
  - kernel
  - procfs
  - sysfs
  - agents
  - distributed-systems
  - design
excerpt: "PromptWareOS borrows Linux’s greatest interface trick—virtual filesystems—and fixes the parts the kernel community would never dare redesign today: belief vs control, /proc vs /sys, and why it matters for AI-native agent systems."
reference_rfc: "RFC v0.1: PromptWareOS SYS and PROC Virtual Filesystems"
image: /assets/2025/12-belief-vs-control-proc-and-sys-as-an-interface-for-agents/belief-control.webp
---

I’m going to be impolite for your own good.

If you’ve never `cat /proc/*` to figure out why a machine is on fire, if `sysctl -a` looks like an ancient spellbook rather than a friendly suggestion, if you can’t read `mountinfo` without reaching for coffee…

…this post will not be fun for you.

For everyone else: welcome. Pull up a chair. We’re going to talk about the most underrated interface in operating system history, why Linux *accidentally* created a masterpiece, and why building AI-native agent systems in 2025 means we need that interface again—except this time, we can do it on purpose.

And yes: we’re doing it in PromptWareOS.

---

## The Linux trick: “make the kernel legible”

Linux doesn’t just *run*. Linux *confesses*.

When you ask it questions, it doesn’t hand you opaque structs over ioctl incantations. It hands you text. Files. Directories. A whole little universe you can grep like a crime scene.

That universe is `/proc`.

It started life as a process filesystem—`/proc/<pid>/…`—and then it expanded into a general mechanism for answering the question every operator eventually asks:

> “What the hell is going on?”

You can blame debugging. You can thank pragmatism. Either way, Linux made its internal state *inspectable* without requiring specialized tools. The kernel became something you could interrogate with `cat`, `awk`, and vibes.

That move changed everything.

### It also created a problem Linux couldn’t fix

Linux shipped introspection so useful that the world built dependencies on it… and then the kernel community discovered a law of physics:

> **Anything exposed becomes a contract, even if you swear it isn’t.**

Once `/proc` was everywhere, cleaning it up became politically impossible. Not because engineers lack taste, but because ecosystems are allergic to breaking.

So Linux evolved a second surface: `/sys`.

---

## `/proc` and `/sys` are not “two folders”

They’re a philosophical split.

Even if Linux never wrote this as a manifesto, a pattern emerged over the last few decades:

* `/proc` became the place you go to **understand**.
* `/sys` became the place you go to **control**.

Put differently:

* `/proc` is **belief**.
* `/sys` is **authority**.

### `/proc`: belief (introspection)

`/proc` is the kernel’s story about itself:

* sometimes structured (tables)
* sometimes narrative (summaries)
* sometimes downright poetic (depending on who wrote that subsystem)

But fundamentally: it’s a *view*.

A view can be incomplete.
A view can be shaped by context.
A view can be namespaced.
A view can be “true enough” for humans and debugging.

In 2025, you already know the punchline: **views can lie on purpose**.

Containers forced Linux to admit that “truth” depends on where you’re standing. In a mount namespace, PID namespace, or cgroup world, `/proc` isn’t a universal truth oracle.

It’s *what this process is allowed to believe*.

That is not a bug.
That is a design reality.

### `/sys`: authority (mutation)

`/sys` is different. It maps kernel objects into a hierarchy and exposes their **attributes**.

A good `sysfs` attribute behaves like:

* one semantic value per file
* newline-terminated
* validated
* permissioned
* narrow and specific

Unlike `/proc`, `/sys` is not for storytelling.

It’s for knobs.

When you write a value in `/sys`, you are not asking the kernel how it feels.

You are asking the kernel to change.

---

## Why agent systems need this split even more than Linux did

In classic ops, the kernel is the mysterious entity.

In agent ops, the agent runtime is the mysterious entity.

If you’ve ever watched an LLM agent drift after 50 turns and thought:

> “You’re still executing, but you are not *the same system* anymore.”

…congratulations. You’ve rediscovered the need for a kernel-style introspection plane.

AI agent systems have two problems that look weirdly like Linux’s:

1. **Introspection is mandatory** (debuggability, trust, safety, monitoring)
2. **Mutation is dangerous** (accidental control, unstable contracts, foot-guns)

If you mix these, you recreate Linux’s infamous mistake in spirit: `/proc` becomes writable `/proc/sys`, and the whole world starts `echo`-ing into the agent’s brain.

That’s how you get production incidents triggered by a shell redirect.

We are not doing that.

---

## PromptWareOS: we rebuilt `/sys` and `/proc` for agents

![PromptWareOS Split](/assets/2025/12-belief-vs-control-proc-and-sys-as-an-interface-for-agents/proc-sys-split.webp)

PromptWareOS adopts Linux’s split explicitly and aggressively:

* **`/sys`** is the **control plane**. It is the *only* place mutation lives.
* **`/proc`** is the **belief surface**. It is **read-only by construction**.

We wrote this down as an RFC so it’s not folklore.

> **RFC v0.1: PromptWareOS SYS and PROC Virtual Filesystems**

This post is the guided tour—the version with fewer MUSTs and more jokes.

---

## The contract: what we promise, what we refuse

### `/proc` is read-only by construction

No exceptions.

Not “usually read-only.”
Not “read-only unless you’re root.”
Not “read-only unless it’s Tuesday and the moon is full.”

Read-only by construction.

Because the moment you let `/proc` mutate, you create two failure modes:

* **accidental mutation** (“I meant to redirect output, not rewrite the runtime”)
* **accidental ABI** (“my pipeline depends on this exact string layout forever”)

The first burns operators. The second freezes evolution.

### `/sys` is the only mutation surface

Mutation goes in `/sys`.

And we keep `/sys` boring on purpose:

* **one value per file**
* **newline-terminated**
* **semantic names**
* **strict validation**

A `/sys` file is an attribute, not a novel.

---

## Global surfaces + per-agent overlays

Linux taught us something important:

> The world looks different depending on which process is looking.

PromptWareOS is multi-agent by default, so we make the viewpoints explicit:

* **Global surfaces**

  * `/sys/system/...`
  * `/proc/system/...`

* **Per-agent overlays**

  * `/sys/agents/{agent-id}/...`
  * `/proc/agents/{agent-id}/...`

This lets you answer questions like:

* “What is the system doing?”
* “What does agent X believe?”
* “What knobs can I safely turn for agent Y?”

without pretending everything is a single global truth.

### Identity vs incarnation

Agents have a stable identity **and** ephemeral lives.

So we separate:

* Agent identity: `/sys/agents/{agent-id}/...`
* Specific running instance:

  * `/sys/agents/{agent-id}/incarnations/{incarnation-id}/...`
  * `/proc/agents/{agent-id}/incarnations/{incarnation-id}/...`

If you’ve ever debugged why PID 1 is special, you already understand why we did this.

---

## A concrete taste of `/sys` (without drowning you in spec)

We keep examples minimal here (the RFC is where the full tree lives), but you asked for one canonical piece:

### Memory mutation lives in `/sys`

We expose memory control as attributes:

* `/sys/memory/{key}`

Reads yield one newline-terminated value. Writes accept one value and validate it.

**Warning (by design):** the value encoding is still boot-era. Expect iteration. You should treat it as a single semantic payload, not a stable serialization format.

That is the contract.

Not “we’ll never change it.”

But:

* it is *a control plane*
* it is *validated*
* it is *the only place mutation happens*

---

## `/proc` is where the runtime tells you what it believes

If `/sys` is the knobs and levers, `/proc` is the dashboard.

Examples of canonical views:

* `/proc/system/summary`
* `/proc/system/health`
* `/proc/agents/{agent-id}/summary`
* `/proc/agents/{agent-id}/skills` (table)
* `/proc/agents/{agent-id}/belief` (narrative)

A key point:

> `/proc` is allowed to be rich.

Tables. Multi-line summaries. Human language.

In an agent system, *human language is not a bug*—it’s often the most useful debugging artifact.

But `/proc` is still an interface. So we treat it as a **belief surface**:

* it may be viewpoint-relative
* it may be policy-shaped
* it may evolve

And yes: if you build automation on top of it, you do so with open eyes.

---

## Naming and hierarchy rules (the “Linux never wrote this down” part)

Linux’s naming looks messy until you see the invariants hiding underneath.

We extracted the rules the kernel community learned by accident and turned them into deliberate conventions.

### Rule 1: identity becomes a directory

* `agents/{agent-id}`
* `skills/{skill-id}`
* `scripts/{script-id}`

Directories are entities.

### Rule 2: attributes are files

Files are single semantic values.

If you want a table, you’re in `/proc`, not `/sys`.

### Rule 3: deep for control, flat for belief

* `/sys` is deep because precision matters.
* `/proc` may be flatter because humans matter.

### Rule 4: prefer semantic, action-free names

* `enable`, `status`, `desired_state`

Not:

* `do_enable_now_please`

(The kernel is not your butler. The agent might be, but the OS shouldn’t.)

### Rule 5: never rename core nodes; deprecate instead

Compatibility is a tax.

We’re still boot-era, but we’re not naive about where this goes.

---

## The temptation we’re resisting

![Cat on Control Plane](/assets/2025/12-belief-vs-control-proc-and-sys-as-an-interface-for-agents/cat-control-plane.webp)

Every system that exposes introspection gets tempted to expose control in the same place.

It feels convenient.

It feels “Unixy.”

It is also how you end up with:

* debugging scripts that mutate production
* view formats that become permanent ABI
* “just one little writable file” that turns into a control plane

We refuse.

In PromptWareOS:

* `/proc` is belief
* `/sys` is authority

Mixing them is how you recreate the last 30 years of Linux history in fast-forward.

We already watched that movie.

---

## Where to argue with us (please do)

We’ve published the v0.1 RFC and we’re intentionally keeping this boot-era:

* core invariants are stable
* specific node sets will evolve
* extension surfaces are explicitly not ABI

If you’re the kind of person who has strong opinions about:

* whether memory keys should be hierarchical
* what a “skill” looks like as a system object
* how reconciliation status should be reflected

…you are exactly the audience we want.

Open an issue. Start a thread. Tell us what you’d do differently.

Because the whole point of writing this down as an RFC is to move from “folklore” to “engineering.”

---

## Epilogue: the kernel is a mirror, and now the agent runtime is too

Linux won because it gave operators a mirror.

Agents will win the same way.

But we don’t just need a mirror.

We need to keep the mirror from turning into a control panel.

That’s why PromptWareOS ships with both `/proc` and `/sys` from day zero.

And that’s why, if you didn’t know what `/proc` and `/sys` were, you really should have closed this tab.

*(I warned you.)*
