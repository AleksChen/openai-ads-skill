# openai-ads-skill

![openai-ads-skill README hero](../skills/openai-ads-skill/assets/readme-hero.png)

مهارة **Agent Skill** قابلة لإعادة الاستخدام وتركز على السلامة لتخطيط حملات OpenAI Ads / ChatGPT Ads والتحقق منها وتشغيلها. صممت للعمل مع Codex و Claude Code وأي بيئة agent runtime تستطيع تحميل Agent Skills.

> خطط وتحقق أولا. أنشئ كيانات متوقفة فقط. لا تنفق المال أبدا من دون موافقة بشرية صريحة.

**اللغات:** [English](../README.md) · [中文](README.zh-CN.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

## لماذا تستخدم هذه المهارة

تشغيل الحملات الإعلانية من خلال agent يعمل بالذكاء الاصطناعي يحمل مخاطرة واضحة: استدعاء خاطئ واحد قد ينفق ميزانية حقيقية أو ينشر إعلانا غير متوافق. تضع هذه المهارة حواجز صارمة بين agent وحساب الإعلانات حتى تحصل على الأتمتة **من دون فقدان السيطرة**.

- **آمنة للميزانية بشكل افتراضي.** يجب أن تنتج عمليات الإنشاء كيانات متوقفة. التفعيل وأي إجراء يؤثر في الإنفاق يحتاجان إلى موافقة منفصلة وصريحة.
- **تكتشف الأخطاء قبل أن تكلفك المال.** تتحقق محليا من الحقول، بوابات السياسة، صفحات الهبوط، الصور، الميزانية، تطابق الحساب، وحالة الموافقة.
- **حدود تنفيذ واضحة.** التخطيط، التحقق، الإنشاء المتوقف، التفعيل، المراقبة، و onboarding هي أوضاع منفصلة.
- **تعمل عبر عدة بيئات agent.** السلوك نفسه في Codex و Claude Code وبيئات Agent Skill الأخرى.
- **API أولا، وواجهة المستخدم عند الحاجة فقط.** تستخدم OpenAI Ads Advertiser API للقراءة والكتابة. أتمتة المتصفح مخصصة فقط لخطوات onboarding أو الفجوات beta-only.
- **بلا اعتماديات runtime إضافية.** تعتمد على Node.js 18+ فقط، من دون حزم npm خارجية تحتاج إلى تدقيق.

## ماذا تفعل المهارة

بعد تحميلها، تمنح هذه المهارة agent مسار عمل محكوما بالبوابات لدورة حياة ChatGPT Ads:

- **تحول brief إلى خطة حملة منظمة.** تنشئ مواصفة `openai_ads_plan.v1` تشمل campaign و ad groups و `context_hints` الحوارية والمزايدة والميزانية والمواد الإبداعية.
- **تنفذ تحققا مسبقا عميقا.** تفحص الحقول المطلوبة، schema الخطة، حدود الميزانية بوحدة micros، إعدادات المزايدة، قيود الإبداع، روابط `http(s)`، تطابق الحساب، وحالة الموافقة.
- **تفرض بوابات السياسة والسلامة.** تشغل العقود والبوابات قبل أي كتابة أو تفعيل أو إرسال للمراجعة أو إجراء يؤثر في الميزانية.
- **تنشئ بأمان عند تفعيل الكتابة.** المسار المقصود هو paused campaign -> paused ad group -> paused ad، مع إبقاء التفعيل خطوة منفصلة لا تتم إلا بالموافقة.
- **تقرأ الحالة والرؤى.** توفر حاليا فحص حساب للقراءة فقط، ومصممة لمراقبة حالة الحساب والكيانات والمراجعة و performance insights.
- **توضح حدود الدليل.** يجب أن يذكر كل تشغيل ما الذي ثبت محليا، وما الذي ثبت عبر API readback، وما الذي جاء من ملاحظة UI أو افتراض.

التنفيذ الحالي يتضمن `plan_only` و `validate_only` وفحص حساب للقراءة فقط. عمليات الكتابة غير منفذة عمدا في هذه المرحلة.

## التثبيت

**المتطلبات:** [Git](https://git-scm.com/downloads) و [Node.js 18+](https://nodejs.org/).

يدعم هذا المستودع التثبيت كـ plugin والتثبيت المباشر كـ Agent Skill. توجد بيانات plugin في `.codex-plugin/` و `.claude-plugin/`، أما المهارة الفعلية ففي `skills/openai-ads-skill/`.

### Codex / Claude Code plugin

- Codex manifest: `.codex-plugin/plugin.json`
- Claude metadata: `.claude-plugin/plugin.json` و `.claude-plugin/marketplace.json`

بعد النشر في marketplace رسمي أو خاص بالفريق، ثبته عبر مدير plugins الخاص بالبيئة.

### تثبيت Agent Skill مباشرة

إذا كانت بيئتك لا تحمل إلا مجلدا يحتوي على `SKILL.md`، فثبت المجلد الداخلي `skills/openai-ads-skill/`. يجب أن يبقى اسم المجلد النهائي `openai-ads-skill`.

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

### تثبيت داخل المشروع

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

أعد تشغيل agent إذا لم تظهر المهارة مباشرة.

## الاستخدام

استدع المهارة باسمها من داخل agent:

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

تحتاج السكربتات المساعدة إلى Node.js 18+ ولا تحتاج إلى حزم إضافية. شغلها من جذر المستودع:

```bash
npm test

# تحقق من خطة حملة محليا. لا يجري أي استدعاء API.
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

فحص الحساب للقراءة فقط يحتاج إلى Ads API key:

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

فحص الحساب يستدعي `GET /ad_account` فقط. لا ينشئ ولا يحدث ولا يوقف ولا يفعل ولا يؤرشف أي شيء.

## الأوضاع

| Mode | ما يفعله | أثره على الحساب |
| --- | --- | --- |
| `plan_only` | يبني خطة حملة منظمة وقائمة تحقق | لا يصل إلى الحساب |
| `validate_only` | يتحقق من الحقول والسياسات وصفحات الهبوط والصور والميزانية والموافقة | لا يصل إلى الحساب |
| `create_paused` | وضع كتابة مقصود لإنشاء campaign / ad group / ad بحالة توقف | كتابة، متوقف فقط |
| `enable` | تفعيل بعد موافقة صريحة وفحوصات المراجعة | تفعيل |
| `monitor` | يقرأ الحساب والكيانات وحالة المراجعة والرؤى | قراءة فقط |
| `ui_onboarding` | إعداد بمساعدة المتصفح من أجل onboarding أو فجوات beta-only | إعداد فقط |

## السلامة

- **لا ترفع Ads API keys إلى المستودع أبدا.** قم بتدوير أي key تم لصقه في محادثة أو log أو issue أو PR أو لقطة شاشة.
- **التفعيل منفصل دائما عن الإنشاء.** هذا حد أساسي في التصميم.
- **التحقق المحلي دليل محلي فقط.** الحالة البعيدة تحتاج إلى API readback.
- **عند الشك، أوقف الكتابة.** منع كتابة واحدة أفضل من فتح مسار إنفاق غير موافق عليه.

## License

MIT
