import csv
import os
import subprocess
import sys
from pathlib import Path

import pytest

from scripts.data_pipeline.export_csv import export_csv
from scripts.data_pipeline.normalizer import normalize_record
from scripts.data_pipeline.parser import parse_html
from scripts.data_pipeline.validator import validate_records

ROOT = Path(__file__).resolve().parents[1]


def read_csv(path):
    with path.open(encoding="utf-8-sig", newline="") as file:
        return list(csv.DictReader(file))


def test_end_to_end_cli_separates_csvs_and_keeps_all_records_pending(tmp_path):
    valid_path = tmp_path / "processed" / "songs.csv"
    review_path = tmp_path / "review" / "songs.csv"
    result = subprocess.run(
        [
            sys.executable,
            "-m",
            "scripts.data_pipeline",
            str(ROOT / "data" / "test_fixtures" / "fictional_broadcasts.html"),
            "--valid-output",
            str(valid_path),
            "--review-output",
            str(review_path),
        ],
        cwd=ROOT,
        capture_output=True,
        text=True,
        encoding="utf-8",
        env={**os.environ, "PYTHONIOENCODING": "utf-8"},
        check=True,
    )
    assert "3件" in result.stdout and "2件" in result.stdout
    valid = read_csv(valid_path)
    review = read_csv(review_path)
    assert len(valid) == 3
    assert len(review) == 2
    assert all(row["review_status"] == "pending" for row in valid + review)
    assert {row["validation_errors"] for row in review} == {"empty_song_title", "invalid_category"}
    assert all(row["source_url"] == "https://example.invalid/test-fixture" for row in valid + review)
    assert [(row["broadcast_date"], row["sequence"], row["category"]) for row in valid] == [
        ("2024-04-01", "1", "monthly_song"),
        ("2024-04-01", "2", "regular_song"),
        ("2024-04-02", "1", "monthly_song"),
    ]
    assert valid[0]["song_title"] == valid[2]["song_title"]
    assert valid[0]["original_broadcast_date"] == ""
    assert valid[2]["original_broadcast_date"] == "2024-04-01"
    assert all(row["song_title_normalized"] == row["song_title"] for row in valid)
    assert review[0]["song_title"] == "　 "
    assert review[0]["song_title_normalized"] == ""


def test_original_title_and_invalid_original_date_survive_to_csv(tmp_path):
    html = """
    <article class="broadcast" data-broadcast-date="2024-04-02"
             data-original-broadcast-date="2024-02-30">
      <section data-section="songs"><ol>
        <li data-category="regular_song"><span class="song-title">　架空 Ａ　</span></li>
      </ol></section>
    </article>
    """
    records = [normalize_record(record) for record in parse_html(html, "https://example.invalid/test")]
    valid, review = validate_records(records)
    valid_path, review_path = tmp_path / "valid.csv", tmp_path / "review.csv"
    export_csv(valid, review, valid_path, review_path)

    assert read_csv(valid_path) == []
    row = read_csv(review_path)[0]
    assert row["broadcast_date"] == "2024-04-02"
    assert row["original_broadcast_date"] == "2024-02-30"
    assert row["song_title"] == "　架空 Ａ　"
    assert row["song_title_normalized"] == "架空 A"
    assert row["validation_errors"] == "invalid_original_broadcast_date"
    assert row["review_status"] == "pending"


def test_export_writes_headers_for_empty_results(tmp_path):
    valid_path, review_path = tmp_path / "valid.csv", tmp_path / "review.csv"
    export_csv([], [], valid_path, review_path)
    assert "review_status" in valid_path.read_text(encoding="utf-8-sig")
    assert "validation_errors" in review_path.read_text(encoding="utf-8-sig")


def test_refuses_to_overwrite_either_output(tmp_path):
    valid_path, review_path = tmp_path / "valid.csv", tmp_path / "review.csv"
    review_path.write_text("existing", encoding="utf-8")
    with pytest.raises(FileExistsError):
        export_csv([], [], valid_path, review_path)
    assert review_path.read_text(encoding="utf-8") == "existing"
    assert not valid_path.exists()


def test_refuses_same_output_path(tmp_path):
    path = tmp_path / "same.csv"
    with pytest.raises(ValueError):
        export_csv([], [], path, path)
    assert not path.exists()
