# openai-ads-skill

![openai-ads-skill README hero](skills/openai-ads-skill/assets/readme-hero.png)

A reusable, safety-first **Agent Skill** for planning, validating, and operating OpenAI Ads / ChatGPT Ads campaigns. It is designed for Codex, Claude Code, and any agent runtime that can load Agent Skills.

> Plan and validate first. Create only paused entities. Never spend money without explicit human approval.

**Languages:** [English](README.md) · [中文](docs/README.zh-CN.md) · [Español](docs/README.es.md) · [日本語](docs/README.ja.md) · [한국어](docs/README.ko.md) · [العربية](docs/README.ar.md)

## Why this skill

Running ad campaigns from an AI agent is risky: one wrong call can spend real money or push a non-compliant ad live. This skill puts hard guardrails between an agent and your ad account, so you get automation **without losing control**.

- **Money-safe by default.** Every create operation produces paused entities. Activation and any spend-affecting action require an explicit, separate approval step.
- **Catch mistakes before they cost you.** Validate campaign plans locally: fields, policy gates, landing pages, images, budgets, account match, and approval state.
- **Clear execution boundaries.** Plan, validate, create-paused, enable, monitor, and onboarding are separated modes, so an agent cannot quietly cross from drafting to spending.
- **Works across agent runtimes.** Same skill, same behavior across Codex, Claude Code, and other Agent Skill runtimes.
- **API-first, UI only when needed.** Uses the OpenAI Ads Advertiser API for reads and writes. Browser automation is reserved for onboarding or beta-only gaps.
- **Zero runtime dependencies.** Pure Node.js 18+, with no third-party npm packages to audit.

## What the skill does

Once loaded, the skill gives your agent a gated workflow for the ChatGPT Ads lifecycle:

- **Turns a brief into a structured campaign plan.** Drafts a canonical `openai_ads_plan.v1` spec covering campaign, ad groups, conversational `context_hints`, bidding, budget, and creatives.
- **Runs deep pre-flight validation.** Checks required fields, plan schema, budget floors in micros, bid config, creative limits, `http(s)` landing URLs, account match, and approval state.
- **Enforces policy and safety gates.** Runs contract and gate checks before any write, activation, review submission, or budget-affecting action.
- **Creates safely when write support is enabled.** The intended write path is paused campaign -> paused ad group -> paused ad, with activation kept as a separate approval-only step.
- **Reads state and insights.** Supports read-only account checks and is designed for monitoring account state, entity state, review status, and performance insights.
- **Reports evidence boundaries.** Each run should state what was proven locally, by API readback, by UI observation, or by assumption.

Current implementation ships `plan_only`, `validate_only`, and a read-only account check. Write operations are intentionally not implemented yet.

## Install

**Prerequisites:** [Git](https://git-scm.com/downloads) and [Node.js 18+](https://nodejs.org/).

This repository supports two installation styles:

| Style | Best for | Entry point |
| --- | --- | --- |
| Plugin install | Codex / Claude Code plugin managers and marketplace-style installs | `.codex-plugin/plugin.json`, `.claude-plugin/plugin.json` |
| Direct skill install | Generic Agent Skill runtimes that load a folder containing `SKILL.md` | `skills/openai-ads-skill/` |

### Codex plugin

This repository includes a Codex plugin manifest:

```text
.codex-plugin/plugin.json
```

For local development, clone the repository and install it through a local or personal Codex plugin marketplace. The manifest points Codex to:

```json
{
  "skills": "./skills/"
}
```

That is the same layout used by marketplace-style skill plugins: the plugin is installed once, then the runtime discovers every skill under `./skills/`.

### Claude Code plugin

This repository includes Claude plugin metadata:

```text
.claude-plugin/plugin.json
.claude-plugin/marketplace.json
```

For a development marketplace, register this repository's Claude marketplace and install `openai-ads-skill` from it. If you publish to an official or team marketplace later, keep the plugin name unchanged.

### Generic Agent Skill install

If your runtime only supports raw Agent Skill directories, install the nested skill folder, not the repository root. The folder name must stay `openai-ads-skill`, because it matches the `name` in `SKILL.md`.

#### macOS / Linux

```bash
# User-level skill install
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p "$HOME/.agents/skills"
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill "$HOME/.agents/skills/openai-ads-skill"
```

#### Windows PowerShell

```powershell
# User-level skill install
git clone https://github.com/AleksChen/openai-ads-skill.git "$env:TEMP\openai-ads-skill"
New-Item -ItemType Directory -Force "$HOME\.agents\skills" | Out-Null
Copy-Item -Recurse -Force "$env:TEMP\openai-ads-skill\skills\openai-ads-skill" "$HOME\.agents\skills\openai-ads-skill"
```

#### Windows Command Prompt

```bat
:: User-level skill install
git clone https://github.com/AleksChen/openai-ads-skill.git "%TEMP%\openai-ads-skill"
mkdir "%USERPROFILE%\.agents\skills"
xcopy /E /I /Y "%TEMP%\openai-ads-skill\skills\openai-ads-skill" "%USERPROFILE%\.agents\skills\openai-ads-skill"
```

### Project-scoped skill install

Clone into your project's skill search path instead of your home directory:

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

For other Agent Skill runtimes, clone this repository into a skill directory that the runtime loads. Restart the agent if the skill does not appear immediately.

## Repository layout

```text
.codex-plugin/plugin.json          # Codex plugin manifest
.claude-plugin/plugin.json         # Claude plugin manifest
.claude-plugin/marketplace.json    # Claude development marketplace
commitlint.config.mjs              # Commit message lint rules
.husky/                            # Git hooks (pre-commit, commit-msg)
CONTRIBUTING.md                    # Contribution and commit conventions
skills/openai-ads-skill/SKILL.md   # Agent Skill entry point
skills/openai-ads-skill/scripts/   # Local validation and read-only API helpers
skills/openai-ads-skill/lib/       # Shared validator code
skills/openai-ads-skill/tests/     # Node test suite
```

## Use

Invoke the skill by name from your agent:

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

The helper scripts need Node.js 18+ and no extra packages. Run them from the repository root:

```bash
npm test

# Validate a campaign plan locally. This makes no API calls.
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

The read-only account check needs an Ads API key:

```bash
# macOS / Linux
OPENAI_ADS_API_KEY="your_ads_api_key" node skills/openai-ads-skill/scripts/check-account.mjs
```

```powershell
# Windows PowerShell
$env:OPENAI_ADS_API_KEY="your_ads_api_key"; node skills/openai-ads-skill/scripts/check-account.mjs
```

```bat
:: Windows Command Prompt
set OPENAI_ADS_API_KEY=your_ads_api_key
node skills\openai-ads-skill\scripts\check-account.mjs
```

The account check calls only `GET /ad_account`. It never creates, updates, pauses, activates, or archives anything.

## Modes

| Mode | What it does | Account impact |
| --- | --- | --- |
| `plan_only` | Build a structured campaign plan and checklist | No account access |
| `validate_only` | Check fields, policy gates, landing pages, images, budget, approval | No account access |
| `create_paused` | Intended write mode for paused campaign / ad group / ad creation | Write, paused only |
| `enable` | Intended activation mode after explicit approval and review checks | Activation |
| `monitor` | Read account, entity state, review status, and insights | Read only |
| `ui_onboarding` | Browser-assisted setup for onboarding or beta-only gaps | Setup only |

## Contributing

Development tooling uses optional npm devDependencies for Git hooks only. Runtime scripts remain dependency-free.

```bash
npm install
npm test
```

Commit messages follow [Conventional Commits](https://www.conventionalcommits.org/). See [CONTRIBUTING.md](CONTRIBUTING.md) for format, scopes, and hook behavior.

## Safety

- **Never commit Ads API keys.** Rotate any key pasted into chat, logs, issues, PRs, or screenshots.
- **Activation is always separate from creation.** This is a core design boundary.
- **Local validation is local evidence only.** Remote state requires API readback.
- **When in doubt, stop before write.** A blocked write is better than an unapproved spend path.

## License

MIT
