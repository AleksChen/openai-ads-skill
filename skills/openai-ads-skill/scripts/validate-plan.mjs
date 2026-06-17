#!/usr/bin/env node
import { formatFriendlyError } from "../lib/errors.mjs";
import { loadPlan, validatePlan } from "../lib/plan-validator.mjs";

try {
  const filePath = process.argv[2];
  const plan = await loadPlan(filePath);
  const result = validatePlan(plan);

  if (!result.valid) {
    console.error("Campaign plan validation failed.");
    console.error("");
    console.error("Errors:");
    for (const error of result.errors) console.error(`- ${error}`);
    if (result.warnings.length) {
      console.error("");
      console.error("Warnings:");
      for (const warning of result.warnings) console.error(`- ${warning}`);
    }
    console.error("");
    console.error("Fix the errors above and rerun validation.");
    process.exit(1);
  }

  console.log("Campaign plan validation passed.");
  if (result.warnings.length) {
    console.log("");
    console.log("Warnings:");
    for (const warning of result.warnings) console.log(`- ${warning}`);
  }
} catch (error) {
  console.error(formatFriendlyError(error));
  process.exit(1);
}
