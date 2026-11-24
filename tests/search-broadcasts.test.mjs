import assert from 'node:assert/strict';
import test from 'node:test';

import { fictionalBroadcasts } from '../src/data/fictional-broadcasts.ts';
import { getSongBroadcasts, isValidBroadcastDate, searchBroadcasts } from '../src/utils/search-broadcasts.ts';

test('song broadcast history includes every matching date and category', () => {
  const records = [
    { id: 'a', songId: 's1', title: '曲', broadcastDate: '2024-01-01', category: 'monthly_song' },
    { id: 'b', songId: 's2', title: '別の曲', broadcastDate: '2024-01-01', category: 'regular_song' },
    { id: 'c', songId: 's1', title: '曲', broadcastDate: '2024-01-02', category: 'regular_song' },
  ];
  assert.deepEqual(getSongBroadcasts(records, 's1'), [records[0], records[2]]);
  assert.deepEqual(getSongBroadcasts(records, 'missing'), []);
});

test('partial title keeps separate broadcast dates and normalizes width', () => {
  const results = searchBroadcasts(fictionalBroadcasts, { title: ' ﾃｽﾄの月 ', date: '' });
  assert.deepEqual(results.map((record) => record.broadcastDate), ['2024-04-01', '2024-04-02']);
  assert.ok(results.every((record) => record.category === 'monthly_song'));
});

test('date and combined criteria preserve multiple songs and categories', () => {
  const results = searchBroadcasts(fictionalBroadcasts, { title: '', date: '2024-04-01' });
  assert.equal(results.length, 3);
  assert.deepEqual(results.map((record) => record.category), ['monthly_song', 'regular_song', 'regular_song']);
  assert.equal(searchBroadcasts(fictionalBroadcasts, { title: '虹', date: '2024-04-01' }).length, 1);
  assert.equal(searchBroadcasts(fictionalBroadcasts, { title: '虹', date: '2024-04-02' }).length, 0);
});

test('empty criteria restores all records and nonexistent query finds nothing', () => {
  assert.equal(searchBroadcasts(fictionalBroadcasts, { title: '', date: '' }).length, fictionalBroadcasts.length);
  assert.equal(searchBroadcasts(fictionalBroadcasts, { title: '存在しない曲', date: '' }).length, 0);
});

test('date validation rejects invalid formats and calendar dates', () => {
  assert.equal(isValidBroadcastDate('2024-02-29'), true);
  for (const date of ['2023-02-29', '2024-04-31', '2024-4-01', '0000-01-01', '']) {
    assert.equal(isValidBroadcastDate(date), false, date);
  }
});
