#!/usr/bin/env python3
"""
Development setup script: creates virtual environment and installs all Python dependencies.

Module:    scripts.setup_api
Author:    Evelin Brandão Cordeiro
Copyright: 2026 Anicca. All rights reserved.
License:   MIT
"""

import subprocess
import sys
from pathlib import Path

_API_DIR = Path(__file__).parent.parent / "apps" / "api"


def main() -> None:
    """Create a virtual environment and install API dependencies.

    Raises:
        SystemExit: When any subprocess command fails.
    """
    venv_path = _API_DIR / ".venv"

    subprocess.run(
        [sys.executable, "-m", "venv", str(venv_path)],
        check=True,
    )

    pip = venv_path / ("Scripts" if sys.platform == "win32" else "bin") / "pip"

    subprocess.run(
        [str(pip), "install", "--upgrade", "pip"],
        check=True,
    )

    subprocess.run(
        [str(pip), "install", "-r", str(_API_DIR / "requirements.txt")],
        check=True,
    )

    print("\n✅ API virtual environment ready.")
    print(f"   Activate: source {venv_path}/bin/activate  (Linux/macOS)")
    print(f"   Activate: {venv_path}\\Scripts\\activate  (Windows)")
    print("   Run API:  uvicorn main:app --reload --port 8000")


if __name__ == "__main__":
    main()
