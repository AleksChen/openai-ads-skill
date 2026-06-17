---
name: openai-ads-skill
description: Plan, validate, and monitor OpenAI Ads / ChatGPT Ads campaigns through the OpenAI Ads Manager Beta and Advertiser API. Use when an agent needs a reusable skill or workflow for OpenAI Ads, campaign/ad group/ad payloads, creative asset uploads, policy and quality checks, Ads API calls, review status inspection, insights reporting, or Ads Manager UI automation where API coverage or onboarding requires it. Current implementation ships local planning, local validation, and a read-only account check; create, update, and activation write paths are gated and not yet implemented.
license: MIT
---

# OpenAI Ads Skill

Use this skill for gated OpenAI Ads work in any agent runtime that supports Agent Skills-style directories. Prefer the OpenAI Ads Advertiser API for campaign creation and management. Use browser/UI automation only for onboarding, API key setup, beta-only fields not exposed by the API, or confirming UI behavior.

## Workflow

1. Establish the requested mode: `plan_only`, `validate_only`, `create_paused`, `enable`, `monitor`, or `ui_onboarding`.
2. Load [references/architecture.md](references/architecture.md) when designing or changing the system architecture.
3. Load [references/contracts.md](references/contracts.md) when creating or validating campaign specs, API payloads, or bulk plans.
4. Load [references/gates.md](references/gates.md) before any write, activation, review submission, or budget-affecting action.
5. For current API details, refresh official OpenAI docs first:
   - `https://developers.openai.com/ads/api-overview`
   - `https://developers.openai.com/ads/api-quickstart`
   - `https://developers.openai.com/ads/openapi.json`
   - `https://help.openai.com/en/collections/20001223-chatgpt-ads`
6. Never create or activate ads from a raw theme alone. Require a structured campaign plan, source/provenance, advertiser approval, policy gate result, and explicit execution mode.
7. Default all create operations to `paused` unless the user explicitly requests activation and the activation gate passes.
8. Keep local validation evidence separate from live Ads API evidence. A valid plan proves only local readiness; a live API response proves remote write/readback.

## Local Tools

- Validate a plan: `node scripts/validate-plan.mjs path/to/plan.json`
- Check Ads API account connectivity: `OPENAI_ADS_API_KEY=... node scripts/check-account.mjs`
- Run tests: `npm test`

The account check is read-only and calls only `GET /ad_account`.

## Execution Boundary

- `plan_only`: Generate a campaign plan and validation checklist. Do not call Ads APIs.
- `validate_only`: Validate fields, policy risk, landing pages, images, budget, and account prerequisites. Do not call Ads APIs.
- `create_paused`: Upload assets, create campaign, create ad groups, create ads, and leave objects paused.
- `enable`: Activate existing campaign, ad group, or ad only after explicit approval and review-state checks.
- `monitor`: Read ad account, entity state, review status, and insights. Do not mutate.
- `ui_onboarding`: Use browser automation for setup screens, API key provisioning, or beta UI discovery; do not submit sensitive verification, billing, or launch steps without user confirmation.

## Required Reporting

Every run should report:

- Requested mode and write boundary.
- Inputs used and missing inputs.
- Gate results with hard failures separated from warnings.
- Exact entities planned, created, activated, or read.
- Evidence boundary: local validation, API response, UI observation, or unverified assumption.
