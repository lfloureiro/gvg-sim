from __future__ import annotations

import io
import re
from dataclasses import dataclass
from typing import Any, Dict, List, Optional, Tuple

import cv2
import easyocr
import numpy as np
from PIL import Image


Box = Tuple[int, int, int, int]


@dataclass(frozen=True)
class OcrBox:
    label: str
    rel_box: Tuple[float, float, float, float]


@dataclass
class NumberCandidate:
    value: int
    source: str
    length: int
    confidence: float
    text: str
    label: str
    role: str
    removed_index: Optional[int] = None
    removed_char: Optional[str] = None


@dataclass
class AttemptResult:
    label: str
    box: Box
    ok: bool
    value: Optional[int]
    formatted: Optional[str]
    raw_text: str
    candidates: List[str]
    candidateDetails: List[Dict[str, Any]]


class OcrEngine:
    """
    OCR engine for Fate War / GvG screenshots.

    Important rule:
    - Direct OCR readings are trusted above repaired readings.
    - Repaired readings are fallback only.
    - This prevents values like 193,189,919 becoming 19,318,919.
    """

    def __init__(self, gpu: bool = False) -> None:
        self.reader = easyocr.Reader(["en"], gpu=gpu, verbose=False)

        self.name_boxes: List[OcrBox] = [
            OcrBox("name_tight", (0.115, 0.047, 0.670, 0.121)),
            OcrBox("name_wide", (0.075, 0.036, 0.737, 0.137)),
            OcrBox("name_lower", (0.095, 0.063, 0.707, 0.157)),
        ]

        self.number_boxes: List[OcrBox] = [
            OcrBox("individual_top_very_tight", (0.344, 0.131, 0.766, 0.194)),
            OcrBox("individual_top_tight", (0.324, 0.126, 0.787, 0.205)),
            OcrBox("individual_top_wide", (0.286, 0.121, 0.806, 0.216)),
            OcrBox("individual_mid_tight", (0.344, 0.142, 0.766, 0.226)),
            OcrBox("individual_mid_wide", (0.286, 0.137, 0.806, 0.236)),
            OcrBox("kills_top_tight", (0.344, 0.216, 0.766, 0.284)),
            OcrBox("kills_top_wide", (0.286, 0.204, 0.806, 0.299)),
            OcrBox("kills_mid_tight", (0.344, 0.225, 0.766, 0.315)),
            OcrBox("kills_mid_wide", (0.286, 0.216, 0.806, 0.331)),
            OcrBox("top_info_number_area", (0.267, 0.109, 0.826, 0.331)),
        ]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def read_individual_might_from_full_screenshot(self, image: Any) -> Dict[str, Any]:
        try:
            img = self._to_numpy_rgb(image)

            name_result = self._read_chief_name_from_full_screenshot(img)

            all_attempts: List[AttemptResult] = []
            all_candidates: List[NumberCandidate] = []

            for ocr_box in self.number_boxes:
                role = self._role_from_label(ocr_box.label)
                attempt = self._read_number_attempt(img, ocr_box, role)
                all_attempts.append(attempt)

                for item in attempt.candidateDetails:
                    all_candidates.append(
                        NumberCandidate(
                            value=int(str(item["value"])),
                            source=str(item["source"]),
                            length=int(item["length"]),
                            confidence=float(item["confidence"]),
                            text=str(item["text"]),
                            label=str(item["label"]),
                            role=role,
                            removed_index=item.get("removed_index"),
                            removed_char=item.get("removed_char"),
                        )
                    )

            individual = self._select_individual_might(all_candidates)
            kills = self._select_kills(all_candidates, individual)

            return {
                "ok": individual is not None,
                "value": individual,
                "formatted": self._format_number(individual),
                "chiefName": name_result.get("value"),
                "individualMight": individual,
                "individualMightFormatted": self._format_number(individual),
                "kills": kills,
                "killsFormatted": self._format_number(kills),
                "raw_text": "",
                "candidates": [str(c.value) for c in all_candidates],
                "candidateDetails": [self._candidate_to_dict(c) for c in all_candidates],
                "nameAttempts": name_result.get("attempts", []),
                "attempts": [self._attempt_to_dict(a) for a in all_attempts],
            }

        except Exception as exc:
            import traceback

            return {
                "ok": False,
                "value": None,
                "formatted": None,
                "raw_text": "",
                "candidates": [],
                "attempts": [],
                "error": str(exc),
                "traceback": traceback.format_exc(),
            }

    # ------------------------------------------------------------------
    # Image conversion / crop
    # ------------------------------------------------------------------

    def _to_numpy_rgb(self, image: Any) -> np.ndarray:
        if isinstance(image, np.ndarray):
            arr = image
            if arr.ndim == 2:
                return cv2.cvtColor(arr, cv2.COLOR_GRAY2RGB)
            if arr.ndim == 3 and arr.shape[2] == 4:
                return cv2.cvtColor(arr, cv2.COLOR_RGBA2RGB)
            return arr

        if isinstance(image, Image.Image):
            return np.array(image.convert("RGB"))

        if isinstance(image, (bytes, bytearray)):
            pil_img = Image.open(io.BytesIO(image)).convert("RGB")
            return np.array(pil_img)

        if isinstance(image, str):
            pil_img = Image.open(image).convert("RGB")
            return np.array(pil_img)

        if hasattr(image, "read"):
            data = image.read()
            pil_img = Image.open(io.BytesIO(data)).convert("RGB")
            return np.array(pil_img)

        raise ValueError(
            "Invalid input type. Supporting format = string(file path or url), bytes, numpy array, PIL Image"
        )

    def _crop_rel(
        self,
        image: np.ndarray,
        rel_box: Tuple[float, float, float, float],
    ) -> Tuple[np.ndarray, Box]:
        h, w = image.shape[:2]

        x1 = max(0, min(w - 1, int(round(rel_box[0] * w))))
        y1 = max(0, min(h - 1, int(round(rel_box[1] * h))))
        x2 = max(0, min(w, int(round(rel_box[2] * w))))
        y2 = max(0, min(h, int(round(rel_box[3] * h))))

        if x2 <= x1:
            x2 = min(w, x1 + 1)
        if y2 <= y1:
            y2 = min(h, y1 + 1)

        return image[y1:y2, x1:x2].copy(), (x1, y1, x2, y2)

    def _prepare_number_crop(self, crop: np.ndarray) -> np.ndarray:
        if crop.size == 0:
            return crop

        resized = cv2.resize(
            crop,
            None,
            fx=3,
            fy=3,
            interpolation=cv2.INTER_CUBIC,
        )

        gray = cv2.cvtColor(resized, cv2.COLOR_RGB2GRAY)
        gray = cv2.GaussianBlur(gray, (3, 3), 0)
        gray = cv2.convertScaleAbs(gray, alpha=1.35, beta=12)

        return cv2.cvtColor(gray, cv2.COLOR_GRAY2RGB)

    def _prepare_name_crop(self, crop: np.ndarray) -> np.ndarray:
        if crop.size == 0:
            return crop

        return cv2.resize(
            crop,
            None,
            fx=2,
            fy=2,
            interpolation=cv2.INTER_CUBIC,
        )

    # ------------------------------------------------------------------
    # Name OCR
    # ------------------------------------------------------------------

    def _read_chief_name_from_full_screenshot(self, image: np.ndarray) -> Dict[str, Any]:
        attempts: List[Dict[str, Any]] = []
        best_value: Optional[str] = None
        best_score = -1.0

        for ocr_box in self.name_boxes:
            crop, box = self._crop_rel(image, ocr_box.rel_box)
            prepared = self._prepare_name_crop(crop)

            results = self.reader.readtext(
                prepared,
                detail=1,
                paragraph=False,
                decoder="greedy",
                batch_size=1,
            )

            raw_parts: List[str] = []
            candidates: List[Dict[str, Any]] = []

            for result in results:
                text = str(result[1]).strip()
                confidence = float(result[2])

                if text:
                    raw_parts.append(f"{text} ({confidence:.3f})")

                cleaned = self._clean_name(text)
                if not cleaned:
                    continue

                candidates.append(
                    {
                        "value": cleaned,
                        "confidence": confidence,
                        "label": ocr_box.label,
                    }
                )

                score = confidence + self._name_label_bonus(ocr_box.label)
                if score > best_score:
                    best_score = score
                    best_value = cleaned

            attempts.append(
                {
                    "label": ocr_box.label,
                    "box": list(box),
                    "ok": bool(candidates),
                    "value": candidates[0]["value"] if candidates else None,
                    "raw_text": "\n".join(raw_parts),
                    "candidates": candidates,
                }
            )

        return {
            "value": best_value,
            "attempts": attempts,
        }

    def _clean_name(self, text: str) -> Optional[str]:
        value = re.sub(r"[^A-Za-z0-9_\-\[\]]+", "", text).strip()

        if len(value) < 3:
            return None

        upper = value.upper()
        if upper.startswith("ID"):
            return None
        if "KINGDOM" in upper:
            return None

        return value

    def _name_label_bonus(self, label: str) -> float:
        if label == "name_tight":
            return 0.08
        if label == "name_lower":
            return 0.05
        return 0.0

    # ------------------------------------------------------------------
    # Number OCR
    # ------------------------------------------------------------------

    def _read_number_attempt(self, image: np.ndarray, ocr_box: OcrBox, role: str) -> AttemptResult:
        crop, box = self._crop_rel(image, ocr_box.rel_box)
        prepared = self._prepare_number_crop(crop)

        results = self.reader.readtext(
            prepared,
            detail=1,
            paragraph=False,
            decoder="greedy",
            allowlist="0123456789,.",
            batch_size=1,
        )

        raw_parts: List[str] = []
        candidates: List[NumberCandidate] = []

        for result in results:
            text = str(result[1]).strip()
            confidence = float(result[2])

            if text:
                raw_parts.append(f"{text} ({confidence:.3f})")

            candidates.extend(
                self._extract_number_candidates(
                    text=text,
                    confidence=confidence,
                    label=ocr_box.label,
                    role=role,
                )
            )

        selected = self._select_attempt_value(candidates, role)

        return AttemptResult(
            label=ocr_box.label,
            box=box,
            ok=bool(candidates),
            value=selected,
            formatted=self._format_number(selected),
            raw_text="\n".join(raw_parts),
            candidates=[str(c.value) for c in candidates],
            candidateDetails=[self._candidate_to_dict(c) for c in candidates],
        )

    def _extract_number_candidates(
        self,
        text: str,
        confidence: float,
        label: str,
        role: str,
    ) -> List[NumberCandidate]:
        out: List[NumberCandidate] = []

        normalized = text.replace(" ", "")
        parts = re.findall(r"[0-9][0-9,\.]*", normalized)

        for part in parts:
            digits = re.sub(r"\D", "", part)
            if not digits:
                continue

            self._add_candidate(
                out=out,
                digits=digits,
                source="direct",
                confidence=confidence,
                text=part,
                label=label,
                role=role,
            )

            # Keep repair candidates for diagnostics / fallback only.
            # Final selection strongly prefers direct readings.
            if len(digits) >= 8:
                for keep_len in (10, 9, 8):
                    if len(digits) > keep_len:
                        repaired = digits[-keep_len:]
                        self._add_candidate(
                            out=out,
                            digits=repaired,
                            source="repaired_left",
                            confidence=confidence,
                            text=part,
                            label=label,
                            role=role,
                        )

                if 8 <= len(digits) <= 11:
                    for i in range(len(digits)):
                        repaired = digits[:i] + digits[i + 1 :]
                        if len(repaired) < 7:
                            continue

                        self._add_candidate(
                            out=out,
                            digits=repaired,
                            source="repaired_drop_one",
                            confidence=confidence,
                            text=digits,
                            label=label,
                            role=role,
                            removed_index=i,
                            removed_char=digits[i],
                        )

        return self._dedupe_candidates(out)

    def _add_candidate(
        self,
        out: List[NumberCandidate],
        digits: str,
        source: str,
        confidence: float,
        text: str,
        label: str,
        role: str,
        removed_index: Optional[int] = None,
        removed_char: Optional[str] = None,
    ) -> None:
        if not digits:
            return

        if len(digits) < 2:
            return

        try:
            value = int(digits)
        except ValueError:
            return

        out.append(
            NumberCandidate(
                value=value,
                source=source,
                length=len(digits),
                confidence=float(confidence),
                text=str(text),
                label=label,
                role=role,
                removed_index=removed_index,
                removed_char=removed_char,
            )
        )

    def _dedupe_candidates(self, candidates: List[NumberCandidate]) -> List[NumberCandidate]:
        seen: set[Tuple[int, str, str, str, Optional[int]]] = set()
        out: List[NumberCandidate] = []

        for c in candidates:
            key = (c.value, c.source, c.label, c.text, c.removed_index)
            if key in seen:
                continue
            seen.add(key)
            out.append(c)

        return out

    def _select_attempt_value(self, candidates: List[NumberCandidate], role: str) -> Optional[int]:
        if not candidates:
            return None

        if role == "individual":
            return self._select_individual_might(candidates)

        if role == "kills":
            return self._select_kills(candidates, individual_might=None)

        return self._select_generic_number(candidates)

    def _role_from_label(self, label: str) -> str:
        if label.startswith("individual_"):
            return "individual"
        if label.startswith("kills_"):
            return "kills"
        return "mixed"

    # ------------------------------------------------------------------
    # Selection logic
    # ------------------------------------------------------------------

    def _select_individual_might(self, candidates: List[NumberCandidate]) -> Optional[int]:
        direct = [
            c
            for c in candidates
            if c.source == "direct"
            and c.role in ("individual", "mixed")
            and 10_000_000 <= c.value <= 350_000_000
        ]

        if direct:
            scores = self._aggregate_scores(
                direct,
                base_score_fn=self._score_individual_direct_candidate,
            )
            return max(scores.items(), key=lambda item: item[1])[0]

        fallback = [
            c
            for c in candidates
            if c.role in ("individual", "mixed")
            and 10_000_000 <= c.value <= 350_000_000
        ]

        if not fallback:
            return None

        scores = self._aggregate_scores(
            fallback,
            base_score_fn=self._score_repaired_fallback_candidate,
        )
        return max(scores.items(), key=lambda item: item[1])[0]

    def _select_kills(
        self,
        candidates: List[NumberCandidate],
        individual_might: Optional[int],
    ) -> Optional[int]:
        upper_limit = 500_000_000
        if individual_might:
            upper_limit = max(120_000_000, int(individual_might * 1.35))

        direct = [
            c
            for c in candidates
            if c.source == "direct"
            and c.role in ("kills", "mixed")
            and 1_000_000 <= c.value <= upper_limit
        ]

        if direct:
            scores = self._aggregate_scores(
                direct,
                base_score_fn=lambda c: self._score_kills_direct_candidate(c, individual_might),
            )
            return max(scores.items(), key=lambda item: item[1])[0]

        fallback = [
            c
            for c in candidates
            if c.role in ("kills", "mixed")
            and 1_000_000 <= c.value <= upper_limit
        ]

        if not fallback:
            return None

        scores = self._aggregate_scores(
            fallback,
            base_score_fn=lambda c: self._score_kills_fallback_candidate(c, individual_might),
        )
        return max(scores.items(), key=lambda item: item[1])[0]

    def _select_generic_number(self, candidates: List[NumberCandidate]) -> Optional[int]:
        direct = [c for c in candidates if c.source == "direct" and c.value >= 1_000]
        if direct:
            scores = self._aggregate_scores(
                direct,
                base_score_fn=lambda c: c.confidence + self._direct_label_bonus(c.label),
            )
            return max(scores.items(), key=lambda item: item[1])[0]

        fallback = [c for c in candidates if c.value >= 1_000]
        if not fallback:
            return None

        scores = self._aggregate_scores(
            fallback,
            base_score_fn=self._score_repaired_fallback_candidate,
        )
        return max(scores.items(), key=lambda item: item[1])[0]

    def _aggregate_scores(self, candidates: List[NumberCandidate], base_score_fn) -> Dict[int, float]:
        scores: Dict[int, float] = {}
        counts: Dict[int, int] = {}

        for c in candidates:
            base = float(base_score_fn(c))
            scores[c.value] = max(scores.get(c.value, -999.0), base)
            counts[c.value] = counts.get(c.value, 0) + 1

        for value, count in counts.items():
            scores[value] += min(0.20, 0.04 * (count - 1))

        return scores

    def _score_individual_direct_candidate(self, c: NumberCandidate) -> float:
        score = c.confidence
        score += self._individual_label_bonus(c.label)
        score += self._direct_length_bonus(c)

        if c.label.startswith("kills_"):
            score -= 0.80

        if c.label == "top_info_number_area":
            score -= 0.20

        return score

    def _score_kills_direct_candidate(
        self,
        c: NumberCandidate,
        individual_might: Optional[int],
    ) -> float:
        score = c.confidence
        score += self._kills_label_bonus(c.label)
        score += self._direct_length_bonus(c)

        if c.label.startswith("individual_"):
            score -= 0.80

        if individual_might:
            ratio = c.value / max(1, individual_might)

            if 0.35 <= ratio <= 1.25:
                score += 0.25
            elif ratio < 0.20:
                score -= 0.40
            elif ratio > 1.40:
                score -= 0.50

        return score

    def _score_repaired_fallback_candidate(self, c: NumberCandidate) -> float:
        score = c.confidence

        if c.source == "direct":
            score += 0.20
        elif c.source == "repaired_left":
            score -= 0.45
        elif c.source == "repaired_drop_one":
            score -= 0.60
            score += self._drop_one_quality_bonus(c)

        score += self._direct_length_bonus(c)

        return score

    def _score_kills_fallback_candidate(
        self,
        c: NumberCandidate,
        individual_might: Optional[int],
    ) -> float:
        score = self._score_repaired_fallback_candidate(c)

        if individual_might:
            ratio = c.value / max(1, individual_might)

            if 0.35 <= ratio <= 1.25:
                score += 0.20
            elif ratio < 0.20:
                score -= 0.35
            elif ratio > 1.40:
                score -= 0.45

        return score

    def _drop_one_quality_bonus(self, c: NumberCandidate) -> float:
        if c.source != "repaired_drop_one":
            return 0.0

        digits = re.sub(r"\D", "", c.text)
        idx = c.removed_index

        if idx is None or idx < 0 or idx >= len(digits):
            return 0.0

        bonus = 0.0

        if idx > 0 and digits[idx] == digits[idx - 1]:
            bonus += 0.10

        if idx + 1 < len(digits) and digits[idx] == digits[idx + 1]:
            bonus += 0.05

        repaired = str(c.value)

        if len(digits) >= 3 and len(repaired) >= 3:
            if repaired.startswith(digits[:3]):
                bonus += 0.05
            else:
                bonus -= 0.10

        return bonus

    def _direct_length_bonus(self, c: NumberCandidate) -> float:
        if c.length == 9:
            return 0.12
        if c.length == 8:
            return 0.10
        if c.length == 10:
            return -0.08
        if c.length <= 7:
            return -0.20
        return 0.0

    def _direct_label_bonus(self, label: str) -> float:
        if label.endswith("_tight"):
            return 0.08
        if label.endswith("_wide"):
            return 0.06
        if label == "top_info_number_area":
            return 0.02
        return 0.0

    def _individual_label_bonus(self, label: str) -> float:
        table = {
            "individual_top_tight": 0.28,
            "individual_top_very_tight": 0.24,
            "individual_top_wide": 0.20,
            "individual_mid_tight": -0.08,
            "individual_mid_wide": -0.16,
            "top_info_number_area": -0.18,
        }
        return table.get(label, -0.30)

    def _kills_label_bonus(self, label: str) -> float:
        table = {
            "kills_top_wide": 0.28,
            "kills_mid_wide": 0.12,
            "kills_top_tight": 0.08,
            "kills_mid_tight": -0.08,
            "top_info_number_area": 0.04,
        }
        return table.get(label, -0.35)

    # ------------------------------------------------------------------
    # Formatting / serialization
    # ------------------------------------------------------------------

    def _format_number(self, value: Optional[int]) -> Optional[str]:
        if value is None:
            return None
        return f"{int(value):,}"

    def _candidate_to_dict(self, c: NumberCandidate) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "value": str(c.value),
            "source": c.source,
            "length": c.length,
            "confidence": c.confidence,
            "text": c.text,
            "label": c.label,
        }

        if c.removed_index is not None:
            data["removed_index"] = c.removed_index
        if c.removed_char is not None:
            data["removed_char"] = c.removed_char

        return data

    def _attempt_to_dict(self, a: AttemptResult) -> Dict[str, Any]:
        return {
            "label": a.label,
            "box": list(a.box),
            "ok": a.ok,
            "value": a.value,
            "formatted": a.formatted,
            "raw_text": a.raw_text,
            "candidates": a.candidates,
            "candidateDetails": a.candidateDetails,
        }