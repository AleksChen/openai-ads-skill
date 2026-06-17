# Contributing

Thank you for contributing to `openai-ads-skill`. This project uses [Conventional Commits](https://www.conventionalcommits.org/) and Git hooks to keep history readable and safe to review.

## Development setup

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git
cd openai-ads-skill
npm install
```

`npm install` runs `husky` through the `prepare` script and installs local Git hooks.

Runtime scripts (`validate-plan.mjs`, `check-account.mjs`, tests) stay dependency-free. Dev-only packages (`husky`, `commitlint`) are used only for local Git workflow checks.

## Commit message format

Use this structure:

```text
<type>(<scope>): <subject>

[optional body]

[optional footer(s)]
```

### Types

| Type | When to use |
| --- | --- |
| `feat` | New user-facing capability or skill behavior |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting or whitespace, no logic change |
| `refactor` | Code change without feature or bugfix intent |
| `perf` | Performance improvement |
| `test` | Add or update tests |
| `build` | Build tooling or packaging |
| `ci` | CI configuration |
| `chore` | Maintenance that does not fit above |
| `revert` | Revert a previous commit |

### Scopes

Scopes are recommended but optional. Common values:

| Scope | Area |
| --- | --- |
| `skill` | `SKILL.md`, references, agent metadata |
| `validator` | `lib/plan-validator.mjs` and validation rules |
| `scripts` | CLI scripts under `scripts/` |
| `schema` | JSON schema and fixtures |
| `docs` | README and translated docs |
| `plugin` | Codex / Claude plugin manifests |
| `deps` | npm dependency changes |
| `hooks` | Husky / commitlint configuration |
| `repo` | Repository-wide housekeeping |

### Subject rules

- Use the imperative mood: `add validator`, not `added validator`
- Do not end the subject with a period
- Keep the subject at or under 72 characters
- Explain **why** in the body when the change is not obvious

### Examples

```text
feat(validator): enforce minimum daily budget in micros

fix(scripts): redact account fields in check-account output

docs: add contributing and commit conventions

test(validator): cover title length boundary cases

chore(hooks): add commitlint and husky
```

### Breaking changes

For breaking changes, add `!` after the type/scope or include a footer:

```text
feat(validator)!: require approval_ref for all write modes

BREAKING CHANGE: create_paused plans without approval_ref now fail validation.
```

## Git hooks

| Hook | Behavior |
| --- | --- |
| `pre-commit` | Runs `npm test` |
| `commit-msg` | Validates the commit message with commitlint |

Check a message manually before committing:

```bash
echo "feat(validator): add budget floor test" | npx commitlint
```

Bypass hooks only when necessary and never for routine commits:

```bash
git commit --no-verify -m "..."
```

## Pull request checklist

- [ ] Commit messages follow Conventional Commits
- [ ] `npm test` passes locally
- [ ] Changes match the requested mode boundaries (no silent write paths)
- [ ] No API keys, secrets, or account identifiers in code, docs, or fixtures
- [ ] README or `SKILL.md` updated when user-facing behavior changes

## Safety expectations

This repository is safety-first:

- Do not add write/activation paths without explicit gating and documentation
- Do not commit `.env` files or real Ads API keys
- Keep local validation evidence separate from live API evidence in docs and reports

## Questions

Open a GitHub issue for bugs, feature requests, or design questions before large changes.
