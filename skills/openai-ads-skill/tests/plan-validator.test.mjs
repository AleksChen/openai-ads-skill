import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import { loadPlan, validatePlan } from "../lib/plan-validator.mjs";

const FIXTURES_DIR = join(dirname(fileURLToPath(import.meta.url)), "fixtures");

test("valid fixture passes validation", async () => {
  const plan = await loadPlan(join(FIXTURES_DIR, "valid-plan.json"));
  const result = validatePlan(plan);

  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("invalid fixture returns actionable errors", async () => {
  const plan = await loadPlan(join(FIXTURES_DIR, "invalid-plan.json"));
  const result = validatePlan(plan);

  assert.equal(result.valid, false);
  assert.ok(result.errors.some((error) => error.includes("approval_ref")));
  assert.ok(result.errors.some((error) => error.includes("campaign.name")));
  assert.ok(result.errors.some((error) => error.includes("daily_spend_limit_micros")));
  assert.ok(result.errors.some((error) => error.includes("target_url")));
});

test("missing file returns a friendly error", async () => {
  await assert.rejects(
    () => loadPlan(join(FIXTURES_DIR, "missing.json")),
    (error) => {
      assert.equal(error.name, "FriendlyError");
      assert.match(error.message, /not found/);
      assert.ok(error.suggestions.length > 0);
      return true;
    },
  );
});

test("invalid JSON returns a friendly error", async () => {
  await assert.rejects(
    () => loadPlan(join(FIXTURES_DIR, "malformed.json")),
    (error) => {
      assert.equal(error.name, "FriendlyError");
      assert.match(error.message, /not valid JSON/);
      assert.ok(error.suggestions.length > 0);
      return true;
    },
  );
});

function basePlan() {
  return {
    schema_version: "openai_ads_plan.v1",
    mode: "validate_only",
    provenance: { source: "test" },
    ad_account: { expected_id: "adacct_example" },
    campaign: {
      name: "Boundary campaign",
      objective: "clicks",
      status: "paused",
      budget: { daily_spend_limit_micros: 1000000 },
      targeting: { locations: { countries: ["US"] } },
    },
    ad_groups: [
      {
        name: "Core intent",
        status: "paused",
        context_hints: ["hint one", "hint two"],
        bidding_config: { billing_event_type: "click", max_bid_micros: 4000000 },
        ads: [
          {
            name: "Card A",
            status: "paused",
            creative: {
              type: "chat_card",
              title: "Plan work faster",
              body: "Short and clear body copy.",
              target_url: "https://example.com/a",
              image_url: "https://example.com/a.png",
            },
          },
          {
            name: "Card B",
            status: "paused",
            creative: {
              type: "chat_card",
              title: "Ship clearer plans",
              body: "Another clear body copy.",
              target_url: "https://example.com/b",
              image_url: "https://example.com/b.png",
            },
          },
        ],
      },
    ],
  };
}

test("base plan is valid with no errors", () => {
  const result = validatePlan(basePlan());
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("daily budget exactly at floor passes", () => {
  const plan = basePlan();
  plan.campaign.budget = { daily_spend_limit_micros: 1000000 };
  const result = validatePlan(plan);
  assert.equal(result.valid, true, JSON.stringify(result.errors));
});

test("daily budget one micro below floor fails", () => {
  const plan = basePlan();
  plan.campaign.budget = { daily_spend_limit_micros: 999999 };
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("daily_spend_limit_micros")));
});

test("creative title over 50 characters fails", () => {
  const plan = basePlan();
  plan.ad_groups[0].ads[0].creative.title = "x".repeat(51);
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("title must be 50 characters or fewer")));
});

test("creative body over 100 characters fails", () => {
  const plan = basePlan();
  plan.ad_groups[0].ads[0].creative.body = "x".repeat(101);
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("body must be 100 characters or fewer")));
});

test("non-http(s) target_url fails", () => {
  const plan = basePlan();
  plan.ad_groups[0].ads[0].creative.target_url = "ftp://example.com/file";
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("must be an http or https URL")));
});

test("illegal mode value fails", () => {
  const plan = basePlan();
  plan.mode = "launch_now";
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("mode must be one of")));
});

test("wrong schema_version fails", () => {
  const plan = basePlan();
  plan.schema_version = "openai_ads_plan.v2";
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("schema_version must be openai_ads_plan.v1")));
});

test("write mode without approval_ref fails", () => {
  const plan = basePlan();
  plan.mode = "create_paused";
  const result = validatePlan(plan);
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.includes("approval_ref is required for write modes")));
});
