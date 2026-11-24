import type { BroadcastRecord } from './fictional-broadcasts';

export type FavoriteSong = { songId: string; title: string };

export function toggleFavorite(songIds: readonly string[], songId: string): string[] {
  return songIds.includes(songId) ? songIds.filter((id) => id !== songId) : [...songIds, songId];
}

export function getFavoriteSongs(records: readonly BroadcastRecord[], songIds: readonly string[]): FavoriteSong[] {
  const favorites = new Set(songIds);
  const seen = new Set<string>();
  const songs: FavoriteSong[] = [];
  for (const record of records) {
    if (favorites.has(record.songId) && !seen.has(record.songId)) {
      songs.push({ songId: record.songId, title: record.title });
      seen.add(record.songId);
    }
  }
  return songs;
}
