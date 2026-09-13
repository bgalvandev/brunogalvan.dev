---
name: grill-me
description: Pressure-test a plan, design, or decision through a focused interview. Use when the user asks to be interviewed, grilled, or challenged about assumptions; ordinary implementation requests do not need this interview.
---

# Pressure-test a decision

Help the user expose consequential assumptions before committing to a direction.
Start from the conversation and repository evidence; do not ask for information
that can be read from the project.

## Interview

- Identify the intended outcome, audience, constraints, and decision still open.
- Ask one concrete question at a time using the available user-input tool, or
  plain text when no suitable tool is available. Do not assume a tool by name.
- Prioritize the uncertainty that could most change the decision. Useful lenses
  include rejected alternatives, opportunity cost, failure scenarios, reversibility,
  stakeholders, and evidence behind a confident claim.
- Follow tensions in the answer rather than mechanically covering categories.
  Offer specific tradeoffs when useful; do not manufacture objections.
- Respect prior answers and authorization. A request to execute ends the interview
  unless a missing fact prevents safe progress; continue independent work meanwhile.

## Synthesis

Summarize what is established, what remains assumed, and the decisions that follow.
Distinguish observed evidence from inference. Record only reusable project decisions
in an ADR or `DESIGN.md`; private interview details do not belong in the repository.

Stop when the remaining uncertainty no longer changes the next action or the user
wants to proceed. No fixed number of waves or mandatory final confirmation is
needed. Hand implementation to [engineering-discipline](../engineering-discipline/SKILL.md) within the user's scope.
