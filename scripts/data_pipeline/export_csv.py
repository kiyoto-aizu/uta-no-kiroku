import csv
from pathlib import Path

from .models import ReviewRecord, SongRecord

FIELDS = (
    "broadcast_date",
    "original_broadcast_date",
    "song_title",
    "song_title_normalized",
    "category",
    "sequence",
    "source_url",
    "review_status",
)


def export_csv(
    valid: list[SongRecord],
    review: list[ReviewRecord],
    valid_path: Path,
    review_path: Path,
) -> None:
    """Write separate CSVs without overwriting existing files."""
    if valid_path.resolve() == review_path.resolve():
        raise ValueError("正常データと確認待ちデータの出力先は別にしてください。")
    for path in (valid_path, review_path):
        if path.exists():
            raise FileExistsError(f"出力先が既に存在します: {path}")
    for path in (valid_path, review_path):
        path.parent.mkdir(parents=True, exist_ok=True)

    with valid_path.open("x", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(valid)
    with review_path.open("x", encoding="utf-8-sig", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=(*FIELDS, "validation_errors"))
        writer.writeheader()
        writer.writerows(review)
