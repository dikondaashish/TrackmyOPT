"""Resolve optional local H1B/LCA raw data directory for ETL scripts."""

from __future__ import annotations

import os
from pathlib import Path


def repo_root() -> Path:
    return Path(__file__).resolve().parents[3]


def get_h1b_raw_data_dir() -> Path:
    env = os.environ.get("H1B_RAW_DATA_DIR", "").strip()
    if env:
        return Path(env).expanduser().resolve()
    return repo_root() / "ITContractorsUnion-Main"


def require_h1b_raw_data_dir() -> Path:
    data_dir = get_h1b_raw_data_dir()
    if not data_dir.is_dir():
        raise FileNotFoundError(
            f"H1B raw data folder not found at {data_dir}.\n"
            "Download DOL LCA data or the ITContractorsUnion dataset, then set:\n"
            "  export H1B_RAW_DATA_DIR=/path/to/ITContractorsUnion-Main"
        )
    return data_dir
