import argparse
from pathlib import Path

from .export_csv import export_csv
from .normalizer import normalize_record
from .parser import parse_html
from .validator import validate_records


def main() -> None:
    parser = argparse.ArgumentParser(description="架空のローカルHTMLを解析し、CSVに出力します。")
    parser.add_argument("html", type=Path, help="ローカルHTMLファイル")
    parser.add_argument("--source-url", default="https://example.invalid/test-fixture")
    parser.add_argument("--valid-output", type=Path, default=Path("data/processed/songs.csv"))
    parser.add_argument("--review-output", type=Path, default=Path("data/review/songs.csv"))
    args = parser.parse_args()

    html = args.html.read_text(encoding="utf-8")
    records = [normalize_record(record) for record in parse_html(html, args.source_url)]
    valid, review = validate_records(records)
    export_csv(valid, review, args.valid_output, args.review_output)
    print(f"検証済み: {len(valid)}件、要確認: {len(review)}件（全件 pending）")
    print(f"出力先: {args.valid_output}, {args.review_output}")


if __name__ == "__main__":
    main()
