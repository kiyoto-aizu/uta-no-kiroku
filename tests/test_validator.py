import pytest

from scripts.data_pipeline.normalizer import normalize_record
from scripts.data_pipeline.validator import validate_records


def sample_record(**changes):
    record = {
        "broadcast_date": "2024-04-01",
        "original_broadcast_date": "",
        "song_title": "架空のうた",
        "song_title_normalized": "",
        "category": "regular_song",
        "sequence": 1,
        "source_url": "https://example.invalid/test-fixture",
        "review_status": "pending",
    }
    return normalize_record({**record, **changes})


@pytest.mark.parametrize("date_text", ["", "2024-4-01", "2024-02-30", "20240401", "not-a-date"])
def test_invalid_dates_are_separated(date_text):
    valid, review = validate_records([sample_record(broadcast_date=date_text)])
    assert not valid
    assert review[0]["validation_errors"] == "invalid_date"
    assert review[0]["review_status"] == "pending"


def test_reports_multiple_errors_and_never_approves():
    valid, review = validate_records(
        [sample_record(song_title=" ", category="unknown", sequence=0, review_status="approved")]
    )
    assert not valid
    assert review[0]["validation_errors"] == "empty_song_title;invalid_category;invalid_sequence"
    assert review[0]["review_status"] == "pending"


def test_duplicate_is_based_on_date_title_and_sequence():
    first = sample_record()
    duplicate = sample_record(category="monthly_song")
    other_day = sample_record(broadcast_date="2024-04-02")
    other_sequence = sample_record(sequence=2)
    valid, review = validate_records([first, duplicate, other_day, other_sequence])
    assert valid == [first, other_day, other_sequence]
    assert len(review) == 1
    assert review[0]["validation_errors"] == "duplicate"


def test_valid_records_remain_pending_even_if_input_was_approved():
    valid, review = validate_records([sample_record(review_status="approved")])
    assert valid[0]["review_status"] == "pending"
    assert not review


@pytest.mark.parametrize("original_date", ["2024-02-30", "2024-4-01", "unknown"])
def test_invalid_original_date_is_preserved_and_sent_to_review(original_date):
    valid, review = validate_records([sample_record(original_broadcast_date=original_date)])
    assert not valid
    assert review[0]["original_broadcast_date"] == original_date
    assert review[0]["validation_errors"] == "invalid_original_broadcast_date"
    assert review[0]["review_status"] == "pending"


def test_normalized_title_detects_duplicate_without_changing_original():
    first = sample_record(song_title="架空 Ａ")
    duplicate = sample_record(song_title="架空　A")
    valid, review = validate_records([first, duplicate])
    assert valid[0]["song_title"] == "架空 Ａ"
    assert review[0]["song_title"] == "架空　A"
    assert review[0]["song_title_normalized"] == "架空 A"
    assert review[0]["validation_errors"] == "duplicate"
