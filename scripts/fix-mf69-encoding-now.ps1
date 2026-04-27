# scripts/fix-mf69-encoding-now.ps1
# Executar a partir da raiz do projeto:
# powershell -ExecutionPolicy Bypass -File scripts/fix-mf69-encoding-now.ps1

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

Write-Host "A corrigir caracteres estranhos do rebrand MF69..." -ForegroundColor Cyan

# ---------------------------------------------------------------------
# 1. Corrigir common.noTribe nos idiomas
#    Usamos hífen normal em vez de travessão para evitar novo mojibake.
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

    # Correções PT visíveis
    $content = $content.Replace("Voltar ao inÃcio", "Voltar ao início")
    $content = $content.Replace("VersÃ£o", "Versão")
    $content = $content.Replace("pontuaÃ§Ã£o", "pontuação")
    $content = $content.Replace("PontuaÃ§Ã£o", "Pontuação")
    $content = $content.Replace("AnÃ¡lise", "Análise")
    $content = $content.Replace("anÃ¡lise", "análise")
    $content = $content.Replace("ruÃ­nas", "ruínas")
    $content = $content.Replace("RuÃ­nas", "Ruínas")
    $content = $content.Replace("aplicaÃ§Ã£o", "aplicação")
    $content = $content.Replace("prÃ³xima", "próxima")
    $content = $content.Replace("seleÃ§Ã£o", "seleção")
    $content = $content.Replace("SeleÃ§Ã£o", "Seleção")
    $content = $content.Replace("configuraÃ§Ã£o", "configuração")
    $content = $content.Replace("ConfiguraÃ§Ã£o", "Configuração")
    $content = $content.Replace("CalibraÃ§Ã£o", "Calibração")
    $content = $content.Replace("ConfianÃ§a", "Confiança")
    $content = $content.Replace("possÃ­vel", "possível")
    $content = $content.Replace("contÃ©m", "contém")
    $content = $content.Replace("nÃ£o", "não")
    $content = $content.Replace("NÃ£o", "Não")
    $content = $content.Replace("Ã©", "é")
    $content = $content.Replace("Ãª", "ê")
    $content = $content.Replace("Ãº", "ú")
    $content = $content.Replace("Ã­", "í")
    $content = $content.Replace("Ã³", "ó")
    $content = $content.Replace("Ã§", "ç")
    $content = $content.Replace("Ã£", "ã")
    $content = $content.Replace("Ã¡", "á")

    Set-FileText $ptFile $content
}

# ---------------------------------------------------------------------
# 2. Corrigir botão voltar em GvgSimulatorApp.tsx
#    Usa a chave já existente common.back, para não depender de backToHome.
# ---------------------------------------------------------------------

$gvgFile = "src/features/gvg/GvgSimulatorApp.tsx"

if (Test-Path $gvgFile) {
    $content = Get-FileText $gvgFile

    $content = $content -replace 'â†.? ?\{t\.common\.backToHome\}', '← {t.common.back}'
    $content = $content -replace 'â†.? ?Back to home', '← {t.common.back}'
    $content = $content -replace '← ?\{t\.common\.backToHome\}', '← {t.common.back}'
    $content = $content -replace '← ?Back to home', '← {t.common.back}'

    Set-FileText $gvgFile $content
}

# ---------------------------------------------------------------------
# 3. Se o script anterior acrescentou backToHome ao schema/locales,
#    mantemos porque já compila, mas o botão passa a usar common.back.
# ---------------------------------------------------------------------

Write-Host "Correção concluída." -ForegroundColor Green
Write-Host "Agora executa:"
Write-Host "npm run build"
Write-Host "npm run dev"