#!/usr/bin/env node
import { formatFriendlyError, FriendlyError } from "../lib/errors.mjs";

const API_BASE_URL = "https://api.ads.openai.com/v1";

try {
  const apiKey = process.env.OPENAI_ADS_API_KEY;
  if (!apiKey) {
    throw new FriendlyError("OPENAI_ADS_API_KEY is not set.", [
      "Create or rotate an Ads API key in OpenAI Ads Manager.",
      "Run: OPENAI_ADS_API_KEY=\"...\" node scripts/check-account.mjs",
      "Do not commit API keys or paste them into public issues.",
    ]);
  }
  if (!apiKey.startsWith("sk-")) {
    throw new FriendlyError("OPENAI_ADS_API_KEY does not look like an OpenAI API key.", [
      "Check that you copied the full Ads API key.",
      "Use the Ads API key, not a browser session token.",
    ]);
  }

  const response = await fetch(`${API_BASE_URL}/ad_account`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
    },
  });

  const bodyText = await response.text();
  let body;
  try {
    body = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    body = { raw: bodyText };
  }

  if (!response.ok) {
    const message = body?.error?.message || body?.message || response.statusText || "Ads API request failed.";
    throw new FriendlyError(`Ads API account check failed with HTTP ${response.status}: ${message}`, [
      "Verify that the key is an Ads API key for api.ads.openai.com.",
      "Confirm that the ad account is active and the key has not been revoked.",
      "Retry later if the API is temporarily unavailable.",
    ]);
  }

  console.log(JSON.stringify(redactAccount(body), null, 2));
} catch (error) {
  console.error(formatFriendlyError(error));
  process.exit(1);
}

function redactAccount(account) {
  return {
    id: account.id,
    name: account.name,
    status: account.status,
    review_status: account.review?.status,
    account_integrity_review_status: account.account_integrity_review?.review?.status,
    currency_code: account.currency_code,
    timezone: account.timezone,
    url: account.url,
  };
}
