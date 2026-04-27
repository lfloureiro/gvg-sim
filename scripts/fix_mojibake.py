from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

FILES = [
    ROOT / "src" / "locales" / "pt.ts",
    ROOT / "src" / "locales" / "en.ts",
    ROOT / "src" / "locales" / "de.ts",
    ROOT / "src" / "locales" / "fr.ts",
    ROOT / "src" / "locales" / "it.ts",
    ROOT / "src" / "locales" / "ru.ts",
    ROOT / "src" / "locales" / "tr.ts",
    ROOT / "src" / "locales" / "uk.ts",
    ROOT / "src" / "features" / "gvg" / "GvgSimulatorApp.tsx",
    ROOT / "src" / "version.ts",
]

REPLACEMENTS = {
    # Símbolos / setas
    "â†": "←",
    "â†": "←",
    "â€”": "-",
    "â€“": "-",
    "â€œ": '"',
    "â€": '"',
    "â€˜": "'",
    "â€™": "'",
    "Âº": "º",
    "Âª": "ª",
    "Â ": " ",

    # Português / espanhol / francês / italiano / alemão
    "Ã€": "À",
    "Ã": "Á",
    "Ã‚": "Â",
    "Ãƒ": "Ã",
    "Ã„": "Ä",
    "Ã‡": "Ç",
    "Ãˆ": "È",
    "Ã‰": "É",
    "ÃŠ": "Ê",
    "Ã‹": "Ë",
    "ÃŒ": "Ì",
    "Ã": "Í",
    "ÃŽ": "Î",
    "Ã": "Ï",
    "Ã‘": "Ñ",
    "Ã’": "Ò",
    "Ã“": "Ó",
    "Ã”": "Ô",
    "Ã•": "Õ",
    "Ã–": "Ö",
    "Ã™": "Ù",
    "Ãš": "Ú",
    "Ã›": "Û",
    "Ãœ": "Ü",
    "Ã¡": "á",
    "Ã ": "à",
    "Ã¢": "â",
    "Ã£": "ã",
    "Ã¤": "ä",
    "Ã§": "ç",
    "Ã¨": "è",
    "Ã©": "é",
    "Ãª": "ê",
    "Ã«": "ë",
    "Ã¬": "ì",
    "Ã­": "í",
    "Ã®": "î",
    "Ã¯": "ï",
    "Ã±": "ñ",
    "Ã²": "ò",
    "Ã³": "ó",
    "Ã´": "ô",
    "Ãµ": "õ",
    "Ã¶": "ö",
    "Ã¹": "ù",
    "Ãº": "ú",
    "Ã»": "û",
    "Ã¼": "ü",
    "Ã½": "ý",
    "ÃŸ": "ß",

    # Turco
    "Ä°": "İ",
    "Ä±": "ı",
    "ÄŸ": "ğ",
    "Äž": "Ğ",
    "ÅŸ": "ş",
    "Åž": "Ş",
    "Å¡": "š",
    "Å¾": "ž",
    "Ã¼": "ü",
    "Ãœ": "Ü",
    "Ã¶": "ö",
    "Ã–": "Ö",
    "Ã§": "ç",
    "Ã‡": "Ç",
}

def fix_text(text: str) -> str:
    for old, new in REPLACEMENTS.items():
        text = text.replace(old, new)
    return text

def main() -> None:
    for path in FILES:
        if not path.exists():
            print(f"SKIP: {path}")
            continue

        text = path.read_text(encoding="utf-8")
        fixed = fix_text(text)

        # Correção específica do botão voltar, caso tenha ficado meio partido
        if path.name == "GvgSimulatorApp.tsx":
            fixed = fixed.replace("← {t.common.back}", "← {t.common.back}")
            fixed = fixed.replace("â† {t.common.back}", "← {t.common.back}")
            fixed = fixed.replace("â† {t.common.back}", "← {t.common.back}")

        path.write_text(fixed, encoding="utf-8", newline="\n")
        print(f"OK: {path.relative_to(ROOT)}")

if __name__ == "__main__":
    main()