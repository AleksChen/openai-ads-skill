# openai-ads-skill

![openai-ads-skill README hero](../skills/openai-ads-skill/assets/readme-hero.png)

一个可复用、以安全为先的 **Agent Skill**，用于规划、校验和操作 OpenAI Ads / ChatGPT Ads 广告系列。它适用于 Codex、Claude Code，以及任何可以加载 Agent Skills 的 agent runtime。

> 先规划和校验。只创建暂停态实体。没有明确人工审批，绝不花钱。

**语言:** [English](../README.md) · [中文](README.zh-CN.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

## 为什么用这个 Skill

让 AI agent 直接操作广告账户风险很高：一次误操作就可能花掉真实预算，或让不合规广告上线。这个 Skill 在 agent 与广告账户之间加入硬性护栏，让你获得自动化能力，同时**不丢失控制权**。

- **默认不花钱。** 所有创建操作都应产出暂停态实体。启用以及任何影响花费的动作，都必须经过独立、明确的审批步骤。
- **错误在花钱之前被拦下。** 在本地校验广告计划：字段、政策门禁、落地页、图片、预算、账户匹配和审批状态。
- **执行边界清晰。** 计划、校验、暂停创建、启用、监控和 onboarding 是分离模式，agent 不能悄悄从“起草”滑向“花钱”。
- **跨 agent runtime 一致。** 同一个 Skill，在 Codex、Claude Code 和其他 Agent Skill runtime 中保持一致行为。
- **API 优先，必要时才用 UI。** 读写优先使用 OpenAI Ads Advertiser API。浏览器自动化只用于 onboarding 或 beta-only 的能力空缺。
- **零运行时依赖。** 纯 Node.js 18+，没有需要审计的第三方 npm 包。

## Skill 能做什么

加载后，这个 Skill 为 agent 提供覆盖 ChatGPT Ads 生命周期的门禁式工作流：

- **把 brief 变成结构化广告计划。** 生成标准 `openai_ads_plan.v1`，覆盖 campaign、ad group、对话式 `context_hints`、出价、预算与创意。
- **执行深度预检。** 校验必填字段、计划 schema、micros 预算下限、出价配置、创意限制、`http(s)` 落地页、账户匹配和审批状态。
- **强制政策与安全门禁。** 在任何写入、启用、送审或影响预算的动作之前执行契约和门禁检查。
- **在写入能力开启后安全创建。** 目标写入路径是暂停态 campaign -> 暂停态 ad group -> 暂停态 ad，启用始终作为独立审批步骤。
- **读取状态和洞察。** 当前支持只读账户检查，并面向账户状态、实体状态、审核状态和效果洞察的监控能力设计。
- **报告证据边界。** 每次运行都应说明哪些结论来自本地校验、API 回读、UI 观察或假设。

当前实现已提供 `plan_only`、`validate_only` 和只读账户检查。写操作尚未实现，这是有意为之。

## 安装

**前置要求:** [Git](https://git-scm.com/downloads) 和 [Node.js 18+](https://nodejs.org/)。

这个仓库现在同时支持 plugin 安装和直接 Agent Skill 安装。plugin metadata 位于根目录的 `.codex-plugin/` 与 `.claude-plugin/`；实际 Skill 位于 `skills/openai-ads-skill/`。

### Codex / Claude Code plugin

- Codex plugin manifest: `.codex-plugin/plugin.json`
- Claude plugin metadata: `.claude-plugin/plugin.json` 与 `.claude-plugin/marketplace.json`

发布到官方或团队 marketplace 后，应通过对应 runtime 的插件管理器安装。

### 直接 Agent Skill 安装

如果 runtime 只支持加载包含 `SKILL.md` 的目录，请安装嵌套的 `skills/openai-ads-skill/` 文件夹。目录名必须保持 `openai-ads-skill`。

#### macOS / Linux

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p "$HOME/.agents/skills"
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill "$HOME/.agents/skills/openai-ads-skill"
```

#### Windows PowerShell

```powershell
git clone https://github.com/AleksChen/openai-ads-skill.git "$env:TEMP\openai-ads-skill"
New-Item -ItemType Directory -Force "$HOME\.agents\skills" | Out-Null
Copy-Item -Recurse -Force "$env:TEMP\openai-ads-skill\skills\openai-ads-skill" "$HOME\.agents\skills\openai-ads-skill"
```

### 项目级安装

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

若 agent 未立即识别，请重启 agent。

## 使用

在 agent 中按名称调用：

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

辅助脚本需要 Node.js 18+，不需要额外安装包。在仓库根目录下运行：

```bash
npm test

# 本地校验广告计划。不会调用 API。
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

只读账户检查需要 Ads API key：

```bash
# macOS / Linux
OPENAI_ADS_API_KEY="your_ads_api_key" node skills/openai-ads-skill/scripts/check-account.mjs
```

```powershell
# Windows PowerShell
$env:OPENAI_ADS_API_KEY="your_ads_api_key"; node skills/openai-ads-skill/scripts/check-account.mjs
```

```bat
:: Windows 命令提示符
set OPENAI_ADS_API_KEY=your_ads_api_key
node skills/openai-ads-skill/scripts/check-account.mjs
```

账户检查只调用 `GET /ad_account`。它不会创建、更新、暂停、启用或归档任何对象。

## 模式

| 模式 | 作用 | 对账户的影响 |
| --- | --- | --- |
| `plan_only` | 生成结构化广告计划和检查清单 | 不访问账户 |
| `validate_only` | 校验字段、政策门禁、落地页、图片、预算和审批 | 不访问账户 |
| `create_paused` | 目标写入模式：创建暂停态 campaign / ad group / ad | 写入，仅暂停态 |
| `enable` | 在明确审批和审核检查后启用实体 | 启用 |
| `monitor` | 读取账户、实体状态、审核状态和洞察 | 只读 |
| `ui_onboarding` | 通过浏览器辅助 onboarding 或 beta-only 设置 | 仅设置 |

## 贡献

开发工具链仅使用可选的 npm 开发依赖来管理 Git hooks；运行时脚本仍保持零依赖。

```bash
npm install
npm test
```

提交信息遵循 [Conventional Commits](https://www.conventionalcommits.org/)。格式、scope 与 hook 说明见 [CONTRIBUTING.md](../CONTRIBUTING.md)。

## 安全

- **绝不要提交 Ads API key。** 凡是粘贴进聊天、日志、issue、PR 或截图的 key，都应轮换。
- **启用必须独立于创建。** 这是核心设计边界。
- **本地校验只是本地证据。** 远端状态必须通过 API 回读确认。
- **拿不准就停止写入。** 阻断一次写入好过打开未经审批的花费路径。

## License

MIT
