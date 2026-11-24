from bs4 import BeautifulSoup

from .models import SongRecord


def parse_html(html: str, source_url: str) -> list[SongRecord]:
    """Parse the explicitly marked song sections of the fictional HTML format."""
    soup = BeautifulSoup(html, "html.parser")
    broadcasts = soup.select("article.broadcast")
    if not broadcasts:
        raise ValueError("放送記事が見つかりません。テスト用HTMLの形式を確認してください。")

    records: list[SongRecord] = []
    for broadcast in broadcasts:
        sections = broadcast.select(":scope > section[data-section='songs']")
        if not sections:
            raise ValueError("歌のセクションが見つかりません。テスト用HTMLの形式を確認してください。")
        broadcast_date = str(broadcast.get("data-broadcast-date", ""))
        original_broadcast_date = str(broadcast.get("data-original-broadcast-date", ""))
        sequence = 0
        for section in sections:
            items = section.select(":scope > ol > li")
            if not items:
                raise ValueError("歌の一覧が見つかりません。テスト用HTMLの形式を確認してください。")
            for item in items:
                sequence += 1
                title = item.select_one(":scope > .song-title")
                song_title = title.get_text() if title else ""
                records.append(
                    {
                        "broadcast_date": broadcast_date,
                        "original_broadcast_date": original_broadcast_date,
                        "song_title": song_title,
                        "song_title_normalized": "",
                        "category": str(item.get("data-category", "")),
                        "sequence": sequence,
                        "source_url": source_url,
                        "review_status": "pending",
                    }
                )
    return records
