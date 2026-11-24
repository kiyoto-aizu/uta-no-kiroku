import assert from 'node:assert/strict';
import test from 'node:test';

import { getFavoriteSongs, toggleFavorite } from '../src/data/favorites.ts';
import { fictionalBroadcasts } from '../src/data/fictional-broadcasts.ts';

test('adding and removing a song updates the favorite list', () => {
  const initial = [];
  const added = toggleFavorite(initial, 'song-1');
  assert.deepEqual(initial, []);
  assert.deepEqual(getFavoriteSongs(fictionalBroadcasts, added), [
    { songId: 'song-1', title: 'テストの月のうた' },
  ]);
  const removed = toggleFavorite(added, 'song-1');
  assert.deepEqual(removed, []);
  assert.deepEqual(getFavoriteSongs(fictionalBroadcasts, removed), []);
});

test('favorites are song-based, not broadcast- or title-based', () => {
  const records = [
    { id: 'a', songId: 'first', title: '同名', broadcastDate: '2024-01-01', category: 'regular_song' },
    { id: 'b', songId: 'first', title: '同名', broadcastDate: '2024-01-02', category: 'monthly_song' },
    { id: 'c', songId: 'second', title: '同名', broadcastDate: '2024-01-03', category: 'regular_song' },
  ];
  assert.deepEqual(getFavoriteSongs(records, ['first', 'second']), [
    { songId: 'first', title: '同名' },
    { songId: 'second', title: '同名' },
  ]);
});
