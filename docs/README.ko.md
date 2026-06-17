# openai-ads-skill

![openai-ads-skill README hero](../skills/openai-ads-skill/assets/readme-hero.png)

OpenAI Ads / ChatGPT Ads 캠페인을 계획, 검증, 운영하기 위한 재사용 가능한 안전 우선 **Agent Skill**입니다. Codex, Claude Code, 그리고 Agent Skills를 로드할 수 있는 모든 agent runtime을 대상으로 합니다.

> 먼저 계획하고 검증합니다. 생성은 일시 중지 상태로만 합니다. 명시적인 사람의 승인 없이는 예산을 쓰지 않습니다.

**언어:** [English](../README.md) · [中文](README.zh-CN.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

## 이 Skill이 필요한 이유

AI agent가 광고 계정을 직접 조작하는 것은 위험합니다. 잘못된 호출 하나로 실제 예산이 지출되거나 정책에 맞지 않는 광고가 게시될 수 있습니다. 이 Skill은 agent와 광고 계정 사이에 강한 가드레일을 두어, **통제권을 잃지 않는 자동화**를 가능하게 합니다.

- **기본적으로 예산을 보호합니다.** 생성 작업은 일시 중지 상태의 엔터티를 만들도록 설계됩니다. 활성화와 지출에 영향을 주는 작업은 별도의 명시적 승인이 필요합니다.
- **비용이 발생하기 전에 오류를 잡습니다.** 필드, 정책 게이트, 랜딩 페이지, 이미지, 예산, 계정 일치, 승인 상태를 로컬에서 검증합니다.
- **실행 경계가 명확합니다.** 계획, 검증, 일시 중지 생성, 활성화, 모니터링, onboarding은 분리된 모드입니다.
- **여러 runtime에서 동일하게 동작합니다.** Codex, Claude Code 및 기타 Agent Skill runtime에서 같은 Skill과 같은 안전 경계를 유지합니다.
- **API 우선, UI는 필요할 때만.** 읽기와 쓰기는 OpenAI Ads Advertiser API를 우선합니다. 브라우저 자동화는 onboarding 또는 beta-only 공백에만 사용합니다.
- **runtime 의존성이 없습니다.** Node.js 18+만 필요하며 감사해야 할 타사 npm 패키지가 없습니다.

## Skill 기능

로드되면 이 Skill은 ChatGPT Ads 라이프사이클을 위한 게이트 기반 워크플로를 agent에 제공합니다.

- **brief를 구조화된 광고 계획으로 전환합니다.** campaign, ad group, 대화형 `context_hints`, 입찰, 예산, 크리에이티브를 포함한 `openai_ads_plan.v1`을 작성합니다.
- **깊은 사전 검증을 수행합니다.** 필수 필드, plan schema, micros 단위 예산 하한, 입찰 설정, 크리에이티브 제한, `http(s)` landing URL, 계정 일치, 승인 상태를 확인합니다.
- **정책 및 안전 게이트를 강제합니다.** 쓰기, 활성화, 심사 제출, 예산 영향 작업 전에 계약과 gate를 확인합니다.
- **쓰기 지원 시에도 안전하게 생성합니다.** 의도된 쓰기 경로는 paused campaign -> paused ad group -> paused ad이며, 활성화는 승인 전용의 별도 단계입니다.
- **상태와 insights를 읽습니다.** 현재는 읽기 전용 계정 확인을 제공하며, 계정 상태, 엔터티 상태, 심사 상태, 성과 insights 모니터링을 염두에 두고 설계되었습니다.
- **증거 경계를 보고합니다.** 각 실행은 로컬 검증, API readback, UI 관찰, 가정 중 무엇에 근거했는지 명시해야 합니다.

현재 구현은 `plan_only`, `validate_only`, 읽기 전용 계정 확인을 제공합니다. 쓰기 작업은 의도적으로 아직 구현하지 않았습니다.

## 설치

**필수 조건:** [Git](https://git-scm.com/downloads) 및 [Node.js 18+](https://nodejs.org/).

이 저장소는 plugin 설치와 직접 Agent Skill 설치를 모두 지원합니다. plugin metadata는 `.codex-plugin/` 및 `.claude-plugin/`에 있고, 실제 Skill은 `skills/openai-ads-skill/`에 있습니다.

### Codex / Claude Code plugin

- Codex manifest: `.codex-plugin/plugin.json`
- Claude metadata: `.claude-plugin/plugin.json` 및 `.claude-plugin/marketplace.json`

공식 또는 팀 marketplace에 게시한 뒤에는 해당 runtime의 plugin manager로 설치하세요.

### 직접 Agent Skill 설치

runtime이 `SKILL.md`가 들어 있는 폴더만 로드한다면, 중첩된 `skills/openai-ads-skill/` 폴더를 설치하세요. 최종 폴더 이름은 `openai-ads-skill`이어야 합니다.

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

### 프로젝트 단위 설치

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

Skill이 바로 보이지 않으면 agent를 재시작하세요.

## 사용

agent에서 이름으로 호출합니다.

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

보조 스크립트는 Node.js 18+가 필요하며 추가 패키지는 필요 없습니다. 저장소 루트에서 실행하세요.

```bash
npm test

# 광고 계획을 로컬에서 검증합니다. API 호출은 하지 않습니다.
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

읽기 전용 계정 확인에는 Ads API key가 필요합니다.

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

계정 확인은 `GET /ad_account`만 호출합니다. 생성, 업데이트, 일시 중지, 활성화, 보관은 하지 않습니다.

## 모드

| Mode | 수행 내용 | 계정 영향 |
| --- | --- | --- |
| `plan_only` | 구조화된 광고 계획과 체크리스트 작성 | 계정 접근 없음 |
| `validate_only` | 필드, 정책, landing page, 이미지, 예산, 승인 검증 | 계정 접근 없음 |
| `create_paused` | paused campaign / ad group / ad 생성을 위한 의도된 쓰기 모드 | 쓰기, 일시 중지만 |
| `enable` | 명시적 승인과 심사 확인 후 활성화 | 활성화 |
| `monitor` | 계정, 엔터티, 심사 상태, insights 읽기 | 읽기 전용 |
| `ui_onboarding` | onboarding 또는 beta-only 공백을 브라우저로 보조 | 설정만 |

## 안전

- **Ads API key를 절대 commit하지 마세요.** 채팅, 로그, issue, PR, 스크린샷에 붙여 넣은 key는 반드시 교체하세요.
- **활성화는 항상 생성과 분리됩니다.** 이는 핵심 설계 경계입니다.
- **로컬 검증은 로컬 증거일 뿐입니다.** 원격 상태는 API readback으로 확인해야 합니다.
- **확신이 없으면 쓰기를 멈추세요.** 승인되지 않은 지출 경로를 여는 것보다 쓰기를 차단하는 편이 안전합니다.

## License

MIT
