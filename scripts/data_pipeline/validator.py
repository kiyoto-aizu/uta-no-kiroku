import re
from datetime import date

from .models import ReviewRecord, SongRecord

VALID_CATEGORIES = {"monthly_song", "regular_song"}


def is_valid_date(date_text: str) -> bool:
    if not re.fullmatch(r"[0-9]{4}-[0-9]{2}-[0-9]{2}", date_text):
        return False
    try:
        date.fromisoformat(date_text)
    except ValueError:
        return False
    return True


def validate_records(records: list[SongRecord]) -> tuple[list[SongRecord], list[ReviewRecord]]:
    """Separate valid records from records needing investigation; none are approved."""
    valid: list[SongRecord] = []
    review: list[ReviewRecord] = []
    seen: set[tuple[str, str, int]] = set()

    for record in records:
        errors: list[str] = []
        date_text = record["broadcast_date"]
        valid_date = is_valid_date(date_text)
        if not valid_date:
            errors.append("invalid_date")
        if record["original_broadcast_date"] and not is_valid_date(record["original_broadcast_date"]):
            errors.append("invalid_original_broadcast_date")
        if not record["song_title_normalized"]:
            errors.append("empty_song_title")
        if record["category"] not in VALID_CATEGORIES:
            errors.append("invalid_category")
        if record["sequence"] < 1:
            errors.append("invalid_sequence")

        if valid_date and record["song_title_normalized"] and record["sequence"] >= 1:
            key = (date_text, record["song_title_normalized"], record["sequence"])
            if key in seen:
                errors.append("duplicate")
            else:
                seen.add(key)

        pending_record: SongRecord = {**record, "review_status": "pending"}
        if errors:
            review.append({**pending_record, "validation_errors": ";".join(errors)})
        else:
            valid.append(pending_record)
    return valid, review
