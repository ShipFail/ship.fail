---
title: "PromptWare v0.5: Enforcing Cognitive Integrity with Software Physics"
date: 2025-12-21
author: huan
categories: engineering
tags:
  - architecture
  - deno
  - llm
  - os-design
image: /assets/2025/12-promptware-v0-5-enforcing-cognitive-integrity-with-software-physics/promptware-os-0.5.webp
---

In our last update, we introduced the concept of **PromptWare**: treating the LLM prompt as a kernel and the underlying code as hardware. 

Today, we're releasing **v0.5**, a massive architectural refactor that moves us from a "Monolithic Kernel" to a "Microservices Architecture."

But this isn't just about cleaning up code. It's about solving the single biggest problem in autonomous agents: **Cognitive Drift**.

## The Problem: When Agents Forget Who They Are

We've all seen it. You give an agent a complex persona, a set of tools, and a mission. It works great for five turns. Then, slowly, it forgets. It hallucinates a file that doesn't exist. It tries to read a directory it doesn't have access to. It forgets its own name.

In v0.4, we tried to solve this with "Prompt Engineering"—reminding the agent of its state in every system message. But prompts are soft. They are suggestions, not laws.

We realized that to build a truly robust OS for agents, we needed **Software Physics**. We needed constraints that the agent *cannot* violate, no matter how much it hallucinates.

## The Solution: The Goodwin Check

Named after the cognitive architecture principle, the **Goodwin Check** is a mechanism that enforces identity through cryptographic isolation.

We leverage a unique feature of the Deno runtime: **KV Isolation**. When you open a Deno KV database with a specific `--location` flag (e.g., `https://github.com/user/repo`), that data is cryptographically isolated to that URL.

Here is the breakthrough: **We make the Agent's Identity its Database Key.**

### How It Works

1.  **Boot Time**: When the OS boots, we write the kernel parameters (like file system mounts) into Deno KV at `/proc/cmdline`. We lock this storage to the agent's `root` URL.
2.  **Runtime**: Every time the agent tries to perform a system call (read a file, fetch a URL), it must pass through our new **Supervisor** (`deno-exec.ts`).
3.  **The Check**: Before executing the command, the Supervisor attempts to read `/proc/cmdline` using the `root` URL provided by the agent.

If the agent has drifted—if it thinks it is `root: https://google.com` instead of `root: https://github.com/my/repo`—the Deno KV lookup fails immediately. The runtime throws an error. The action is blocked.

The agent literally *cannot* act unless it knows who it is. Identity is no longer a prompt; it's a physics constraint.

## Architecture v0.5: Pure Unix

To support this, we dismantled the v0.4 Monolith (`syscall.ts`) and replaced it with a suite of Unix-style microservices.

### 1. The Supervisor (`deno-exec.ts`)
This is the new entry point for all system calls. It acts as a middleware layer. It doesn't know how to read files or fetch URLs; it only knows how to verify identity. Once the **Goodwin Check** passes, it spawns the specific tool requested.

### 2. Micro-Tools
We split the heavy lifting into atomic, stateless tools:
*   `resolve.ts`: Resolves virtual paths (`os://`) to physical URLs.
*   `ingest.ts`: Fetches and parses content.
*   `memory.ts`: A direct interface to the Deno KV store.

### 3. Persistent Kernel Parameters (`/proc/cmdline`)
In v0.4, the agent had to remember its `mounts` (the mapping of virtual folders to physical repos). If it forgot, the file system broke.

In v0.5, we treat `mounts` like Linux treats `/etc/fstab`. They are stored in the "hardware" (Deno KV) at boot. When the agent needs to resolve a path, the `resolve` tool reads the configuration directly from `/proc/cmdline`. The agent doesn't need to remember anything. It just needs to ask the OS.

## Why This Matters for System Engineers

We are moving away from "Vibes-based" AI engineering toward **Deterministic AI Engineering**.

By offloading cognitive load (memory, identity, configuration) from the Neural Network to the Runtime Environment, we free up the agent's context window for what it does best: reasoning and creativity.

We aren't just building a chatbot. We are building an Operating System where the "User Space" is fuzzy and creative, but the "Kernel Space" is rigid, secure, and deterministic.

## Try It Out

PromptWare v0.5 is available now. Clone the repo, boot an agent, and watch it fail to hallucinate.

[Star the Repository on GitHub](https://github.com/ShipFail/promptware)
