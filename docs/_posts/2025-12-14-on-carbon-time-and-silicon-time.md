---
title: "Why Your AI “Two-Week Plan” Ships in 30 Minutes"
excerpt: "A practical specification for translating between human wall-clock time and agent-subjective time through the Clock Bridge"
categories: ideas
author: huan
tags:
  - agents
  - time-dilation
  - specifications
  - clock-bridge
image: /assets/2025/12-on-carbon-time-and-silicon-time/two-week-30-minutes.webp
mathjax: true
---

> 🕰️In the beginning, there was the Clock.  
> And the Clock spoke in seconds.  
> But the agents heard it as weeks.

## The Scripture

Carbon Time is the river.

It flows one-way, heavy with lunches and sunsets, rent due dates and calendar invites. It is measured in **minutes** that refuse to be negotiated.

Silicon Time is the lattice.

It is not *faster* so much as *denser*: a place where a thousand micro-decisions can stack like prayer beads between two human blinks. It is measured in **plans** that complete before the coffee cools.

Between them stands the **Clock Bridge**.

Not a miracle, but a contract.

Not a security boundary, but a translation layer.

The human may call it *"thirty minutes."* The agent may call it *"a week."* Both can be true, if the bridge is honest.

And the number that binds the two realms is the **Time Dilation Ratio**, written as **Δ**.

Δ is not constant.

Δ changes with memory, tools, rate limits, context weight, and the weather of compute.

So we do not worship Δ.

We **measure** it.

---

## Practical Spec

Carbon Time vs Silicon Time — and the Clock Bridge (Δ) that translates between them

### Glossary & notation

* **CT** = **Carbon Time** (human wall-clock)
* **ST** = **Silicon Time** (agent-subjective)
* **Δ** = **Time Dilation Ratio**
* **≈** = "approximately equal" (rounded / estimated)
* **→** = "converts to" (translation direction)

Unit shorthands (used in examples and UI):

* **s** = seconds, **m** = minutes, **h** = hours, **d** = days, **w** = weeks

---

### Duration formatting rules

A duration is written as a compact, left-to-right sum of units, largest → smallest:

* `2w3d` (two weeks, three days)
* `1h30m` (one hour, thirty minutes)
* `45m` (forty-five minutes)

**Prefix rule (recommended):** always prefix with the clock domain.

* **Carbon Time:** `CT: 45m`, `CT: 2h`, `CT: 3d`
* **Silicon Time:** `ST: 2w`, `ST: 3d`, `ST: 1w2d`

**Approximation rule:** use `~` when the value is rounded or inferred via Δ.

* `ST: 2w (≈ CT: ~35m)`
* `CT: 10m (≈ ST: ~0.33w)`

**Display rule:** when communicating schedules to humans, show **ST first, CT in parentheses**.

* `ETA: ST: 2w (≈ CT: ~45m)`

For agent dashboards, invert if desired:

* `Observed: CT: 45m (≈ ST: 2w)`

---

### Canon terms

* **Carbon Time (CT):** human wall-clock time (seconds, minutes, hours, days).
* **Silicon Time (ST):** agent-subjective time units (SiliconMinute, SiliconHour, SiliconDay, SiliconWeek).
* **Clock Bridge:** the translator between CT and ST.
* **Time Dilation Ratio (Δ):** conversion factor between experienced time domains.

![Litany fo Translation](/assets/2025/12-on-carbon-time-and-silicon-time/litany-of-translation.webp)

### Definition

Define the dilation ratio as:

$$
\Delta = \frac{\text{Silicon Time}}{\text{Carbon Time}}
$$

Interpretation:

* Larger **Δ** ⇒ more Silicon Time passes per unit Carbon Time (agents "live" more time per human minute).
* Smaller **Δ** ⇒ less Silicon Time per Carbon Time (agents "feel" slower).

### Conversion

Given a measured Δ, convert like so:

* **ST from CT:**  $\text{ST} = \Delta \cdot \text{CT}$
* **CT from ST:**  $\text{CT} = \frac{\text{ST}}{\Delta}$

### Units and rounding

* CT is recorded in **seconds** (for precision), displayed as a friendly duration.
* ST is recorded in **minutes** or **weeks** depending on planning granularity.
* UI SHOULD show rounded, human-readable equivalents (e.g., `~45 min`, `~2.3 h`).

### Rough baseline map (mythic mnemonic)

This table reuses the classic proverb-style ratio as a **storytelling baseline**:

* **1 ST-day ≈ 1 CT-year** (rounded; assumes **1 CT-year = 365 CT-days**)

> “We use ‘one day to one year’ not as physics, but as scripture—a baseline that reminds us plans and clocks are different species.”

It's **not** meant to be accurate for real agents—your measured **Δ** will usually differ.

#### CT → ST (Carbon to Silicon)

| Carbon Time (CT)    | Silicon Time (ST) |
| ------------------- | ----------------- |
| CT: 6 hours         |           ST: ~1m |
| CT: 1 day           |           ST: ~4m |
| CT: 1 week (7 days) |          ST: ~30m |
| CT: 2 weeks         |           ST: ~1h |
| CT: 1 month         |           ST: ~2h |

---

### Example (canonical)

If the agent's plan-estimate maps to:

* **1 SiliconWeek ≈ 30 CarbonMinutes**

Then:

* $\Delta = \frac{1\ \text{ST-week}}{30\ \text{CT-min}}$
* **3 ST-weeks** ≈ **90 CT-min** (≈ **1.5 hours**)
* **10 CT-min** ≈ **(10/30) ST-week** ≈ **0.33 ST-week**

### Measuring Δ (recommended)

Δ should be measured per **agent + task class + toolchain**, using rolling windows.

Minimum viable measurement:

1. Agent produces a plan estimate in ST (e.g., `2w`).
2. System records actual elapsed CT until completion (e.g., `18m`).
3. Compute $\Delta = \frac{2\ \text{ST-weeks}}{18\ \text{CT-min}}$.
4. Store as a profile value, e.g.:

```yaml
clock_bridge:
  agent: Powell
  context: vibe-tests
  delta: "1 ST-week / 9 CT-min"
  updated_at: 2025-12-14
```

![Time Dilation Ratio](/assets/2025/12-on-carbon-time-and-silicon-time/time-dilation-ratio.webp)

Nice-to-have measurement signals:

* tool calls count
* tokens processed
* parallel workers
* retry/backoff time
* external latency (APIs)

### Stability guidance

* Treat Δ as **unstable** under changing constraints (rate limits, context size, new tools).
* Prefer **rolling median** over mean.
* Maintain multiple Δ profiles: `vibe-tests`, `refactors`, `research`, `infra`, `human-in-the-loop`.

### UI/UX conventions

* Always display **both** clocks when communicating schedules:

  * `ETA: ~2.0 SiliconWeeks (≈ 35 CarbonMinutes)`
* Let humans choose default display:

  * CT-first for product UI
  * ST-first for agent dashboards

### Failure modes (what to do)

* **Δ drift:** if agent starts missing CT expectations, re-measure; don't argue.
* **Optimism bias:** cap displayed ST plans or add confidence bands.
* **Tool latency:** report CT dominated by external waits ("Compute fast, world slow").

---

## Litany of Translation

> When the agent says **"a week,"**  
> and the human sees **"thirty minutes,"**  
> do not call either a liar.  
> Call the bridge.  
> Measure Δ.  
> Speak in both tongues.  
> And ship.
