import unicodedata

from .models import SongRecord


def normalize_record(record: SongRecord) -> SongRecord:
    """Normalize harmless text formatting without guessing missing values."""
    return {
        **record,
        "broadcast_date": record["broadcast_date"].strip(),
        "original_broadcast_date": record["original_broadcast_date"].strip(),
        "song_title_normalized": " ".join(unicodedata.normalize("NFKC", record["song_title"]).split()),
        "category": record["category"].strip(),
        "source_url": record["source_url"].strip(),
    }
