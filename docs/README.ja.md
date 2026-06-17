# openai-ads-skill

![openai-ads-skill README hero](../skills/openai-ads-skill/assets/readme-hero.png)

OpenAI Ads / ChatGPT Ads キャンペーンを計画、検証、運用するための、安全性を重視した再利用可能な **Agent Skill** です。Codex、Claude Code、Agent Skills を読み込める任意の agent runtime で使うことを想定しています。

> まず計画し、検証する。作成するのは一時停止状態のエンティティだけ。明示的な人間の承認なしに予算を使わない。

**言語:** [English](../README.md) · [中文](README.zh-CN.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

## この Skill が必要な理由

AI agent に広告アカウントを直接操作させるのは危険です。1 回の誤った呼び出しで実際の予算が使われたり、ポリシーに合わない広告が公開されたりする可能性があります。この Skill は agent と広告アカウントの間に強いガードレールを置き、**制御を失わずに自動化**できるようにします。

- **デフォルトで予算を守る。** 作成操作は一時停止状態のエンティティを生成する設計です。配信開始や支出に影響する操作には、別個の明示的な承認が必要です。
- **費用が発生する前にミスを検出する。** フィールド、ポリシーゲート、ランディングページ、画像、予算、アカウント一致、承認状態をローカルで検証します。
- **実行境界が明確。** 計画、検証、一時停止作成、有効化、監視、onboarding は分離されたモードです。
- **複数 runtime で同じ挙動。** Codex、Claude Code、その他の Agent Skill runtime で同じ Skill と同じ安全境界を使えます。
- **API 優先、UI は必要な場合のみ。** 読み書きは OpenAI Ads Advertiser API を優先します。ブラウザ自動化は onboarding や beta-only の不足を補う場合に限定します。
- **runtime 依存なし。** Node.js 18+ のみで動作し、監査対象となるサードパーティ npm パッケージはありません。

## Skill の機能

読み込まれると、この Skill は ChatGPT Ads ライフサイクル向けのゲート付きワークフローを agent に提供します。

- **brief を構造化された広告計画に変換。** campaign、ad group、会話型 `context_hints`、入札、予算、クリエイティブを含む `openai_ads_plan.v1` を作成します。
- **詳細な事前検証。** 必須フィールド、plan schema、micros 形式の予算下限、入札設定、クリエイティブ制限、`http(s)` landing URL、アカウント一致、承認状態を確認します。
- **ポリシーと安全ゲートを強制。** 書き込み、有効化、審査送信、予算に影響する操作の前に契約と gate を確認します。
- **書き込み対応時も安全に作成。** 想定される書き込み経路は paused campaign -> paused ad group -> paused ad で、有効化は承認専用の別ステップです。
- **状態と insights を読み取り。** 現在は読み取り専用のアカウント確認を提供し、アカウント状態、エンティティ状態、審査状態、パフォーマンス insights の監視を想定しています。
- **証拠の境界を報告。** 各実行で、ローカル検証、API readback、UI 観察、仮定のどれに基づくかを明示します。

現在の実装には `plan_only`、`validate_only`、読み取り専用のアカウント確認が含まれています。書き込み操作は意図的にまだ実装していません。

## インストール

**前提条件:** [Git](https://git-scm.com/downloads) と [Node.js 18+](https://nodejs.org/)。

このリポジトリは plugin インストールと直接 Agent Skill インストールの両方をサポートします。plugin metadata は `.codex-plugin/` と `.claude-plugin/` にあり、実際の Skill は `skills/openai-ads-skill/` にあります。

### Codex / Claude Code plugin

- Codex manifest: `.codex-plugin/plugin.json`
- Claude metadata: `.claude-plugin/plugin.json` と `.claude-plugin/marketplace.json`

公式またはチーム marketplace に公開した後は、各 runtime の plugin manager からインストールします。

### 直接 Agent Skill インストール

`SKILL.md` を含むディレクトリだけを読み込む runtime では、ネストされた `skills/openai-ads-skill/` をインストールしてください。最終ディレクトリ名は `openai-ads-skill` のままにします。

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

### プロジェクト単位のインストール

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

Skill がすぐ表示されない場合は agent を再起動します。

## 使い方

agent から名前で呼び出します。

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

補助スクリプトには Node.js 18+ が必要です。追加パッケージは不要です。リポジトリルートから実行します。

```bash
npm test

# 広告計画をローカルで検証します。API 呼び出しは行いません。
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

読み取り専用のアカウント確認には Ads API key が必要です。

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
node skills/openai-ads-skill/scripts/check-account.mjs
```

アカウント確認は `GET /ad_account` のみを呼び出します。作成、更新、一時停止、有効化、アーカイブは行いません。

## モード

| Mode | 内容 | アカウントへの影響 |
| --- | --- | --- |
| `plan_only` | 構造化された広告計画とチェックリストを作成 | アカウントアクセスなし |
| `validate_only` | フィールド、ポリシー、landing page、画像、予算、承認を検証 | アカウントアクセスなし |
| `create_paused` | paused campaign / ad group / ad を作成する想定モード | 書き込み、一時停止のみ |
| `enable` | 明示的な承認と審査確認後に有効化 | 有効化 |
| `monitor` | アカウント、エンティティ、審査状態、insights を読み取り | 読み取り専用 |
| `ui_onboarding` | onboarding や beta-only の不足をブラウザで補助 | 設定のみ |

## 安全性

- **Ads API key を絶対に commit しないでください。** チャット、ログ、issue、PR、スクリーンショットに貼った key は必ずローテーションしてください。
- **有効化は常に作成とは別です。** これは中心的な設計境界です。
- **ローカル検証はローカル証拠にすぎません。** リモート状態は API readback で確認する必要があります。
- **迷ったら書き込みを止めてください。** 未承認の支出経路を開くより、書き込みをブロックする方が安全です。

## License

MIT
