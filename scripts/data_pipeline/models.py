from typing import TypedDict


class SongRecord(TypedDict):
    broadcast_date: str
    original_broadcast_date: str
    song_title: str
    song_title_normalized: str
    category: str
    sequence: int
    source_url: str
    review_status: str


class ReviewRecord(SongRecord):
    validation_errors: str
