# OpenAI Ads Skill Gates

Use this file before any OpenAI Ads write, activation, review submission, or budget-affecting action.

## Hard Gates

Block execution when any hard gate fails.

### Account Gate

- API key is present only in environment or secret store.
- `GET /ad_account` succeeds.
- Returned account matches the expected ad account or the user explicitly accepts the current account.
- Account setup, billing, logo/favicon, and business verification are complete for delivery. If unknown, allow `create_paused` only and block `enable`.

### Provenance Gate

- Plan is structured and versioned.
- `approval_ref` exists for any write mode.
- The brief identifies product, landing page, objective, countries, budget, and owner.
- The user explicitly selected `create_paused` or `enable`; never infer write mode from a general request.

### Policy Gate

Reject or require remediation for:

- prohibited or restricted categories that are not explicitly approved
- misleading claims, unsupported outcomes, fake endorsements, or deceptive comparisons
- offensive, discriminatory, harassing, or shocking language/images
- ChatGPT/OpenAI UI imitation
- mismatch between ad copy, image, landing page, and actual product
- landing pages introducing disallowed content not present in the creative

For sensitive or regulated products, mark as high risk and do not proceed without explicit human review.

### Creative Gate

- Title is specific, useful, and within the API limit.
- Body adds information and stays within the API limit.
- Title/body are not merely keyword stuffing.
- At least two meaningfully different creative variants are recommended for a real launch, though not required for a minimal test.
- Image is simple, relevant, not overly abstract, and aligned with the message.
- Image URL or file is accessible before upload.

### Landing Page Gate

- URL is valid and reachable.
- Page matches the product and claim in the ad.
- Page does not block OpenAI user agents when crawled for ad review.
- Tracking parameters are static and do not break page access.
- Page has a clear user path to the promised action.

### Budget And Bid Gate

- Daily or lifetime budget is explicit.
- Daily budget meets the current platform floor.
- Bids are in micros and sane for the objective.
- Click objective uses CPC-style bidding; views/reach uses CPM/impression-style bidding.
- Activation is blocked if the user has not acknowledged spend risk.

### State Gate

- Default create status is `paused`.
- `active` creation requires explicit user request and all enable gates.
- `enable` requires remote IDs, successful readback, and no rejected review state.
- Do not activate a campaign if parent/child objects would remain inconsistent.

## Warning Gates

Warn but do not automatically block:

- only one creative in an ad group
- very broad context hints
- no conversion measurement
- missing UTM convention
- no post-launch monitoring window
- budget too low for learning
- end date too short for meaningful data

## UI Automation Gates

Browser/UI automation may help with setup, but must stop for confirmation before:

- submitting business verification
- entering or changing payment data
- creating an API key if the user has not requested it
- submitting a campaign for review
- activating or resuming delivery

## Evidence Labels

Use these labels in reports:

- `local_plan`: generated plan only.
- `local_validation`: local checks passed or failed.
- `api_connectivity`: `GET /ad_account` or other read succeeded.
- `api_write`: remote mutation returned success.
- `api_readback`: remote entity state was retrieved after write.
- `ui_observation`: browser-visible state was inspected.
- `assumption`: not verified in this run.
