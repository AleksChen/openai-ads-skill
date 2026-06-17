import { readFile } from "node:fs/promises";
import { FriendlyError } from "./errors.mjs";

const WRITE_MODES = new Set(["create_paused", "enable"]);
const ALLOWED_MODES = new Set([
  "plan_only",
  "validate_only",
  "create_paused",
  "enable",
  "monitor",
  "ui_onboarding",
]);
const ALLOWED_STATUSES = new Set(["active", "paused"]);
const ALLOWED_BILLING_EVENTS = new Set(["click", "impression"]);
const ALLOWED_CREATIVE_TYPES = new Set(["chat_card", "product_ad_template"]);

export async function loadPlan(filePath) {
  if (!filePath) {
    throw new FriendlyError("Missing campaign plan path.", [
      "Run: node scripts/validate-plan.mjs path/to/plan.json",
      "Use tests/fixtures/valid-plan.json as a minimal example.",
    ]);
  }

  let raw;
  try {
    raw = await readFile(filePath, "utf8");
  } catch (error) {
    if (error.code === "ENOENT") {
      throw new FriendlyError(`Campaign plan not found: ${filePath}`, [
        "Check the file path.",
        "Run from the repository root or pass an absolute path.",
      ]);
    }
    throw error;
  }

  try {
    return JSON.parse(raw);
  } catch {
    throw new FriendlyError(`Campaign plan is not valid JSON: ${filePath}`, [
      "Remove comments and trailing commas.",
      "Validate the file with a JSON parser before retrying.",
    ]);
  }
}

export function validatePlan(plan) {
  const errors = [];
  const warnings = [];

  requiredString(errors, plan, "schema_version");
  if (plan.schema_version && plan.schema_version !== "openai_ads_plan.v1") {
    errors.push("schema_version must be openai_ads_plan.v1.");
  }

  requiredString(errors, plan, "mode");
  if (plan.mode && !ALLOWED_MODES.has(plan.mode)) {
    errors.push(`mode must be one of: ${Array.from(ALLOWED_MODES).join(", ")}.`);
  }

  requiredObject(errors, plan, "provenance");
  if (plan.provenance) {
    requiredString(errors, plan.provenance, "source", "provenance.source");
    if (WRITE_MODES.has(plan.mode) && !nonEmptyString(plan.provenance.approval_ref)) {
      errors.push("provenance.approval_ref is required for write modes.");
    }
  }

  requiredObject(errors, plan, "ad_account");
  if (plan.ad_account) {
    if (!nonEmptyString(plan.ad_account.expected_id)) {
      warnings.push("ad_account.expected_id is missing; execution must explicitly accept the current API account.");
    }
  }

  requiredObject(errors, plan, "campaign");
  if (plan.campaign) {
    validateCampaign(errors, warnings, plan.campaign);
  }

  if (!Array.isArray(plan.ad_groups) || plan.ad_groups.length === 0) {
    errors.push("ad_groups must contain at least one ad group.");
  } else {
    plan.ad_groups.forEach((adGroup, index) => {
      validateAdGroup(errors, warnings, adGroup, `ad_groups[${index}]`);
    });
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

function validateCampaign(errors, warnings, campaign) {
  requiredString(errors, campaign, "name", "campaign.name");
  if (nonEmptyString(campaign.name) && campaign.name.trim().length < 3) {
    errors.push("campaign.name must be at least 3 characters.");
  }

  requiredString(errors, campaign, "objective", "campaign.objective");
  requiredString(errors, campaign, "status", "campaign.status");
  if (campaign.status && !ALLOWED_STATUSES.has(campaign.status)) {
    errors.push("campaign.status must be active or paused.");
  }
  if (campaign.status === "active") {
    warnings.push("campaign.status is active; open-source tooling recommends creating campaigns paused first.");
  }

  requiredObject(errors, campaign, "budget", "campaign.budget");
  if (campaign.budget) {
    const daily = campaign.budget.daily_spend_limit_micros;
    const lifetime = campaign.budget.lifetime_spend_limit_micros;
    if (!Number.isInteger(daily) && !Number.isInteger(lifetime)) {
      errors.push("campaign.budget must include daily_spend_limit_micros or lifetime_spend_limit_micros as an integer.");
    }
    for (const [name, value] of Object.entries({ daily_spend_limit_micros: daily, lifetime_spend_limit_micros: lifetime })) {
      if (value !== undefined && (!Number.isInteger(value) || value < 1000000)) {
        errors.push(`campaign.budget.${name} must be an integer >= 1000000 micros.`);
      }
    }
  }

  if (!campaign.targeting) {
    warnings.push("campaign.targeting is missing; broad delivery may be unsuitable for a launch.");
  }
}

function validateAdGroup(errors, warnings, adGroup, path) {
  requiredString(errors, adGroup, "name", `${path}.name`);
  requiredString(errors, adGroup, "status", `${path}.status`);
  if (adGroup.status && !ALLOWED_STATUSES.has(adGroup.status)) {
    errors.push(`${path}.status must be active or paused.`);
  }

  if (!Array.isArray(adGroup.context_hints) || adGroup.context_hints.length === 0) {
    errors.push(`${path}.context_hints must contain at least one conversational intent hint.`);
  } else if (adGroup.context_hints.length < 2) {
    warnings.push(`${path}.context_hints has only one hint; add more intent coverage before launch.`);
  }

  requiredObject(errors, adGroup, "bidding_config", `${path}.bidding_config`);
  if (adGroup.bidding_config) {
    const billing = adGroup.bidding_config.billing_event_type;
    if (!ALLOWED_BILLING_EVENTS.has(billing)) {
      errors.push(`${path}.bidding_config.billing_event_type must be click or impression.`);
    }
    if (!Number.isInteger(adGroup.bidding_config.max_bid_micros) || adGroup.bidding_config.max_bid_micros < 1) {
      errors.push(`${path}.bidding_config.max_bid_micros must be a positive integer.`);
    }
  }

  if (!Array.isArray(adGroup.ads) || adGroup.ads.length === 0) {
    errors.push(`${path}.ads must contain at least one ad.`);
  } else {
    if (adGroup.ads.length === 1) {
      warnings.push(`${path}.ads has one creative; two or more variants are recommended.`);
    }
    adGroup.ads.forEach((ad, index) => validateAd(errors, ad, `${path}.ads[${index}]`));
  }
}

function validateAd(errors, ad, path) {
  requiredString(errors, ad, "name", `${path}.name`);
  requiredString(errors, ad, "status", `${path}.status`);
  if (ad.status && !ALLOWED_STATUSES.has(ad.status)) {
    errors.push(`${path}.status must be active or paused.`);
  }

  requiredObject(errors, ad, "creative", `${path}.creative`);
  if (!ad.creative) return;

  const creative = ad.creative;
  if (!ALLOWED_CREATIVE_TYPES.has(creative.type)) {
    errors.push(`${path}.creative.type must be chat_card or product_ad_template.`);
  }
  requiredString(errors, creative, "title", `${path}.creative.title`);
  requiredString(errors, creative, "body", `${path}.creative.body`);
  requiredString(errors, creative, "target_url", `${path}.creative.target_url`);

  if (nonEmptyString(creative.title)) {
    if (creative.title.trim().length < 3) errors.push(`${path}.creative.title must be at least 3 characters.`);
    if (creative.title.length > 50) errors.push(`${path}.creative.title must be 50 characters or fewer.`);
  }
  if (nonEmptyString(creative.body) && creative.body.length > 100) {
    errors.push(`${path}.creative.body must be 100 characters or fewer.`);
  }
  if (nonEmptyString(creative.target_url) && !isHttpUrl(creative.target_url)) {
    errors.push(`${path}.creative.target_url must be an http or https URL.`);
  }
  if (!nonEmptyString(creative.image_url) && !nonEmptyString(creative.file_id)) {
    errors.push(`${path}.creative requires image_url or file_id.`);
  }
}

function requiredObject(errors, object, key, label = key) {
  if (!object || typeof object[key] !== "object" || object[key] === null || Array.isArray(object[key])) {
    errors.push(`${label} is required and must be an object.`);
  }
}

function requiredString(errors, object, key, label = key) {
  if (!nonEmptyString(object?.[key])) {
    errors.push(`${label} is required and must be a non-empty string.`);
  }
}

function nonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
