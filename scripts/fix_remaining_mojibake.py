from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

REPLACEMENTS_BY_FILE = {
    "src/locales/pt.ts": {
        "depois Ã posse": "depois à posse",
    },
    "src/locales/it.ts": {
        "proprietÃ": "proprietà",
        "modalitÃ": "modalità",
        "SarÃ": "Sarà",
    },
    "src/locales/fr.ts": {
        "jusqu'Ã  la fin": "jusqu'à la fin",
        "jusqu'Ã la fin": "jusqu'à la fin",
        "score Ã partir": "score à partir",
        "directement Ã un": "directement à un",
        "visuelle Ã la carte": "visuelle à la carte",
        "puis Ã la possession": "puis à la possession",
    },
}

def main() -> None:
    for relative_path, replacements in REPLACEMENTS_BY_FILE.items():
        path = ROOT / relative_path
        text = path.read_text(encoding="utf-8")

        for old, new in replacements.items():
            text = text.replace(old, new)

        path.write_text(text, encoding="utf-8", newline="\n")
        print(f"OK: {relative_path}")

if __name__ == "__main__":
    main()