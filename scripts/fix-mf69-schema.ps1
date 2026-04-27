# scripts/fix-mf69-schema.ps1
# Executar a partir da raiz do projeto:
# powershell -ExecutionPolicy Bypass -File scripts/fix-mf69-schema.ps1

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

Write-Host "A corrigir schema e textos usados pelo rebrand MF69..." -ForegroundColor Cyan

# ---------------------------------------------------------------------
# 1. Atualizar src/locales/schema.ts
# ---------------------------------------------------------------------

$schemaFile = "src/locales/schema.ts"
$schema = Get-FileText $schemaFile

if ($schema -notmatch "backToHome") {
    $schema = $schema.Replace(
        'version: string;',
        'version: string;
    backToHome: string;
    reset: string;
    switchToTableMode: string;
    switchToVisualMode: string;
    tribes: string;
    visualTribesHelp: string;'
    )
}

Set-FileText $schemaFile $schema

# ---------------------------------------------------------------------
# 2. Corrigir GvgSimulatorApp.tsx
# ---------------------------------------------------------------------

$gvgFile = "src/features/gvg/GvgSimulatorApp.tsx"
$gvg = Get-FileText $gvgFile

# Corrigir seta/encoding partido no botão voltar
$gvg = $gvg.Replace('â† {t.common.backToHome}', '← {t.common.backToHome}')
$gvg = $gvg.Replace('â† {t.common.backToHome}', '← {t.common.backToHome}')
$gvg = $gvg.Replace('â† Back to home', '← {t.common.backToHome}')
$gvg = $gvg.Replace('← Back to home', '← {t.common.backToHome}')

Set-FileText $gvgFile $gvg

# ---------------------------------------------------------------------
# 3. Corrigir PT: pequeno acento partido visível
# ---------------------------------------------------------------------

$ptFile = "src/locales/pt.ts"
$pt = Get-FileText $ptFile

$pt = $pt.Replace('Voltar ao inÃcio', 'Voltar ao início')
$pt = $pt.Replace('VersÃ£o', 'Versão')
$pt = $pt.Replace('pontuaÃ§Ã£o', 'pontuação')
$pt = $pt.Replace('PontuaÃ§Ã£o', 'Pontuação')
$pt = $pt.Replace('AnÃ¡lise', 'Análise')
$pt = $pt.Replace('anÃ¡lise', 'análise')
$pt = $pt.Replace('ruÃ­nas', 'ruínas')
$pt = $pt.Replace('RuÃ­nas', 'Ruínas')
$pt = $pt.Replace('aplicaÃ§Ã£o', 'aplicação')
$pt = $pt.Replace('prÃ³xima', 'próxima')
$pt = $pt.Replace('selecionado', 'selecionado')

Set-FileText $ptFile $pt

Write-Host "Correção concluída." -ForegroundColor Green
Write-Host "Agora executa: npm run build"