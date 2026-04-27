# scripts/fix-mf69-leftovers.ps1
# Executar a partir da raiz do projeto:
# powershell -ExecutionPolicy Bypass -File scripts/fix-mf69-leftovers.ps1

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
    $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
    [System.IO.File]::WriteAllText($fullPath, $Content, $utf8NoBom)
}

Write-Host "A corrigir sobras do rebrand MF69..." -ForegroundColor Cyan

# ---------------------------------------------------------------------
# 1. Corrigir noTribe em todos os idiomas
# ---------------------------------------------------------------------

$localeFiles = @(
    "src/locales/en.ts",
    "src/locales/de.ts",
    "src/locales/fr.ts",
    "src/locales/it.ts",
    "src/locales/ru.ts",
    "src/locales/tr.ts",
    "src/locales/uk.ts"
)

foreach ($file in $localeFiles) {
    if (Test-Path $file) {
        $content = Get-FileText $file
        $content = $content -replace 'noTribe:\s*"[^"]*",', 'noTribe: "- no tribe -",'
        Set-FileText $file $content
    }
}

$ptFile = "src/locales/pt.ts"

if (Test-Path $ptFile) {
    $content = Get-FileText $ptFile
    $content = $content -replace 'noTribe:\s*"[^"]*",', 'noTribe: "- sem tribo -",'
    $content = $content.Replace("Voltar ao inÃcio", "Voltar ao início")
    $content = $content.Replace("VersÃ£o", "Versão")
    Set-FileText $ptFile $content
}

# ---------------------------------------------------------------------
# 2. Corrigir botão Back to home em GvgSimulatorApp.tsx
# ---------------------------------------------------------------------

$gvgFile = "src/features/gvg/GvgSimulatorApp.tsx"

if (Test-Path $gvgFile) {
    $content = Get-FileText $gvgFile

    $pattern = '<button className="secondary-button" onClick=\{onReturnHome\}>[\s\S]*?</button>'
    $replacement = '<button className="secondary-button" onClick={onReturnHome}>
              ← {t.common.back}
            </button>'

    $content = [regex]::Replace($content, $pattern, $replacement, 1)

    Set-FileText $gvgFile $content
}

# ---------------------------------------------------------------------
# 3. Garantir que o botão Debug / review / ML é mais visível
# ---------------------------------------------------------------------

$enemyFile = "src/features/enemy-analysis/EnemyTribeAnalysisScreen.tsx"

if (Test-Path $enemyFile) {
    $content = Get-FileText $enemyFile

    # Troca o texto do botão para ficar mais curto e mais fácil de ver
    $content = $content.Replace(
        '{showAdvanced ? "Hide debug / review / ML" : "Debug / review / ML"}',
        '{showAdvanced ? "Hide debug panel" : "Show debug panel"}'
    )

    Set-FileText $enemyFile $content
}

Write-Host "Correção concluída." -ForegroundColor Green
Write-Host ""
Write-Host "Agora executa:"
Write-Host "npm run build"
Write-Host "npm run dev"