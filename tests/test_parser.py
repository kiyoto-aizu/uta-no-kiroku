from pathlib import Path

import pytest

from scripts.data_pipeline.parser import parse_html

FIXTURE = Path("data/test_fixtures/fictional_broadcasts.html")
SOURCE_URL = "https://example.invalid/test-fixture"


def test_extracts_only_song_sections_from_fictional_fixture():
    records = parse_html(FIXTURE.read_text(encoding="utf-8"), SOURCE_URL)

    assert len(records) == 5
    assert records[0] == {
        "broadcast_date": "2024-04-01",
        "original_broadcast_date": "",
        "song_title": "テストの月のうた",
        "song_title_normalized": "",
        "category": "monthly_song",
        "sequence": 1,
        "source_url": SOURCE_URL,
        "review_status": "pending",
    }
    assert records[1]["category"] == "regular_song"
    assert records[2]["song_title"] == "　 "
    assert records[3]["broadcast_date"] == "2024-04-02"
    assert records[3]["original_broadcast_date"] == "2024-04-01"
    assert records[3]["song_title"] == records[0]["song_title"]
    assert records[3]["sequence"] == 1
    assert all("体操" not in record["song_title"] and "終わり" not in record["song_title"] for record in records)


def test_missing_title_and_category_remain_invalid_values():
    html = """
    <article class="broadcast" data-broadcast-date="2024-04-01">
      <section data-section="songs"><ol><li></li></ol></section>
    </article>
    """
    record = parse_html(html, SOURCE_URL)[0]
    assert record["song_title"] == ""
    assert record["category"] == ""


@pytest.mark.parametrize(
    "html",
    [
        "<html><body>not a broadcast</body></html>",
        '<article class="broadcast"><section data-section="ending"></section></article>',
        '<article class="broadcast"><section data-section="songs"></section></article>',
    ],
)
def test_rejects_unrecognized_or_incomplete_structure(html):
    with pytest.raises(ValueError):
        parse_html(html, SOURCE_URL)
