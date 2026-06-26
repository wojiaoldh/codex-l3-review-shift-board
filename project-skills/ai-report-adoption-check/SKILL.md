---
name: ai-report-adoption-check
description: Check whether an AI review report was truly adopted in a QA quality-left-shift workflow. Use when verifying AI report adoption, distinguishing viewed versus adopted suggestions, preparing leader-facing metrics, or preventing weak evidence from inflating AI contribution.
---

# AI Report Adoption Check

## Purpose

Prevent "AI generated a report" from being mistaken as "AI created business value".

## Inputs

- AI review report or summary
- Requirement review notes
- PRD change notes
- Owner or reviewer confirmation
- Before/after requirement changes

## Process

1. Identify the AI report suggestions.
2. Match each suggestion to a PRD change, review decision, added risk, or rejected item.
3. Classify each suggestion:
   - Adopted
   - Partially adopted
   - Viewed only
   - Rejected
   - Unknown
4. Count adoption only when there is a clear trace.
5. Mark uncertain items for human confirmation.

## Output

Return:

- Adoption conclusion
- Suggestion mapping table
- Evidence list
- Human confirmation points
- Metric recommendation

## Verification

- Do not count "viewed" as "adopted".
- Do not count model self-report as evidence.
- Require PRD diff, review note, owner confirmation, or equivalent evidence.
- Mark unclear items as pending.
