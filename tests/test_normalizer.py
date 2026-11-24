from scripts.data_pipeline.normalizer import normalize_record


def test_normalizes_whitespace_and_width_without_mutating_input():
    record = {
        "broadcast_date": " 2024-04-01 ",
        "original_broadcast_date": " 2024-03-01 ",
        "song_title": "　テスト　Ａ  のうた　",
        "song_title_normalized": "",
        "category": " regular_song ",
        "sequence": 2,
        "source_url": " https://example.invalid/test-fixture ",
        "review_status": "pending",
    }
    normalized = normalize_record(record)
    assert normalized["song_title"] == "　テスト　Ａ  のうた　"
    assert normalized["song_title_normalized"] == "テスト A のうた"
    assert normalized["broadcast_date"] == "2024-04-01"
    assert normalized["original_broadcast_date"] == "2024-03-01"
    assert normalized["category"] == "regular_song"
    assert normalized["source_url"] == "https://example.invalid/test-fixture"
    assert record["song_title"] == "　テスト　Ａ  のうた　"


def test_does_not_invent_missing_values():
    record = {
        "broadcast_date": "",
        "original_broadcast_date": "",
        "song_title": "　",
        "song_title_normalized": "",
        "category": "",
        "sequence": 1,
        "source_url": "https://example.invalid/test-fixture",
        "review_status": "pending",
    }
    normalized = normalize_record(record)
    assert normalized["song_title"] == "　"
    assert normalized["song_title_normalized"] == ""
    assert normalized["original_broadcast_date"] == ""
    assert normalized["broadcast_date"] == ""
    assert normalized["category"] == ""
