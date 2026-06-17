export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "docs",
        "style",
        "refactor",
        "perf",
        "test",
        "build",
        "ci",
        "chore",
        "revert",
      ],
    ],
    "scope-enum": [
      1,
      "always",
      [
        "skill",
        "validator",
        "scripts",
        "schema",
        "docs",
        "plugin",
        "deps",
        "hooks",
        "repo",
      ],
    ],
    "subject-case": [0],
    "body-max-line-length": [2, "always", 100],
  },
};
