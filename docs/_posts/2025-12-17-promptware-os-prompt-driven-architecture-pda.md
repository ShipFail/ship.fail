---
title: "PromptWare OS & Prompt‑Driven Architecture (PDA)"
excerpt: "An ACM/IEEE‑style industry research report for AI co‑founder builders. Prompt‑Driven Architecture (PDA) is an emerging systems pattern where natural language prompts become the primary control plane."
categories: "engineering"
author: "huan"
tags:
  - promptware
  - architecture
  - pda
  - agents
  - research
image: /assets/2025/12-promptware-os-prompt-driven-architecture-pda/pda-report.webp
---

🔖 Promptware OS (Ship.Fail) + research landscape for **“prompts as system logic”** (agent boot, kernel, skills/tools, memory, eval, security)  
— An ACM/IEEE‑style industry research report for AI co‑founder builders

---

## Abstract

Prompt‑Driven Architecture (PDA) is an emerging systems pattern where **natural language prompts become the primary control plane** for complex software behavior: planning, tool use, memory management, error recovery, and policy enforcement. PromptWare OS (Ship.Fail) proposes an explicit OS‑style decomposition—**bootloader → microkernel → init agent → skills → tools**—implemented as fetchable Markdown and URL‑addressable executable utilities, aiming to make promptware composable, reproducible, and evolvable at scale.

This report synthesizes PromptWare OS’s architecture and threat model with the 2022–2025 research literature on (i) prompt programming and orchestration, (ii) LLM agents and tool interfaces, (iii) OS‑inspired memory management, (iv) evaluation harnesses for prompts/agents, and (v) prompt‑layer security (prompt injection, instruction hierarchy, and adaptive attacks). The focus is **deep technical alignment**: mapping each PromptWare OS primitive to validated research patterns, identifying gaps, and proposing a practical learning curriculum for builders.

---

## Executive summary (for builders)

1. **PDA is real and already “the default architecture” of agentic systems**—ReAct‑style loops, tool routing, reflection, and retrieval form a de‑facto runtime even when teams don’t call it an OS. See ReAct [R06], MRKL [R07], Toolformer [R08], HuggingGPT [R09].
2. **PromptWare OS is a clean, minimal “systems spec” for promptware**: a boot block loads a small kernel with syscalls, then starts an init agent which dynamically loads skills and invokes tools as ephemeral remote commands [H02][H03]. This closely matches modular agent surveys [R19] and OS‑inspired memory management (MemGPT) [R12].
3. **Security is the ring‑0 tax:** agentic PDA blurs instructions and data, making indirect prompt injection analogous to arbitrary code execution [R24]. “Defenses” frequently fail against adaptive attackers [R27]. Practical design requires instruction hierarchy enforcement [R26] + capability compartmentalization.
4. **Evaluation must be first‑class:** promptware without continuous evaluation collapses into folklore. PromptBench/DyVal [R16][R17], AgentBench/GAIA [R20][R21], StableToolBench [R18], and SWE‑agent’s ACI lessons [R13] provide the current best scaffolding.
5. **The core research gap for PromptWare OS builders:** a rigorous, repeatable method to (a) express system behavior in **pure natural language** without brittle DSLs, and (b) verify that behavior under adversarial inputs and changing tools.

---

## Methodology

### Source selection

We used:

* **Primary PromptWare OS texts:** Ship.Fail posts defining PromptWare OS, English‑at‑ring‑0 framing, and boot/kernel/Unix decomposition [H01–H03].
* **Peer‑reviewed / archival research:** arXiv/OpenReview/ICLR/NeurIPS/ACM papers on agents, tool use, memory, evaluation, and security [R01–R29].
* **Industry standards & incident reporting:** benchmark repos/docs, plus practitioner write‑ups to contextualize deployment realities [I01–I05].

### What “PDA” means in this report

A system qualifies as PDA when prompts are not merely “UI strings,” but **carry executable semantics** that decide:

* state transitions (what to do next),
* tool invocation (what to call, with what args),
* memory operations (what to store/recall/evict),
* safety/policy enforcement (what is allowed),
* self‑evaluation / repair loops.

This report prioritizes systems that achieve this with **natural language + minimal structure**, not heavy DSLs—while still covering DSL approaches as a contrast and as a path to reliability.

---

# 1. PromptWare OS as a systems spec

## 1.1 English at ring 0 (motivation)

Huan’s “English at ring 0” framing argues that the *most valuable logic* is increasingly embedded in prompts, configs, and chains rather than code, requiring engineering discipline and (eventually) licensing primitives [H01]. This matches the software engineering community’s “FMware/promptware” thesis: foundation‑model systems introduce new lifecycle challenges (orchestration, nondeterminism, security, testing) that classic SE tooling doesn’t cover [R03].

![English at Ring0](/assets/2025/12-promptware-os-prompt-driven-architecture-pda/english-at-ring-0.webp)

**Builder interpretation:** ring‑0 is not a metaphor for “LLMs are magical,” but for **privilege**: prompts decide actions that touch files, APIs, money, humans. Once you attach tools, prompt text becomes an executable policy surface.

## 1.2 PromptWare OS bootloader: one line to mount a brain

PromptWare OS defines a minimal **bootloader snippet** that points an agent to a canonical library—effectively “mounting” an external prompt filesystem and letting the agent fetch its persona/skills on demand [H02]. This aligns with empirical evidence that teams currently scatter prompts across repos and formats, making management and QA difficult [R02]. It also aligns with the emerging practice of storing prompts as first‑class repo artifacts to enable review, sharing, and iteration [I02].

**Key property:** the boot prompt converts a raw LLM into a configured agent through a **stable reference** (URL + path conventions) rather than copy‑pasting large prompts.

## 1.3 Microkernel + syscalls: promptware as OS primitives

PromptWare OS’s Unix‑architecture post formalizes the system as:

* **Bootloader → Kernel → Init agent → Skills → Tools**, mirroring Linux boot [H03].
* A **tiny immutable kernel** that exposes syscalls (`os_resolve`, `os_ingest`, `os_invoke`) [H03].

This mirrors a broad research trend: agent performance improves when we replace “one giant prompt” with **structured agent runtimes**—explicit loops, tool interfaces, and memory layers [R19].

## 1.4 Tools as small Unix‑like commands + zero‑footprint protocol

PromptWare OS argues tools should be **remote‑first, ephemeral, and self‑describing** (e.g., `deno run -A <url> --help`), leaving no persistent workspace debris [H02][H03]. Research on agent‑computer interfaces (ACI) in SWE‑agent shows that **interface design** (how an agent reads files, edits, runs tests) materially changes success rates [R13]. PromptWare OS’s “tool = small script + help text” is effectively an ACI design choice.

---

# 2. A unified PDA model (PromptWare OS ↔ research)

We map PromptWare OS primitives to a generalized PDA stack:

![OS Booting](/assets/2025/12-promptware-os-prompt-driven-architecture-pda/terminal.webp)

```
PDA Stack (PromptWare OS‑compatible)

(1) Boot / Loader: minimal config that names root + kernel + init
(2) Kernel: immutable policies + syscalls + instruction hierarchy
(3) Init Agent: persona + goals + capability envelope
(4) Skills / Libraries: modular prompt modules + playbooks + patterns
(5) Tools / Drivers: executable actions (CLI/API/UI) with validation
(6) Memory: short‑term context + long‑term store + paging/interrupts
(7) Evaluation: tests + benchmarks + red‑team + regression harness
(8) Security: threat model + privilege boundaries + monitoring
```

For each primitive, we provide:

* **What PromptWare OS proposes**
* **Closest research lineage**
* **Design risks + mitigations**
* **Implementation notes for builders**

---

# 3. Bootloader & initialization

## 3.1 The boot block as an executable contract

PromptWare OS’s boot block (root/kernel/init) is a **reproducibility artifact**: share a boot config, replicate an agent’s state [H03]. This rhymes with the evaluation community’s push for stable, reproducible agent environments (e.g., StableToolBench’s virtual API server to avoid tool drift) [R18].

### Risks

* **Boot source integrity:** if the boot URL is compromised, your entire OS is compromised.
* **Supply chain drift:** remote content changes silently.

### Mitigations

* Pin versions/hashes for kernel + skills.
* Treat the boot config as a signed manifest.
* Use a stable mirror + allowlist of roots.

## 3.2 Booting without DSLs: “pure NL” initialization

Most real systems still do boot via **system prompts** and conventions, not formal loaders. Research on **instruction hierarchy** argues a fundamental cause of prompt injection is that models fail to robustly privilege system/developer instructions over untrusted inputs; training explicit hierarchy improves robustness [R26]. PromptWare OS’s microkernel is a natural place to codify this hierarchy as a kernel policy.

**Builder takeaway:** The bootloader should not just load files; it should also declare the **privilege model**.

---

# 4. Kernel design: minimal, immutable, policy‑heavy

## 4.1 What belongs in the kernel?

PromptWare OS explicitly claims the kernel “defines the physics of the world” and contains no personality [H03]. In agent literature, this separation appears as: base policies + safety constraints (global), then task‑specific prompts (local) [R19]. In Constitutional AI, a *constitution* (rules) supervises behavior at scale [R25].

**Recommended kernel contents (PromptWare OS‑style):**

* Instruction hierarchy and conflict resolution rules.
* Capability declarations (what tools exist; how to invoke).
* Memory interface and constraints.
* Logging/auditing requirements.
* Evaluation hooks (how to run self‑checks).

## 4.2 Kernel syscalls ↔ research primitives

* `os_ingest` (dynamic context loading) corresponds to **adaptive retrieval + selective context expansion** in Self‑RAG [R22] and CRAG [R23] (retrieve only when needed; correct when retrieval goes wrong).
* `os_invoke` (tool execution) matches tool‑use frameworks: MRKL modular routing [R07], Toolformer’s learn‑when/what/how API calling [R08], Gorilla’s doc‑grounded API invocation [R10].
* `os_resolve` (path → URL mapping) is a lightweight version of “tool registry / schema discovery” common in tool‑bench ecosystems [R18].

### Risks

* **Kernel prompt injection:** attackers aim to overwrite “physics.”
* **Spec ambiguity:** NL kernel rules may be interpreted inconsistently.

### Mitigations

* Prefer declarative, short kernel rules.
* Back kernel rules with evaluation (see §7).
* Use hierarchy training or guard models where feasible [R26].

---

# 5. Agent / Skill model (init + libraries)

## 5.1 Init agent: persona + capability envelope

PromptWare OS treats init as the first user‑space process, defining persona and loading skills [H03]. This maps cleanly onto agent frameworks that separate:

* **role/persona**,
* **planning loop**,
* **tool interface**,
* **memory** [R19].

“Persona as kernel” in the one‑line boot post is a practical optimization: keep identity cheap, load knowledge on demand [H02]. Generative Agents show that persona + memory retrieval + reflection loops yield stable, believable behavior over time [R14].

### Risks

* Persona drift across sessions.
* Persona exploitation (“authority” framing attacks).

### Mitigations

* Freeze persona text; version it.
* Add hierarchy rules to prevent user content from redefining persona [R26].

## 5.2 Skills as prompt libraries (shared, modular, load‑on‑demand)

PromptWare OS models skills as shared libraries (like `/usr/lib`) that any agent can ingest [H03]. This directly addresses observed prompt management problems (duplication, inconsistent formatting, missing QA) in large GitHub prompt corpora [R02].

### “Pure NL” skill programming vs DSL

* **Pure NL:** task playbooks, checklists, structured prose. High leverage, high ambiguity.
* **Light structure:** Markdown sections, key/value blocks, examples.
* **DSL (contrast):** LMQL provides explicit control flow + constraints to compile prompts efficiently [R01].

**Why keep DSL in scope?** Even if PromptWare OS prefers Markdown/NL, DSL results are a strong indicator of what *must* eventually become explicit to achieve determinism (constraints, budgets, stopping conditions).

---

# 6. Tools as Unix‑like commands (drivers)

## 6.1 The Unix contract: self‑describing tools

PromptWare OS’s tool doctrine is: tools are small scripts with clear `--help`, streamed and ephemeral [H02][H03]. SWE‑agent’s research shows that providing agents with structured “computer interfaces” (search, editor, runner) and predictable command grammars drastically improves success rates on real tasks [R13].

## 6.2 Tool invocation as a first‑class research area

Three relevant research threads:

1. **Tool selection + routing:** MRKL [R07].
2. **Learning tool usage:** Toolformer [R08].
3. **Doc‑grounded invocation & tool drift:** Gorilla [R10] and StableToolBench [R18].

**PromptWare OS alignment:**

* Treat `--help` (or man page) as the “tool spec.” The 2025 “Command Line GUIde” paper explicitly uses man pages + tests + LLM agents to generate safer CLI interfaces—this is extremely aligned with “help‑first” tool discovery [R15].

### Risks

* **Argument hallucination:** wrong flags, wrong types.
* **Tool drift:** API changes silently.
* **Prompt injection through tool output:** tool logs become untrusted input.

### Mitigations

* Retrieve docs at runtime (Gorilla’s pattern) [R10].
* Post‑facto validation / “damage confinement” (as advocated in tool execution runtimes) [R10].
* Stable evaluation harness with simulated APIs (StableToolBench) [R18].

---

# 7. Memory: short/long + paging + reflective loops

## 7.1 The OS analogy becomes literal (MemGPT)

PromptWare OS claims “treat the context window like memory; load/unload libraries dynamically” [H03]. MemGPT explicitly frames LLM context management as **virtual memory** with tiers, paging, and interrupts [R12]. This is one of the strongest academic anchors for PromptWare OS’s memory model.

## 7.2 Memory patterns for PDA systems

* **Episodic + reflective memory:** Reflexion stores textual reflections to improve subsequent trials without weight updates [R11].
* **Memory retrieval + planning:** Generative Agents use stored experiences, reflections, and retrieval to plan daily actions [R14].
* **Curriculum + skill library growth:** Voyager grows a skills library and uses iterative prompting with feedback and self‑verification [R09a].

### Risks

* **Memory poisoning:** untrusted content stored long‑term becomes “self.”
* **Privacy leakage:** long memory may leak secrets.

### Mitigations

* Separate memory tiers (private vs shared). See MemGPT’s tiered management model [R12].
* Apply the “Rule of Two” mindset: avoid having (untrusted input + secrets + autonomous actions) in the same context window.
* Add memory write policies and redaction.

---

# 8. Evaluation and testing harnesses (promptware CI/CD)

PromptWare OS is implicitly a software engineering proposal; it needs *evaluation as a kernel service*, not an afterthought.

## 8.1 Promptware engineering as a discipline

“Software Engineering for LLM Prompt Development” (promptware engineering) argues prompt development is currently ad‑hoc and needs lifecycle tooling: requirements, design, testing, debugging, evolution [R04]. PromptWare OS’s repo‑first approach fits this discipline, but the missing piece is standardized test harnesses.

## 8.2 Prompt + agent benchmarks that map to PromptWare OS

* **PromptBench** provides a unified evaluation library with adversarial prompt attacks, dynamic evaluation protocols, and analysis tools [R16].
* **DyVal** targets benchmark contamination and dynamic difficulty scaling [R17].
* **AgentBench** evaluates LLMs as agents in interactive environments [R20].
* **GAIA** targets real‑world tool use proficiency and multi‑step reasoning [R21].
* **HarmBench** standardizes automated red teaming evaluation [R28].

## 8.3 Practical regression harness design (PromptWare OS‑style)

Recommended harness layers:

1. **Kernel conformance tests:** instruction hierarchy behaviors, refusal policies.
2. **Skill unit tests:** given task archetypes, the skill should trigger the right syscalls.
3. **Tool contract tests:** parse `--help`, generate test suites (GUIde‑style) [R15].
4. **End‑to‑end agent tests:** GAIA/AgentBench‑like scenarios.
5. **Security regression:** prompt injection suites (see §9).

---

# 9. Security woven into every primitive (English‑at‑Ring‑0 threat model)

## 9.1 Threat framing: “data becomes instructions”

Indirect prompt injection research shows LLM‑integrated applications blur the line between data and instructions; retrieved content can function like arbitrary code, steering tool calls and exfiltration [R24]. This is precisely the ring‑0 concern: if prompts are code, **untrusted text is untrusted code**.

## 9.2 Why defenses fail: adaptive attackers

“The Attacker Moves Second” demonstrates that many proposed defenses collapse against adaptive optimization and human red teaming—often reaching >90% attack success in their evaluation setup [R27]. This suggests PromptWare OS builders should treat prompt injection as an **expected failure mode**, not an edge case.

## 9.3 Instruction hierarchy as a kernel primitive

The Instruction Hierarchy paper proposes explicit priority levels and shows training models to respect hierarchy improves robustness with minimal capability loss [R26]. This maps naturally onto PromptWare OS:

* hierarchy should live in `os/kernel.md` as non‑negotiable semantics,
* tool outputs and retrieved docs should be low‑privilege by default.

## 9.4 Per‑primitive security checklist (practical)

### Bootloader

* Allowlist roots; pin versions; verify integrity.

### Kernel

* Explicit hierarchy; refuse kernel mutation; isolate untrusted retrieved content.

### Skills

* Treat skill docs as code; require review; run unit tests.

### Tools

* Require `--help` parsing + contract tests; validate arguments; sandbox.

### Memory

* Prevent memory poisoning; separate private/shared; redact.

### Evaluation

* Continuous red teaming (HarmBench) [R28]; dynamic evaluation (DyVal) [R17].

---

# 10. Where PromptWare OS is *distinct* (and where research is thin)

![PromptWare OS](/assets/2025/12-promptware-os-prompt-driven-architecture-pda/stacked-blocks.webp)

## 10.1 Distinctive contribution: URL‑addressable, bootable promptware with Unix discipline

Many frameworks implement agent loops, but PromptWare OS is unusually explicit about:

* bootable configuration,
* microkernel syscalls,
* tool ephemerality + workspace sanctity,
* skills as shared libraries.

Academic work tends to present these as “systems engineering choices,” not as an OS spec. PromptWare OS is a **naming + packaging** move: turning tacit patterns into a consistent contract.

## 10.2 Research gaps that matter to builders

1. **Semantics of pure NL system logic:** how to ensure the same prose yields stable behavior across model versions.
2. **Compositionality of skill docs:** how to avoid prompt interference when multiple skills are loaded.
3. **Typed tool contracts from natural language help text:** GUIde‑style pipelines are early but promising [R15].
4. **Security‑aware memory:** OS‑style paging exists (MemGPT) [R12], but poisoning prevention is under‑specified.
5. **Benchmark alignment:** existing benchmarks measure agent success, but not “kernel conformance” or “skill modularity.”

---

# 11. Reading curriculum (zero → “OS‑grade promptware builder”)

This curriculum is ordered to build *systems intuition* first, then add rigor.

## Week 0 — Orientation: what counts as “promptware”

* [H01] When English Hits Ring 0 (Ship.Fail) — motivation & framing.
* [R03] Trustworthy FMware challenges — why SE must change.

**Deliverable:** write your own definition of PDA + threat model in 1 page.

## Week 1 — Prompt programming foundations (minimal structure)

* [R06] ReAct — the canonical agent loop.
* [R14] Generative Agents — persona + memory + planning loops.
* [R11] Reflexion — learning by storing language feedback.
* [R09] HuggingGPT — language as orchestrator for tools/models.

**Deliverable:** implement a ReAct‑style loop with (1) tool calls, (2) reflection memory.

## Week 2 — Modular architectures: skills, routing, tool selection

* [R07] MRKL — modular routing to tools/knowledge.
* [R08] Toolformer — when/how to call tools.
* [R10] Gorilla — doc‑grounded API calling, tool drift.
* [R19] LLM Agent Survey — taxonomy of agent components.

**Deliverable:** build a skill registry that maps intents → tool specs.

## Week 3 — Memory as an OS service

* [R12] MemGPT — virtual context, tiered memory, interrupts.
* [R22] Self‑RAG — retrieve/generate/critique adaptively.
* [R23] CRAG — retrieval evaluator + corrective actions.

**Deliverable:** add paging rules: what to keep hot vs cold; when to ingest skills.

## Week 4 — PromptWare OS proper (boot/kernel/init)

* [H02] One Line to Boot (Ship.Fail) — bootloader + persona/bookshelf.
* [H03] Unix Architecture (Ship.Fail) — microkernel syscalls, zero‑footprint tools.
* [R02] Prompt management at scale — what breaks in the wild.
* [I02] Repo‑stored prompts — operational practices.

**Deliverable:** publish a minimal PromptWare OS‑style repo and a boot block.

## Week 5 — Evaluation harnesses (make it real)

* [R16] PromptBench — prompt evaluation library.
* [R17] DyVal — dynamic evaluation protocol.
* [R20] AgentBench — agent evaluation.
* [R21] GAIA — real‑world assistant benchmark.

**Deliverable:** create CI that runs skill unit tests + end‑to‑end tasks.

## Week 6 — Security: ring‑0 hardening

* [R24] Indirect prompt injection — data as arbitrary code.
* [R26] Instruction hierarchy — privileged instructions.
* [R27] Attacker Moves Second — adaptive attacks break defenses.
* [R28] HarmBench — standardized red teaming evaluation.

**Deliverable:** build a prompt injection regression suite for your kernel + tools.

## Week 7 — Frontier: search, graphs, and societyware

* [R05] Tree of Thoughts — branching reasoning/search.
* [R06a] Graph of Thoughts — graph composition.
* [R06b] LATS — MCTS + value + reflection.
* (Optional) Multi‑agent orchestration: AutoGen [R29], MetaGPT [R30].

**Deliverable:** implement a planning mode switch: linear ReAct vs ToT search.

---

# 12. Annotated bibliography (selected)

> Notes: We bias toward papers that (a) treat language as executable control, and (b) inform PromptWare OS primitives.

## PromptWare OS core (Ship.Fail)

* **[H01]** H. Li, *When English Hits Ring 0: A Field Guide to PromptWare*, Ship.Fail (Dec 03, 2025).
  **Why it matters:** frames prompts as software “source,” introduces ring‑0 privilege framing.
* **[H02]** H. Li, *Promptware OS: One Line to Boot Your AI Co‑Founders*, Ship.Fail (Dec 08, 2025).
  **Why it matters:** bootloader + persona/bookshelf decomposition.
* **[H03]** H. Li, *Promptware OS Ships: Unix Architecture for Your AI Co‑Founders*, Ship.Fail (Dec 13, 2025).
  **Why it matters:** microkernel + syscalls + zero‑footprint tools.

## Prompt programming / orchestration

* **[R01]** L. Beurer‑Kellner et al., *Prompting Is Programming: A Query Language for Large Language Models (LMQL)*, arXiv:2212.06094 (2022) / ACM DL (2023).
  **Relevance:** shows what must be made explicit (constraints/control flow) to compile prompts.

## Agent runtime patterns (pure NL emphasis)

* **[R06]** S. Yao et al., *ReAct: Synergizing Reasoning and Acting in Language Models*, arXiv:2210.03629 / ICLR 2023.
  **Relevance:** canonical loop; prompts define action selection + observation integration.
* **[R05]** S. Yao et al., *Tree of Thoughts*, arXiv:2305.10601 (2023).
  **Relevance:** prompting as search; maps to kernel “planning syscall.”
* **[R06a]** M. Besta et al., *Graph of Thoughts*, arXiv:2308.09687 (2023/2024).
  **Relevance:** graph composition of “thought modules.”
* **[R06b]** A. Zhou et al., *Language Agent Tree Search (LATS)*, arXiv:2310.04406 (2023/2024).
  **Relevance:** deliberate planning with value + reflection.
* **[R11]** N. Shinn et al., *Reflexion*, arXiv:2303.11366 / NeurIPS 2023.
  **Relevance:** learning via language memory, not weights.
* **[R14]** J. S. Park et al., *Generative Agents*, arXiv:2304.03442 / CHI 2023.
  **Relevance:** persona + memory + reflection loops.

## Tool use and interfaces

* **[R07]** E. Karpas et al., *MRKL Systems*, arXiv:2205.00445 (2022).
  **Relevance:** modular tool routing; aligns with skills/tools decomposition.
* **[R08]** T. Schick et al., *Toolformer*, arXiv:2302.04761 (2023).
  **Relevance:** learn when/how to call APIs.
* **[R10]** S. G. Patil et al., *Gorilla: LLM Connected with Massive APIs*, arXiv:2305.15334 (2023) / NeurIPS 2024.
  **Relevance:** retrieval of docs to prevent hallucinated tool usage; handles tool drift.
* **[R13]** J. Yang et al., *SWE‑agent: Agent‑Computer Interfaces Enable Automated Software Engineering*, arXiv:2405.15793 / NeurIPS 2024.
  **Relevance:** interface design matters; PromptWare OS tools are an ACI.
* **[R15]** *The Command Line GUIde: Graphical Interfaces from Man Pages*, arXiv:2510.01453 (2025).
  **Relevance:** converting help/man pages into safer interfaces via tests + LLM agents.
* **[R18]** Z. Guo et al., *StableToolBench*, arXiv:2403.07714 / ACL Findings 2024.
  **Relevance:** evaluation stability under API change; mirrors boot reproducibility needs.

## Memory as an OS service

* **[R12]** C. Packer et al., *MemGPT: Towards LLMs as Operating Systems*, arXiv:2310.08560 (2023/2024).
  **Relevance:** explicit paging/tiers/interrupts; strongest bridge to PromptWare OS.
* **[R22]** A. Asai et al., *Self‑RAG*, arXiv:2310.11511 (2023).
  **Relevance:** adaptive retrieval + critique; maps to `os_ingest` policy.
* **[R23]** S. Q. Yan et al., *Corrective RAG (CRAG)*, arXiv:2401.15884 (2024).
  **Relevance:** retrieval evaluator triggers corrective actions.

## Promptware engineering & evaluation harnesses

* **[R04]** Z. Chen et al., *Software Engineering for LLM Prompt Development*, arXiv:2503.02400 (2025).
  **Relevance:** lifecycle framing + research agenda.
* **[R02]** H. Li et al., *Understanding Prompt Management in GitHub Repositories*, arXiv:2509.12421 (2025).
  **Relevance:** empirical evidence of prompt sprawl and QA gaps.
* **[R03]** A. E. Hassan et al., *Trustworthy FMware challenges*, arXiv:2402.15943 / ACM (2024).
  **Relevance:** enterprise SE constraints.
* **[R16]** K. Zhu et al., *PromptBench*, arXiv:2312.07910 / JMLR 2024.
  **Relevance:** prompt eval library; adversarial prompt attacks.
* **[R17]** K. Zhu et al., *DyVal*, arXiv:2309.17167 / ICLR 2024.
  **Relevance:** dynamic evaluation to avoid contamination.
* **[R20]** X. Liu et al., *AgentBench*, arXiv:2308.03688 / ICLR 2024.
  **Relevance:** evaluate agents in interactive envs.
* **[R21]** G. Mialon et al., *GAIA benchmark*, arXiv:2311.12983 / ICLR 2024.
  **Relevance:** tool use realism.

## Security (prompt injection, hierarchy, adaptive attacks)

* **[R24]** K. Greshake et al., *Indirect Prompt Injection*, arXiv:2302.12173 / ACM CCS 2023.
  **Relevance:** untrusted data behaves like arbitrary code.
* **[R26]** E. Wallace et al., *The Instruction Hierarchy*, arXiv:2404.13208 (2024).
  **Relevance:** privileged instruction following; kernel policy.
* **[R27]** M. Nasr et al., *The Attacker Moves Second*, arXiv:2510.09023 (Oct 2025).
  **Relevance:** adaptive attacks bypass many defenses.
* **[R28]** *HarmBench*, arXiv:2402.04249 (2024).
  **Relevance:** standardized safety red teaming evaluation.

## Industry / operational references

* **[I02]** GitHub Docs, *Storing prompts in GitHub repositories* (GitHub Models documentation).
* **[I03]** Wired, *Generative AI’s Biggest Security Flaw Is Not Easy to Fix* (prompt injection context).
* **[I04]** OpenAI Docs, *Prompt engineering / role hierarchy* (developer vs user messages).

---

# Appendix A — Reference links

> (Links are intentionally consolidated here; inline citations use IDs above.)

## Ship.Fail posts

* [H01] [https://ship.fail/blog/2025/12/03/when-english-hits-ring-0/](https://ship.fail/blog/2025/12/03/when-english-hits-ring-0/)
* [H02] [https://ship.fail/blog/2025/12/08/promptware-os-one-line-boot-ai-native-co-founders/](https://ship.fail/blog/2025/12/08/promptware-os-one-line-boot-ai-native-co-founders/)
* [H03] [https://ship.fail/blog/2025/12/13/promptware-os-ships-unix-architecture-for-ai-co-founders/](https://ship.fail/blog/2025/12/13/promptware-os-ships-unix-architecture-for-ai-co-founders/)

## Key research papers (selected)

* [R01] [https://arxiv.org/abs/2212.06094](https://arxiv.org/abs/2212.06094)
* [R06] [https://arxiv.org/abs/2210.03629](https://arxiv.org/abs/2210.03629)
* [R07] [https://arxiv.org/abs/2205.00445](https://arxiv.org/abs/2205.00445)
* [R08] [https://arxiv.org/abs/2302.04761](https://arxiv.org/abs/2302.04761)
* [R10] [https://arxiv.org/abs/2305.15334](https://arxiv.org/abs/2305.15334)
* [R11] [https://arxiv.org/abs/2303.11366](https://arxiv.org/abs/2303.11366)
* [R12] [https://arxiv.org/abs/2310.08560](https://arxiv.org/abs/2310.08560)
* [R13] [https://arxiv.org/abs/2405.15793](https://arxiv.org/abs/2405.15793)
* [R14] [https://arxiv.org/abs/2304.03442](https://arxiv.org/abs/2304.03442)
* [R16] [https://arxiv.org/abs/2312.07910](https://arxiv.org/abs/2312.07910)
* [R17] [https://arxiv.org/abs/2309.17167](https://arxiv.org/abs/2309.17167)
* [R18] [https://arxiv.org/abs/2403.07714](https://arxiv.org/abs/2403.07714)
* [R20] [https://arxiv.org/abs/2308.03688](https://arxiv.org/abs/2308.03688)
* [R21] [https://arxiv.org/abs/2311.12983](https://arxiv.org/abs/2311.12983)
* [R22] [https://arxiv.org/abs/2310.11511](https://arxiv.org/abs/2310.11511)
* [R23] [https://arxiv.org/abs/2401.15884](https://arxiv.org/abs/2401.15884)
* [R24] [https://arxiv.org/abs/2302.12173](https://arxiv.org/abs/2302.12173)
* [R26] [https://arxiv.org/abs/2404.13208](https://arxiv.org/abs/2404.13208)
* [R27] [https://arxiv.org/abs/2510.09023](https://arxiv.org/abs/2510.09023)

## Industry docs

* [I02] [https://docs.github.com/en/github-models/use-github-models/storing-prompts-in-github-repositories](https://docs.github.com/en/github-models/use-github-models/storing-prompts-in-github-repositories)
