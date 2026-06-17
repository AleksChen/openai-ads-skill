# OpenAI Ads Skill Contracts

Use this file when preparing or validating campaign specs and API payloads.

## Canonical Campaign Plan

```json
{
  "schema_version": "openai_ads_plan.v1",
  "mode": "plan_only",
  "provenance": {
    "source": "user_brief",
    "approval_ref": null,
    "created_by": "codex"
  },
  "ad_account": {
    "expected_id": "act_...",
    "expected_name": "Example Ads",
    "country": "US",
    "currency_code": "USD",
    "timezone": "America/Los_Angeles"
  },
  "campaign": {
    "name": "Example spring launch",
    "description": "Optional",
    "objective": "clicks",
    "status": "paused",
    "start_time": null,
    "end_time": null,
    "budget": {
      "daily_spend_limit_micros": 100000000
    },
    "targeting": {
      "locations": {
        "countries": ["US"]
      }
    }
  },
  "ad_groups": [
    {
      "name": "Core intent",
      "description": "Optional",
      "status": "paused",
      "context_hints": [
        "user conversations about choosing project management software"
      ],
      "bidding_config": {
        "billing_event_type": "click",
        "max_bid_micros": 4000000
      },
      "ads": [
        {
          "name": "Core benefit card A",
          "status": "paused",
          "creative": {
            "type": "chat_card",
            "title": "Plan projects faster",
            "body": "Organize tasks, docs, and owners in one shared workspace.",
            "target_url": "https://example.com/project-planning?utm_source=chatgpt_ads",
            "image_url": "https://example.com/assets/ad-card.png",
            "file_id": null
          }
        }
      ]
    }
  ]
}
```

## API Mapping

- `ad_account.expected_id` validates `GET /ad_account`.
- `campaign` maps to `POST /campaigns`.
- `campaign.targeting.locations.countries` maps to API country targeting.
- `ad_groups[]` maps to `POST /ad_groups` with `campaign_id`.
- `ad_groups[].context_hints` are broad conversational intent hints, not exact-match keywords.
- `ad_groups[].bidding_config.billing_event_type` is `click` or `impression`.
- `ad_groups[].ads[].creative.image_url` is uploaded with `POST /upload`; returned `file_id` is used in `POST /ads`.
- `ads[].creative.type` is normally `chat_card`; product-feed campaigns may use product-related types only when explicitly planned.

## Required Local Fields

Before execution, require:

- `schema_version`
- `mode`
- `provenance.source`
- `provenance.approval_ref` for any write mode
- `ad_account.expected_id` or explicit user acceptance of current API account
- `campaign.name`
- `campaign.objective`
- `campaign.status`
- `campaign.budget`
- at least one ad group
- every ad group `name`, `status`, `context_hints`, `bidding_config`
- every ad `name`, `status`, `creative.type`, `creative.title`, `creative.body`, `creative.target_url`, and either `image_url` or `file_id`

## Field Constraints

Mirror current OpenAPI and Help Center constraints:

- Campaign name: at least 3 non-whitespace characters; keep under 1000 characters.
- Campaign status on create: `active` or `paused`; default to `paused`.
- Update status may include `archived`.
- Campaign budget can use `daily_spend_limit_micros` or `lifetime_spend_limit_micros`; enforce at least the API minimum and the Help Center daily campaign floor when using daily budgets.
- Ad group status on create: `active` or `paused`; default to `paused`.
- Bidding event: `click` or `impression`.
- Max bid: positive micros value.
- Creative type: `chat_card` by default.
- Creative title: 3 to 50 characters; recommended 16 to 24 characters for bulk-style quality.
- Creative body: max 100 characters; recommended 32 to 48 characters for bulk-style quality.
- Target URL: max 2048 characters and must be valid, reachable, and aligned to the ad.
- Image: publicly accessible for remote upload or available as multipart file; square image, max 1200 x 1200 for bulk-style quality.
- Review status after creation: `in_review`, `approved`, or `rejected`.

## Execution Receipt

Each write must produce a receipt:

```json
{
  "schema_version": "openai_ads_receipt.v1",
  "plan_hash": "sha256:...",
  "mode": "create_paused",
  "started_at": "2026-06-15T00:00:00Z",
  "finished_at": "2026-06-15T00:00:00Z",
  "ad_account": {
    "id": "act_...",
    "name": "Example Ads"
  },
  "created": {
    "campaign_id": "cmpn_...",
    "ad_group_ids": ["adgrp_..."],
    "ad_ids": ["ad_..."],
    "file_ids": ["file_..."]
  },
  "statuses": {
    "campaign": "paused",
    "ad_groups": {"adgrp_...": "paused"},
    "ads": {"ad_...": {"status": "paused", "review_status": "in_review"}}
  },
  "evidence": {
    "local_validation": "passed",
    "api_readback": "passed",
    "ui_observation": null
  },
  "errors": []
}
```

## Idempotency Rules

- Use a stable plan hash and campaign/ad group/ad names to detect duplicate create attempts.
- Before retrying after partial failure, read back remote entities by returned IDs when possible.
- Do not archive or overwrite duplicates automatically.
- On duplicate ambiguity, stop and ask for an explicit cleanup or reuse decision.
