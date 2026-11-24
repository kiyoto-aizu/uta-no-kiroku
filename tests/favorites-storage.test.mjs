import assert from 'node:assert/strict';
import test from 'node:test';

import { createFavoritesStorage, InvalidFavoritesDataError } from '../src/data/favorites-storage.ts';

function memoryStorage(initial = null) {
  let value = initial;
  return {
    async getItem() { return value; },
    async setItem(_key, next) { value = next; },
  };
}

test('missing data starts empty, and additions and removals survive a new storage instance', async () => {
  const backend = memoryStorage();
  const storage = createFavoritesStorage(backend);
  assert.deepEqual(await storage.load(), []);
  await storage.save(['song-1', 'song-2']);
  const restarted = createFavoritesStorage(backend);
  assert.deepEqual(await restarted.load(), ['song-1', 'song-2']);
  await restarted.save(['song-2']);
  assert.deepEqual(await createFavoritesStorage(backend).load(), ['song-2']);
});

test('malformed or invalid saved data is reported without being overwritten', async () => {
  for (const invalid of ['{', '{}', '["song-1",1]', '[""]']) {
    const backend = memoryStorage(invalid);
    await assert.rejects(createFavoritesStorage(backend).load(), InvalidFavoritesDataError);
    assert.equal(await backend.getItem(), invalid);
  }
  assert.deepEqual(await createFavoritesStorage(memoryStorage('["song-1","song-1"]')).load(), ['song-1']);
});

test('writes run in order and a failed write does not block the next one', async () => {
  let release;
  const firstWait = new Promise((resolve) => { release = resolve; });
  const writes = [];
  const backend = {
    async getItem() { throw new Error('read failed'); },
    async setItem(_key, value) {
      writes.push(value);
      if (writes.length === 1) {
        await firstWait;
        throw new Error('write failed');
      }
    },
  };
  const storage = createFavoritesStorage(backend);
  await assert.rejects(storage.load(), /read failed/);
  const first = storage.save(['song-1']);
  const second = storage.save(['song-2']);
  await Promise.resolve();
  assert.deepEqual(writes, ['["song-1"]']);
  release();
  await assert.rejects(first, /write failed/);
  await second;
  assert.deepEqual(writes, ['["song-1"]', '["song-2"]']);
});
