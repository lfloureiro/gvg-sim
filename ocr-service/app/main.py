from __future__ import annotations

import io
import traceback

from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .ocr_engine import OcrEngine

app = FastAPI(title="MF69 OCR Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://mf69app.lptd.casa",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

engine = OcrEngine()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


def load_uploaded_image(content: bytes) -> Image.Image:
    image = Image.open(io.BytesIO(content))
    image.load()
    return image.convert("RGB")


@app.post("/ocr/might")
async def ocr_might(file: UploadFile = File(...)) -> dict:
    try:
        content = await file.read()
        image = load_uploaded_image(content)
        return engine.read_might(image)

    except Exception as exc:
        return {
            "ok": False,
            "value": None,
            "formatted": None,
            "raw_text": "",
            "candidates": [],
            "error": str(exc),
            "traceback": traceback.format_exc(),
        }


@app.post("/ocr/might/full-screenshot")
async def ocr_might_full_screenshot(file: UploadFile = File(...)) -> dict:
    try:
        content = await file.read()
        image = load_uploaded_image(content)
        return engine.read_individual_might_from_full_screenshot(image)

    except Exception as exc:
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