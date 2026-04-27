# scripts/rebrand-mf69.ps1
# Executar a partir da raiz do projeto:
# powershell -ExecutionPolicy Bypass -File scripts/rebrand-mf69.ps1

$ErrorActionPreference = "Stop"

function Write-FileUtf8 {
    param(
        [string]$Path,
        [string]$Content
    )

    $dir = Split-Path $Path -Parent
    if ($dir -and -not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }

    Set-Content -Path $Path -Value $Content -Encoding UTF8
}

function Update-FileText {
    param(
        [string]$Path,
        [string]$Old,
        [string]$New
    )

    if (-not (Test-Path $Path)) {
        throw "Ficheiro não encontrado: $Path"
    }

    $content = Get-Content $Path -Raw
    $content = $content.Replace($Old, $New)
    Set-Content -Path $Path -Value $content -Encoding UTF8
}

Write-Host "A aplicar rebrand MF69..." -ForegroundColor Cyan

# ---------------------------------------------------------------------
# 1. version.ts
# ---------------------------------------------------------------------

Write-FileUtf8 "src/version.ts" @'
// Atualiza só este ficheiro quando quiseres mudar a versão.
// Regra simples:
// - patch: correções pequenas ou ajustes visuais -> 3.4.1
// - minor: rebrand / pequenas funcionalidades -> 3.5.0
// - major: mudança grande de lógica/estrutura -> 4.0.0

export const APP_VERSION = {
  major: 3,
  minor: 4,
  patch: 0,
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
# 2. constants.ts
# ---------------------------------------------------------------------

Write-FileUtf8 "src/constants.ts" @'
import type { DayNumber, RuinDefinition, RuinType } from "./types";

export const TRIBE_COUNT = 12;

export const DEFAULT_TRIBE_COLOR_SCHEMES = [
  { primary: "#b91c1c", secondary: "#f8fafc" }, // MF69 - red / white
  { primary: "#0f766e", secondary: "#99f6e4" }, // teal / mint
  { primary: "#1e88e5", secondary: "#80d8ff" },
  { primary: "#43a047", secondary: "#d4e157" },
  { primary: "#8e24aa", secondary: "#fdd835" },
  { primary: "#00897b", secondary: "#80deea" },
  { primary: "#6d4c41", secondary: "#ffcc80" },
  { primary: "#d81b60", secondary: "#f8bbd0" },
  { primary: "#3949ab", secondary: "#ff8a65" },
  { primary: "#7cb342", secondary: "#fff59d" },
  { primary: "#546e7a", secondary: "#ffab91" },
  { primary: "#5e35b1", secondary: "#a5d6a7" },
];

export const RUIN_DEFINITIONS: RuinDefinition[] = [
  ...Array.from({ length: 10 }, (_, index) => ({
    id: `B${index + 1}`,
    name: `B${index + 1}`,
    type: "bastion" as const,
  })),
  ...Array.from({ length: 6 }, (_, index) => ({
    id: `V${index + 1}`,
    name: `V${index + 1}`,
    type: "valkyrie" as const,
  })),
  {
    id: "T1",
    name: "T1",
    type: "temple" as const,
  },
];

export const RUIN_FIRST_CAPTURE_POINTS: Record<RuinType, number> = {
  bastion: 5000,
  valkyrie: 10000,
  temple: 30000,
};

export const RUIN_MINUTE_RATES: Record<RuinType, Record<DayNumber, number>> = {
  bastion: {
    1: 10,
    2: 20,
    3: 30,
  },
  valkyrie: {
    1: 20,
    2: 40,
    3: 60,
  },
  temple: {
    1: 60,
    2: 120,
    3: 180,
  },
};
'@

# ---------------------------------------------------------------------
# 3. GvgSimulatorApp.tsx
# ---------------------------------------------------------------------

$gvgFile = "src/features/gvg/GvgSimulatorApp.tsx"

Update-FileText $gvgFile 'const STORAGE_KEY = "gvg-sim-state-v12";' 'const STORAGE_KEY = "gvg-sim-state-v13-mf69";'
Update-FileText $gvgFile 'index === 0 ? "Phoenix Veritas" : `Tribo ${index + 1}`' 'index === 0 ? "MF69" : `Tribo ${index + 1}`'

# ---------------------------------------------------------------------
# 4. Corrigir erro TypeScript em enemyAnalysisMightMl.ts
# ---------------------------------------------------------------------

$mightMlFile = "src/features/enemy-analysis/enemyAnalysisMightMl.ts"

if (Test-Path $mightMlFile) {
    $content = Get-Content $mightMlFile -Raw

    $content = $content.Replace(
        'import type { ArmyType, Confidence, EnemyAnalysisRow, EnemyAnalysisRowOverride } from "./analysis";',
        'import type { ArmyType, EnemyAnalysisRow, EnemyAnalysisRowOverride } from "./analysis";'
    )

    $content = $content.Replace(
        'type ConfidenceLabel = (typeof CONFIDENCE_LEVELS)[number];',
        ''
    )

    Set-Content -Path $mightMlFile -Value $content -Encoding UTF8
}

# ---------------------------------------------------------------------
# 5. Todas as línguas
# ---------------------------------------------------------------------

$localeFiles = @(
    "src/locales/de.ts",
    "src/locales/en.ts",
    "src/locales/fr.ts",
    "src/locales/it.ts",
    "src/locales/pt.ts",
    "src/locales/ru.ts",
    "src/locales/tr.ts",
    "src/locales/uk.ts"
)

foreach ($file in $localeFiles) {
    if (-not (Test-Path $file)) {
        throw "Ficheiro de idioma não encontrado: $file"
    }

    $content = Get-Content $file -Raw

    $content = $content.Replace("Phoenix Veritas", "MF69")
    $content = $content.Replace("PHOENIX VERITAS", "MF69")
    $content = $content.Replace("Phoenix toolkit", "MF69 toolkit")
    $content = $content.Replace("Phoenix Toolkit", "MF69 Toolkit")
    $content = $content.Replace("Toolkit Phoenix", "Toolkit MF69")
    $content = $content.Replace("Toolkit MF69", "Toolkit MF69")
    $content = $content.Replace("MF69 toolkit", "MF69 toolkit")
    $content = $content.Replace("Инструменты MF69", "MF69 Toolkit")
    $content = $content.Replace("Phoenix Veritas araç seti", "MF69 toolkit")

    # Ajustes específicos para PT
    if ($file -eq "src/locales/pt.ts") {
        $content = $content.Replace("Copiar current para simulation", "Copiar estado atual para a simulação")
        $content = $content.Replace("Owner atual", "Dono atual")
        $content = $content.Replace("owners em overlay", "donos em overlay")
    }

    Set-Content -Path $file -Value $content -Encoding UTF8
}

# ---------------------------------------------------------------------
# 6. index.css
# ---------------------------------------------------------------------

$cssFile = "src/index.css"

if (-not (Test-Path $cssFile)) {
    throw "Ficheiro não encontrado: $cssFile"
}

$css = Get-Content $cssFile -Raw

$css = $css -replace 'background:\s*radial-gradient\(circle at 15% 15%, rgba\(249, 115, 22, 0\.18\), transparent 24%\),\s*radial-gradient\(circle at 85% 12%, rgba\(59, 130, 246, 0\.16\), transparent 28%\),\s*radial-gradient\(circle at 50% 100%, rgba\(220, 38, 38, 0\.12\), transparent 35%\),\s*linear-gradient\(180deg, #071226 0%, #0f172a 55%, #111827 100%\);',
'background:
    radial-gradient(circle at 15% 15%, rgba(220, 38, 38, 0.18), transparent 24%),
    radial-gradient(circle at 85% 12%, rgba(20, 184, 166, 0.16), transparent 28%),
    radial-gradient(circle at 50% 100%, rgba(248, 250, 252, 0.08), transparent 35%),
    linear-gradient(180deg, #06171a 0%, #0f172a 55%, #111827 100%);'

$css = $css -replace '\.phoenix-banner \{[^}]*\}',
'.phoenix-banner {
  position: relative;
  overflow: hidden;
  margin-bottom: 18px;
  border-radius: 20px;
  border: 1px solid rgba(248, 250, 252, 0.2);
  background:
    radial-gradient(circle at 18% 18%, rgba(248, 250, 252, 0.16), transparent 24%),
    radial-gradient(circle at 84% 16%, rgba(20, 184, 166, 0.22), transparent 30%),
    linear-gradient(135deg, rgba(127, 29, 29, 0.92), rgba(153, 27, 27, 0.82) 42%, rgba(15, 118, 110, 0.62)),
    #0b1220;
  box-shadow:
    0 20px 55px rgba(0, 0, 0, 0.35),
    inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}'

$css = $css -replace '\.phoenix-kicker \{[^}]*\}',
'.phoenix-kicker {
  margin-bottom: 0.35rem;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  color: #fecaca;
}'

$css = $css -replace '\.phoenix-title \{[^}]*\}',
'.phoenix-title {
  margin-bottom: 0.35rem;
  background: linear-gradient(90deg, #ffffff, #fecaca, #99f6e4);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}'

$css = $css.Replace(
'.featured-tribe-block { border: 1px solid rgba(251, 146, 60, 0.35); background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(59, 130, 246, 0.08)), rgba(15, 23, 42, 0.4); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02); }',
'.featured-tribe-block { border: 1px solid rgba(248, 250, 252, 0.22); background: linear-gradient(135deg, rgba(185, 28, 28, 0.12), rgba(20, 184, 166, 0.08)), rgba(15, 23, 42, 0.4); box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02); }'
)

$css = $css.Replace(
'.featured-name { color: #fdba74; text-shadow: 0 0 18px rgba(249, 115, 22, 0.15); }',
'.featured-name { color: #fecaca; text-shadow: 0 0 18px rgba(220, 38, 38, 0.2); }'
)

$css = $css.Replace(
'.primary-button { background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; }',
'.primary-button { background: linear-gradient(135deg, #b91c1c, #0f766e); color: white; }'
)

Set-Content -Path $cssFile -Value $css -Encoding UTF8

Write-Host "Rebrand MF69 aplicado." -ForegroundColor Green
Write-Host ""
Write-Host "Agora executa:"
Write-Host "npm run build"
Write-Host "npm run dev"