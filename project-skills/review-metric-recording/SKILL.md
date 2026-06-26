---
name: review-metric-recording
description: Record one quality-left-shift review sample for the ReviewShift Board app. Use when adding or checking a requirement review record with review duration, AI report usage, PRD return status, shifted issue count, delivery pass status, evidence, and human confirmation points.
---

# Review Metric Recording

## Purpose

Turn one requirement review into a structured metric sample that can be used in the quality-left-shift dashboard.

## Inputs

- Requirement name
- Owner or group
- Review stage
- Review duration
- Whether an AI report was used
- Whether AI suggestions were adopted
- Whether the PRD was returned
- Number of issues found before delivery
- Delivery review result
- Evidence
- Human confirmation points

## Process

1. Confirm whether this is a real requirement sample or a draft sample.
2. Record review duration in minutes.
3. Mark AI report status as unused, used-pending, or used-adopted.
4. Record PRD return status and reason.
5. Count only issues found before later delivery/testing stages as shifted issues.
6. Add evidence for every important judgment.
7. Add human confirmation points when causality or adoption is unclear.

## Output

Produce a record with fields matching the dashboard data model:

- title
- owner
- stage
- risk
- reviewMinutes
- aiUsed
- aiAdopted
- prdReturned
- prdReturnReason
- shiftedIssues
- deliveryPassed
- evidence
- humanConfirm

## Verification

- The record has at least one evidence item.
- AI adoption is not marked true unless there is review or owner confirmation.
- PRD return reason is filled when `prdReturned` is true.
- Unclear causality is listed under human confirmation.
