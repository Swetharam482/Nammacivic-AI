"""
NammaCivic AI - Dataset Loading and Knowledge Repository Service
Reads NammaCivic_AI_Grievance_Dataset.xlsx from datas/ folder,
validates required sheets and columns, caches structured data in memory,
and exports JSON snapshots for high performance.
"""

import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, List, Optional
import openpyxl

logger = logging.getLogger(__name__)

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PROJECT_ROOT = BASE_DIR.parent if BASE_DIR.name == "backend" else BASE_DIR

DEFAULT_DATASET_1000_PATH = PROJECT_ROOT / "datas" / "NammaCivic_AI_Grievance_Dataset_1000.xlsx"
DEFAULT_DATASET_PATH = PROJECT_ROOT / "datas" / "NammaCivic_AI_Grievance_Dataset.xlsx"
DATA_DIR = PROJECT_ROOT / "datas"

REQUIRED_SHEETS = [
    "Read_Me",
    "Grievance_Examples",
    "Conversation_History",
    "Categories",
    "Address_Test_Cases"
]

class DatasetService:
    def __init__(self, excel_path: Optional[Path] = None):
        target_path = None
        if excel_path:
            target_path = excel_path
        elif os.getenv("DATASET_EXCEL_PATH"):
            target_path = Path(os.getenv("DATASET_EXCEL_PATH"))
        elif DEFAULT_DATASET_1000_PATH.exists():
            target_path = DEFAULT_DATASET_1000_PATH
        else:
            target_path = DEFAULT_DATASET_PATH

        self.excel_path = target_path
        self.data_dir = self.excel_path.parent
        self.is_loaded = False
        self.error_message: Optional[str] = None

        self.read_me: List[Dict[str, Any]] = []
        self.categories: List[Dict[str, Any]] = []
        self.grievance_examples: List[Dict[str, Any]] = []
        self.conversation_history: List[Dict[str, Any]] = []
        self.address_test_cases: List[Dict[str, Any]] = []

        # Indexed lookups
        self.categories_by_code: Dict[str, Dict[str, Any]] = {}
        self.examples_by_category: Dict[str, List[Dict[str, Any]]] = {}
        self.conversations_by_id: Dict[str, List[Dict[str, Any]]] = {}

        # Auto-load on initialization
        self.load_dataset()

    def load_dataset(self, force_reload: bool = False) -> bool:
        if self.is_loaded and not force_reload:
            return True

        if not self.excel_path.exists():
            # Attempt to check if JSON snapshots exist as fallback
            if self._load_from_json_cache():
                logger.info("Loaded dataset from existing JSON cache files in datas/.")
                self.is_loaded = True
                return True

            self.error_message = f"Excel dataset file not found at: {self.excel_path}"
            logger.error(self.error_message)
            return False

        try:
            logger.info(f"Loading Excel dataset from {self.excel_path}...")
            wb = openpyxl.load_workbook(str(self.excel_path), data_only=True)

            # 1. Validate sheets
            missing_sheets = [s for s in REQUIRED_SHEETS if s not in wb.sheetnames]
            if missing_sheets:
                self.error_message = f"Dataset is missing required sheets: {missing_sheets}"
                logger.error(self.error_message)
                return False

            # 2. Load Read_Me
            self.read_me = self._read_sheet(wb["Read_Me"])

            # 3. Load Categories
            self.categories = self._read_sheet(wb["Categories"])
            self.categories_by_code = {
                str(c.get("category_code", "")).strip().upper(): c
                for c in self.categories if c.get("category_code")
            }

            # 4. Load Grievance_Examples
            self.grievance_examples = self._read_sheet(wb["Grievance_Examples"])
            self.examples_by_category = {}
            for g in self.grievance_examples:
                code = str(g.get("category_code", "")).strip().upper()
                self.examples_by_category.setdefault(code, []).append(g)

            # 5. Load Conversation_History
            self.conversation_history = self._read_sheet(wb["Conversation_History"])
            self.conversations_by_id = {}
            for t in self.conversation_history:
                conv_id = str(t.get("conversation_id", "")).strip()
                self.conversations_by_id.setdefault(conv_id, []).append(t)

            # Sort conversation turns sequentially
            for conv_id in self.conversations_by_id:
                self.conversations_by_id[conv_id].sort(key=lambda x: int(x.get("turn", 0)))

            # 6. Load Address_Test_Cases
            self.address_test_cases = self._read_sheet(wb["Address_Test_Cases"])

            # 7. Export JSON snapshots for fast caching & inspection
            self._export_json_snapshots()

            self.is_loaded = True
            self.error_message = None
            logger.info(
                f"Successfully loaded dataset: {len(self.categories)} categories, "
                f"{len(self.grievance_examples)} grievance examples, "
                f"{len(self.conversation_history)} conversation turns ({len(self.conversations_by_id)} conversations), "
                f"{len(self.address_test_cases)} address test cases."
            )
            return True

        except Exception as e:
            self.error_message = f"Failed to load Excel dataset: {str(e)}"
            logger.exception(self.error_message)
            return False

    def _read_sheet(self, sheet) -> List[Dict[str, Any]]:
        rows = list(sheet.iter_rows(values_only=True))
        if not rows:
            return []
        raw_headers = rows[0]
        headers = [str(h).strip() if h is not None else f"col_{i}" for i, h in enumerate(raw_headers)]

        data = []
        for r in rows[1:]:
            if all(v is None for v in r):
                continue
            item = {}
            for h, val in zip(headers, r):
                item[h] = val
                item[h.lower()] = val
            data.append(item)
        return data

    def _export_json_snapshots(self):
        """Saves structured JSON snapshots in datas/ for fast fallback and external inspection."""
        try:
            self.data_dir.mkdir(parents=True, exist_ok=True)
            files = {
                "categories.json": self.categories,
                "grievance_examples.json": self.grievance_examples,
                "conversation_history.json": self.conversation_history,
                "address_test_cases.json": self.address_test_cases,
                "read_me.json": self.read_me
            }
            for filename, data in files.items():
                out_path = self.data_dir / filename
                with open(out_path, "w", encoding="utf-8") as f:
                    json.dump(data, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.warning(f"Could not export JSON snapshots: {e}")

    def _load_from_json_cache(self) -> bool:
        """Loads from JSON snapshots if Excel is temporarily unavailable."""
        cat_file = self.data_dir / "categories.json"
        ex_file = self.data_dir / "grievance_examples.json"
        conv_file = self.data_dir / "conversation_history.json"
        addr_file = self.data_dir / "address_test_cases.json"

        if cat_file.exists() and ex_file.exists():
            try:
                with open(cat_file, "r", encoding="utf-8") as f:
                    self.categories = json.load(f)
                with open(ex_file, "r", encoding="utf-8") as f:
                    self.grievance_examples = json.load(f)
                if conv_file.exists():
                    with open(conv_file, "r", encoding="utf-8") as f:
                        self.conversation_history = json.load(f)
                if addr_file.exists():
                    with open(addr_file, "r", encoding="utf-8") as f:
                        self.address_test_cases = json.load(f)

                self.categories_by_code = {
                    str(c.get("category_code", "")).strip().upper(): c
                    for c in self.categories if c.get("category_code")
                }
                self.examples_by_category = {}
                for g in self.grievance_examples:
                    code = str(g.get("category_code", "")).strip().upper()
                    self.examples_by_category.setdefault(code, []).append(g)

                self.conversations_by_id = {}
                for t in self.conversation_history:
                    conv_id = str(t.get("conversation_id", "")).strip()
                    self.conversations_by_id.setdefault(conv_id, []).append(t)

                return True
            except Exception as e:
                logger.warning(f"Failed to load from JSON cache: {e}")
        return False

    def get_summary(self) -> Dict[str, Any]:
        return {
            "loaded": self.is_loaded,
            "excel_path": str(self.excel_path),
            "error": self.error_message,
            "counts": {
                "categories": len(self.categories),
                "grievance_examples": len(self.grievance_examples),
                "conversation_turns": len(self.conversation_history),
                "conversations": len(self.conversations_by_id),
                "address_test_cases": len(self.address_test_cases)
            }
        }

dataset_service = DatasetService()
