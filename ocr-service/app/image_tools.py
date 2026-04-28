from __future__ import annotations

import re
from typing import Iterable

import cv2
import numpy as np
from PIL import Image


def pil_to_cv(image: Image.Image) -> np.ndarray:
    rgb = image.convert("RGB")
    arr = np.array(rgb)
    return cv2.cvtColor(arr, cv2.COLOR_RGB2BGR)


def preprocess_for_game_digits(image: Image.Image) -> np.ndarray:
    """
    Prepara crops de números do Fate War:
    - aumenta escala;
    - melhora contraste;
    - reduz fundo escuro/colorido;
    - preserva dígitos claros.
    """
    img = pil_to_cv(image)

    img = cv2.resize(
        img,
        None,
        fx=3,
        fy=3,
        interpolation=cv2.INTER_CUBIC,
    )

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Melhora contraste local.
    gray = cv2.GaussianBlur(gray, (3, 3), 0)
    gray = cv2.equalizeHist(gray)

    # Texto claro sobre fundo escuro.
    bin_img = cv2.adaptiveThreshold(
        gray,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        7,
    )

    return bin_img


def clean_number_text(text: str) -> list[str]:
    """
    Extrai candidatos numéricos do texto OCR.
    Aceita vírgulas, pontos e espaços como separadores.
    """
    normalized = (
        text.replace("O", "0")
        .replace("o", "0")
        .replace("I", "1")
        .replace("l", "1")
        .replace("|", "1")
        .replace("S", "5")
        .replace("s", "5")
        .replace("B", "8")
    )

    chunks = re.findall(r"[0-9][0-9,\.\s]{4,}[0-9]", normalized)

    candidates: list[str] = []

    for chunk in chunks:
        digits = re.sub(r"\D", "", chunk)
        if 6 <= len(digits) <= 10:
            candidates.append(digits)

    direct = re.findall(r"\d{6,10}", normalized)
    candidates.extend(direct)

    seen: set[str] = set()
    unique: list[str] = []

    for value in candidates:
        if value not in seen:
            seen.add(value)
            unique.append(value)

    return unique


def score_might_candidate(value: str) -> float:
    """
    Pontuação específica para valores de might.
    Para chief might, 8 ou 9 dígitos são os casos mais comuns.
    """
    score = 0.0
    digits = len(value)

    if digits == 9:
        score += 100
    elif digits == 8:
        score += 80
    elif digits == 7:
        score += 40
    else:
        score -= 50

    try:
        n = int(value)
    except ValueError:
        return -999

    if 1_000_000 <= n <= 999_999_999:
        score += 30
    else:
        score -= 100

    # Penaliza leituras absurdamente repetitivas: 11111115, 11111815, etc.
    most_common_count = max(value.count(d) for d in set(value))
    if most_common_count >= len(value) - 2:
        score -= 50

    # Penaliza muitos 1 quando o número é longo.
    if digits >= 8 and value.count("1") >= 5:
        score -= 35

    return score


def pick_best_number(candidates: Iterable[str]) -> str | None:
    candidates = list(candidates)

    if not candidates:
        return None

    # Se houver candidatos de 9 dígitos, dá prioridade a esses.
    nine_digit = [candidate for candidate in candidates if len(candidate) == 9]
    if nine_digit:
        return max(nine_digit, key=score_might_candidate)

    eight_digit = [candidate for candidate in candidates if len(candidate) == 8]
    if eight_digit:
        return max(eight_digit, key=score_might_candidate)

    return max(candidates, key=score_might_candidate)


def format_number(value: int) -> str:
    return f"{value:,}"