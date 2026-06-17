# openai-ads-skill

![openai-ads-skill README hero](../skills/openai-ads-skill/assets/readme-hero.png)

Un **Agent Skill** reutilizable y orientado a la seguridad para planificar, validar y operar campañas de OpenAI Ads / ChatGPT Ads. Está diseñado para Codex, Claude Code y cualquier runtime de agentes que pueda cargar Agent Skills.

> Planifica y valida primero. Crea solo entidades pausadas. Nunca gastes dinero sin aprobación humana explícita.

**Idiomas:** [English](../README.md) · [中文](README.zh-CN.md) · [Español](README.es.md) · [日本語](README.ja.md) · [한국어](README.ko.md) · [العربية](README.ar.md)

## Por qué usar este skill

Operar campañas publicitarias desde un agente de IA es riesgoso: una llamada incorrecta puede gastar presupuesto real o publicar un anuncio no conforme. Este skill coloca controles estrictos entre el agente y la cuenta publicitaria para obtener automatización **sin perder control**.

- **Seguro para el presupuesto por defecto.** Las operaciones de creación deben producir entidades pausadas. La activación y cualquier acción que afecte el gasto requieren una aprobación separada y explícita.
- **Detecta errores antes de que cuesten dinero.** Valida planes localmente: campos, políticas, páginas de destino, imágenes, presupuesto, cuenta y estado de aprobación.
- **Límites de ejecución claros.** Planificar, validar, crear pausado, habilitar, monitorear y onboarding son modos separados.
- **Funciona en varios runtimes.** El mismo skill mantiene el mismo comportamiento en Codex, Claude Code y otros runtimes compatibles con Agent Skills.
- **API primero, UI solo cuando haga falta.** Usa la OpenAI Ads Advertiser API para lecturas y escrituras. La automatización del navegador queda reservada para onboarding o vacíos beta-only.
- **Sin dependencias de runtime.** Node.js 18+ puro, sin paquetes npm de terceros que auditar.

## Qué hace el skill

Una vez cargado, el skill ofrece al agente un flujo con controles para el ciclo de vida de ChatGPT Ads:

- **Convierte un brief en un plan estructurado.** Genera una especificación `openai_ads_plan.v1` con campaign, ad groups, `context_hints` conversacionales, pujas, presupuesto y creatividades.
- **Ejecuta validación previa profunda.** Revisa campos obligatorios, schema del plan, mínimos de presupuesto en micros, configuración de puja, límites creativos, URLs `http(s)`, cuenta y aprobación.
- **Aplica controles de política y seguridad.** Ejecuta contratos y gates antes de cualquier escritura, activación, envío a revisión o acción que afecte presupuesto.
- **Crea con seguridad cuando la escritura esté habilitada.** La ruta prevista es campaign pausada -> ad group pausado -> ad pausado, con activación como paso separado y solo con aprobación.
- **Lee estado e insights.** Incluye una comprobación de cuenta de solo lectura y está diseñado para monitorear cuenta, entidades, revisión y rendimiento.
- **Reporta el límite de evidencia.** Cada ejecución debe indicar qué fue probado localmente, por API, por UI o por suposición.

La implementación actual incluye `plan_only`, `validate_only` y una comprobación de cuenta de solo lectura. Las operaciones de escritura aún no están implementadas de forma intencional.

## Instalación

**Requisitos:** [Git](https://git-scm.com/downloads) y [Node.js 18+](https://nodejs.org/).

Este repositorio soporta instalación como plugin y como Agent Skill directo. Los metadatos de plugin están en `.codex-plugin/` y `.claude-plugin/`; el Skill real está en `skills/openai-ads-skill/`.

### Plugin para Codex / Claude Code

- Manifest de Codex: `.codex-plugin/plugin.json`
- Metadatos de Claude: `.claude-plugin/plugin.json` y `.claude-plugin/marketplace.json`

Cuando se publique en un marketplace oficial o de equipo, instálalo con el gestor de plugins del runtime correspondiente.

### Instalación directa como Agent Skill

Si tu runtime solo carga carpetas que contienen `SKILL.md`, instala la carpeta anidada `skills/openai-ads-skill/`. El nombre final debe ser `openai-ads-skill`.

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

### Instalación por proyecto

```bash
git clone https://github.com/AleksChen/openai-ads-skill.git /tmp/openai-ads-skill
mkdir -p ./.agents/skills
cp -R /tmp/openai-ads-skill/skills/openai-ads-skill ./.agents/skills/openai-ads-skill
```

Reinicia el agente si el Skill no aparece de inmediato.

## Uso

Invoca el skill por nombre desde tu agente:

```text
Use openai-ads-skill to plan and validate an OpenAI Ads campaign.
```

Los scripts auxiliares requieren Node.js 18+ y no necesitan paquetes adicionales. Ejecútalos desde la raíz del repositorio:

```bash
npm test

# Valida un plan localmente. No hace llamadas API.
node skills/openai-ads-skill/scripts/validate-plan.mjs skills/openai-ads-skill/tests/fixtures/valid-plan.json
```

La comprobación de cuenta de solo lectura requiere una Ads API key:

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

La comprobación de cuenta solo llama a `GET /ad_account`. Nunca crea, actualiza, pausa, activa ni archiva nada.

## Modos

| Modo | Qué hace | Impacto en la cuenta |
| --- | --- | --- |
| `plan_only` | Crea un plan estructurado y checklist | Sin acceso a la cuenta |
| `validate_only` | Valida campos, políticas, landing pages, imágenes, presupuesto y aprobación | Sin acceso a la cuenta |
| `create_paused` | Modo previsto para crear campaign / ad group / ad en pausa | Escritura, solo pausado |
| `enable` | Activación tras aprobación explícita y revisión | Activación |
| `monitor` | Lee cuenta, entidades, revisión e insights | Solo lectura |
| `ui_onboarding` | Configuración asistida por navegador para onboarding o vacíos beta-only | Solo configuración |

## Seguridad

- **Nunca subas Ads API keys al repositorio.** Rota cualquier key pegada en chats, logs, issues, PRs o capturas.
- **La activación siempre está separada de la creación.** Es un límite central del diseño.
- **La validación local solo es evidencia local.** El estado remoto requiere lectura por API.
- **Ante la duda, detén la escritura.** Es mejor bloquear una escritura que abrir una ruta de gasto no aprobada.

## Licencia

MIT
