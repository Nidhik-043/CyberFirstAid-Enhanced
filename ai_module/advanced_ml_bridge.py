import json
import subprocess
import os

from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent

ADVANCED_PYTHON = (
    ROOT / "ai_module" / "advanced_venv"
    / "Scripts" / "python.exe"
)


def predict_using_advanced_model(url):

    if not ADVANCED_PYTHON.is_file():
        return {
            "model_available": False,
            "error": "Advanced Python environment not found"
        }

    script = """
import sys
import json
from ai_module.advanced_ml_predictor import predict_advanced

url = json.loads(sys.stdin.read())
result = predict_advanced(url)
print(json.dumps(result))
"""

    try:
        result = subprocess.run(
            [str(ADVANCED_PYTHON), "-c", script],
            input=json.dumps(url),
            cwd=str(ROOT),
            capture_output=True,
            text=True,
            encoding="utf-8",
            timeout=20,
            env={
                **os.environ,
                "PYTHONIOENCODING": "utf-8"
            }
        )

        if result.returncode != 0:
            return {
                "model_available": False,
                "error": "Advanced prediction process failed"
            }

        return json.loads(result.stdout)

    except subprocess.TimeoutExpired:
        return {
            "model_available": False,
            "error": "Advanced model prediction timed out"
        }

    except (OSError, ValueError):
        return {
            "model_available": False,
            "error": "Advanced model communication failed"
        }


if __name__ == "__main__":
    result = predict_using_advanced_model(
        "https://www.google.com"
    )

    print(json.dumps(result, indent=4))
