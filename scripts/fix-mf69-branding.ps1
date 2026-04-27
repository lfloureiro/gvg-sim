# scripts/fix-mf69-branding.ps1
# Executar a partir da raiz do projeto:
# powershell -ExecutionPolicy Bypass -File scripts/fix-mf69-branding.ps1

$ErrorActionPreference = "Stop"

function Get-FileText {
    param([string]$Path)

    if (-not (Test-Path $Path)) {
        throw "Ficheiro não encontrado: $Path"
    }

    return [System.IO.File]::ReadAllText((Join-Path (Get-Location) $Path), [System.Text.Encoding]::UTF8)
}

function Set-FileText {
    param(
        [string]$Path,
        [string]$Content
    )

    $fullPath = Join-Path (Get-Location) $Path
    $dir = Split-Path $fullPath -Parent

    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($fullPath, $Content, $utf8NoBom)
}

Write-Host "A corrigir branding MF69 e banners..." -ForegroundColor Cyan

# ---------------------------------------------------------------------
# 1. BrandBanner.tsx
# ---------------------------------------------------------------------

Set-FileText "src/components/BrandBanner.tsx" @'
import { PHOENIX_MOTTO, PHOENIX_TITLE } from "../version";

type BrandBannerProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  compact?: boolean;
};

export default function BrandBanner({
  eyebrow,
  title,
  subtitle,
  compact = false,
}: BrandBannerProps) {
  return (
    <section
      className={`phoenix-banner phoenix-banner-with-watermark ${
        compact ? "phoenix-banner-compact" : ""
      }`}
    >
      <div className="phoenix-banner-inner phoenix-banner-grid">
        <div>
          <p className="phoenix-kicker">{eyebrow}</p>
          <h1 className="phoenix-title">{title}</h1>
          {subtitle ? <p className="phoenix-subtitle">{subtitle}</p> : null}
        </div>

        <div className="banner-watermark-block" aria-hidden="true">
          <div className="banner-watermark-title">{PHOENIX_TITLE}</div>
          <div className="banner-watermark-motto">{PHOENIX_MOTTO}</div>
        </div>
      </div>
    </section>
  );
}
'@

# ---------------------------------------------------------------------
# 2. ModeSelectionScreen.tsx
# ---------------------------------------------------------------------

Set-FileText "src/features/gvg/ModeSelectionScreen.tsx" @'
import BrandBanner from "../../components/BrandBanner";
import type { AppText } from "../../i18n";

type ModeSelectionScreenProps = {
  t: AppText;
  onSelectMode: (mode: "table" | "visual") => void;
};

export default function ModeSelectionScreen({
  t,
  onSelectMode,
}: ModeSelectionScreenProps) {
  return (
    <div className="stack">
      <BrandBanner
        eyebrow={t.modeSelection.eyebrow}
        title={t.modeSelection.title}
        subtitle={t.modeSelection.subtitle}
      />

      <section className="card">
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "1rem",
          }}
        >
          <button
            type="button"
            className="secondary-button"
            style={{
              minHeight: 150,
              textAlign: "left",
              padding: "1.2rem",
            }}
            onClick={() => onSelectMode("table")}
          >
            <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8 }}>
              {t.modeSelection.tableTitle}
            </div>

            <div style={{ opacity: 0.85, lineHeight: 1.5 }}>
              {t.modeSelection.tableDescription}
            </div>
          </button>

          <button
            type="button"
            className="primary-button"
            style={{
              minHeight: 150,
              textAlign: "left",
              padding: "1.2rem",
            }}
            onClick={() => onSelectMode("visual")}
          >
            <div style={{ fontSize: "1.15rem", fontWeight: 700, marginBottom: 8 }}>
              {t.modeSelection.visualTitle}
            </div>

            <div style={{ opacity: 0.92, lineHeight: 1.5 }}>
              {t.modeSelection.visualDescription}
            </div>
          </button>
        </div>
      </section>
    </div>
  );
}
'@

# ---------------------------------------------------------------------
# 3. version.ts
# ---------------------------------------------------------------------

Set-FileText "src/version.ts" @'
// Atualiza só este ficheiro quando quiseres mudar a versão.
// Regra simples:
// - patch: correções pequenas ou ajustes visuais -> 3.4.1
// - minor: rebrand / pequenas funcionalidades -> 3.5.0
// - major: mudança grande de lógica/estrutura -> 4.0.0

export const APP_VERSION = {
  major: 3,
  minor: 4,
  patch: 1,
} as const;

export const APP_VERSION_STRING = `${APP_VERSION.major}.${APP_VERSION.minor}.${APP_VERSION.patch}`;

export const BRAND_TITLE = "MF69";
export const BRAND_MOTTO = "United under one banner.";

// Mantido para compatibilidade com componentes existentes.
// Numa fase posterior podemos renomear PHOENIX_* para BRAND_*.
export const PHOENIX_TITLE = BRAND_TITLE;
export const PHOENIX_MOTTO = BRAND_MOTTO;
'@

# ---------------------------------------------------------------------
# 4. GvgSimulatorApp.tsx
# ---------------------------------------------------------------------

$gvgFile = "src/features/gvg/GvgSimulatorApp.tsx"

if (Test-Path $gvgFile) {
    $content = Get-FileText $gvgFile

    $content = $content.Replace("Back to home", "{t.common.backToHome}")
    $content = $content.Replace("â†", "←")

    $content = $content.Replace('setSetupError("Todas as tribos ativas tÃªm de ter nome.");', 'setSetupError(t.errors.allTribesMustHaveAName);')
    $content = $content.Replace('setSetupError("Todas as tribos ativas têm de ter nome.");', 'setSetupError(t.errors.allTribesMustHaveAName);')
    $content = $content.Replace('setSetupError("Os nomes das tribos ativas tÃªm de ser Ãºnicos.");', 'setSetupError(t.errors.tribeNamesMustBeUnique);')
    $content = $content.Replace('setSetupError("Os nomes das tribos ativas têm de ser únicos.");', 'setSetupError(t.errors.tribeNamesMustBeUnique);')

    Set-FileText $gvgFile $content
}

# ---------------------------------------------------------------------
# 5. EnemyTribeAnalysisScreen.tsx
# ---------------------------------------------------------------------

$enemyFile = "src/features/enemy-analysis/EnemyTribeAnalysisScreen.tsx"

if (Test-Path $enemyFile) {
    $content = Get-FileText $enemyFile

    if ($content -notmatch 'PHOENIX_TITLE') {
        $content = 'import { PHOENIX_MOTTO, PHOENIX_TITLE } from "../../version";' + "`r`n" + $content
    }

    $content = $content.Replace('<div className="banner-watermark-title">PHOENIX VERITAS</div>', '<div className="banner-watermark-title">{PHOENIX_TITLE}</div>')
    $content = $content.Replace('FORGED IN FIRE, UNITED IN TRUTH.', '{PHOENIX_MOTTO}')

    Set-FileText $enemyFile $content
}

# ---------------------------------------------------------------------
# 6. SimulationScreen.tsx
# ---------------------------------------------------------------------

$simulationFile = "src/components/SimulationScreen.tsx"

if (Test-Path $simulationFile) {
    $content = Get-FileText $simulationFile

    $content = $content.Replace(">Reset<", ">{t.common.reset}<")
    $content = $content.Replace(">Mudar para modo visual<", ">{t.common.switchToVisualMode}<")
    $content = $content.Replace(">Switch to visual mode<", ">{t.common.switchToVisualMode}<")

    Set-FileText $simulationFile $content
}

# ---------------------------------------------------------------------
# 7. SimulationScreenVisual.tsx
# ---------------------------------------------------------------------

$visualFile = "src/components/SimulationScreenVisual.tsx"

if (Test-Path $visualFile) {
    $content = Get-FileText $visualFile

    if ($content -notmatch 'BrandBanner') {
        $content = $content.Replace(
            'import type { AppText } from "../i18n";',
            'import BrandBanner from "./BrandBanner";' + "`r`n" + 'import type { AppText } from "../i18n";'
        )
    }

    if ($content -notmatch '<BrandBanner') {
        $content = $content.Replace(
            '<div className="stack" style={{ position: "relative" }}>',
            '<div className="stack" style={{ position: "relative" }}>
      <BrandBanner
        eyebrow={t.simulationVisual.eyebrow}
        title={t.simulationVisual.title}
        subtitle={t.simulationVisual.subtitle}
      />'
        )
    }

    $content = $content.Replace(">Reset<", ">{t.common.reset}<")
    $content = $content.Replace(">Mudar para modo tabela<", ">{t.common.switchToTableMode}<")
    $content = $content.Replace(">Switch to table mode<", ">{t.common.switchToTableMode}<")
    $content = $content.Replace("<h2>Tribos</h2>", "<h2>{t.common.tribes}</h2>")

    $content = $content.Replace(
        "Homes sem tribo ficam esbatidos. O seletor de Order já fica pronto
  para a próxima fase.",
        "{t.common.visualTribesHelp}"
    )

    Set-FileText $visualFile $content
}

# ---------------------------------------------------------------------
# 8. Locales: acrescentar chaves comuns se faltarem
# ---------------------------------------------------------------------

$localeFiles = @(
    "src/locales/en.ts",
    "src/locales/pt.ts",
    "src/locales/de.ts",
    "src/locales/fr.ts",
    "src/locales/it.ts",
    "src/locales/ru.ts",
    "src/locales/tr.ts",
    "src/locales/uk.ts"
)

foreach ($locale in $localeFiles) {
    if (Test-Path $locale) {
        $content = Get-FileText $locale

        $content = $content.Replace("Phoenix Veritas", "MF69")
        $content = $content.Replace("PHOENIX VERITAS", "MF69")
        $content = $content.Replace("FORGED IN FIRE, UNITED IN TRUTH.", "United under one banner.")

        if ($content -notmatch 'backToHome') {
            $content = $content -replace 'version:\s*"[^"]*",', 'version: "Version",
    backToHome: "Back to home",
    reset: "Reset",
    switchToTableMode: "Switch to table mode",
    switchToVisualMode: "Switch to visual mode",
    tribes: "Tribes",
    visualTribesHelp: "Homes without a tribe are faded. The Order selector is ready for the next phase.",'
        }

        if ($locale -eq "src/locales/pt.ts") {
            $content = $content.Replace('version: "Version",
    backToHome: "Back to home",
    reset: "Reset",
    switchToTableMode: "Switch to table mode",
    switchToVisualMode: "Switch to visual mode",
    tribes: "Tribes",
    visualTribesHelp: "Homes without a tribe are faded. The Order selector is ready for the next phase.",',
'version: "Versão",
    backToHome: "Voltar ao início",
    reset: "Repor",
    switchToTableMode: "Mudar para modo tabela",
    switchToVisualMode: "Mudar para modo visual",
    tribes: "Tribos",
    visualTribesHelp: "Homes sem tribo ficam esbatidos. O seletor de Order fica preparado para a próxima fase.",')
        }

        Set-FileText $locale $content
    }
}

# ---------------------------------------------------------------------
# 9. CSS: garantir watermark
# ---------------------------------------------------------------------

$cssFile = "src/index.css"

if (Test-Path $cssFile) {
    $css = Get-FileText $cssFile

    if ($css -notmatch 'banner-watermark-block') {
        $css += @'

.banner-watermark-block {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  text-align: right;
  pointer-events: none;
  opacity: 0.14;
  line-height: 0.95;
  max-width: 48%;
}

.banner-watermark-title {
  font-size: clamp(2.4rem, 5vw, 5.4rem);
  font-weight: 900;
  letter-spacing: 0.08em;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.78);
}

.banner-watermark-motto {
  margin-top: 0.45rem;
  font-size: clamp(0.7rem, 1vw, 0.95rem);
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.72);
}

.phoenix-banner-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;
}

@media (max-width: 760px) {
  .phoenix-banner-grid {
    grid-template-columns: 1fr;
  }

  .banner-watermark-block {
    position: absolute;
    top: 1rem;
    right: 1rem;
    opacity: 0.08;
    max-width: 70%;
  }

  .banner-watermark-title {
    font-size: clamp(2rem, 13vw, 4rem);
  }

  .banner-watermark-motto {
    display: none;
  }
}
'@
    }

    Set-FileText $cssFile $css
}

Write-Host ""
Write-Host "Script concluído." -ForegroundColor Green
Write-Host "Corre agora:"
Write-Host "npm run build"
Write-Host "npm run dev"