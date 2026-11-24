import assert from 'node:assert/strict';
import test from 'node:test';

import { addMemory, deleteMemory, editMemory } from '../src/data/memories.ts';
import { createMemoriesStorage, InvalidMemoriesDataError } from '../src/data/memories-storage.ts';
import { hasUnsavedMemory } from '../src/utils/memory-draft.ts';

test('only unsaved input or changed edits need leave confirmation', () => {
  assert.equal(hasUnsavedMemory('', null), false);
  assert.equal(hasUnsavedMemory(' \n ', null), false);
  assert.equal(hasUnsavedMemory('new', null), true);
  assert.equal(hasUnsavedMemory('', { original: 'saved', content: 'saved' }), false);
  assert.equal(hasUnsavedMemory('', { original: 'saved', content: '' }), true);
  assert.equal(hasUnsavedMemory('new', { original: 'saved', content: 'saved' }), true);
  assert.equal(hasUnsavedMemory('', { original: 'saved', content: 'changed' }), true);
});

test('create, edit and delete multiple memories independently by song', () => {
  const firstTime = Date.parse('2026-01-01T00:00:00.000Z');
  let items = addMemory([], 'song-1', '最初\nのメモ', firstTime);
  items = addMemory(items, 'song-1', '二つ目', firstTime);
  items = addMemory(items, 'song-2', '別の曲', firstTime);
  assert.equal(new Set(items.map((item) => item.id)).size, 3);
  const [first, second, other] = items;
  assert.equal(first.createdAt, first.updatedAt);
  items = editMemory(items, 'song-1', first.id, '変更後', firstTime + 1000);
  assert.equal(items[0].createdAt, first.createdAt);
  assert.equal(items[0].updatedAt, '2026-01-01T00:00:01.000Z');
  assert.equal(items[1].content, '二つ目');
  assert.throws(() => editMemory(items, 'song-2', first.id, '誤操作', firstTime), /見つかりません/);
  assert.throws(() => deleteMemory(items, 'song-2', first.id), /見つかりません/);
  items = deleteMemory(items, 'song-1', second.id);
  assert.deepEqual(items.map((item) => item.id), [first.id, other.id]);
  assert.throws(() => addMemory(items, 'song-1', '  \n', firstTime), /入力/);
});

test('memories survive reloading and corrupted data is not overwritten', async () => {
  let value = null;
  const backend = {
    async getItem() { return value; },
    async setItem(_key, next) { value = next; },
  };
  const storage = createMemoriesStorage(backend);
  assert.deepEqual(await storage.load(), []);
  const items = addMemory([], 'song-1', '思い出', Date.parse('2026-01-01T00:00:00.000Z'));
  await storage.save(items);
  assert.deepEqual(await createMemoriesStorage(backend).load(), items);
  for (const invalid of ['{', '{}', '[{"id":"a"}]', JSON.stringify([items[0], items[0]])]) {
    value = invalid;
    await assert.rejects(storage.load(), InvalidMemoriesDataError);
    assert.equal(value, invalid);
  }
});

test('failed writes are reported and later writes remain ordered', async () => {
  let release;
  const wait = new Promise((resolve) => { release = resolve; });
  const writes = [];
  const backend = {
    async getItem() { throw new Error('read failure'); },
    async setItem(_key, value) {
      writes.push(value);
      if (writes.length === 1) {
        await wait;
        throw new Error('write failure');
      }
    },
  };
  const storage = createMemoriesStorage(backend);
  await assert.rejects(storage.load(), /read failure/);
  const first = storage.save([]);
  const second = storage.save([{
    id: 'm', songId: 's', content: 'c', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z',
  }]);
  await Promise.resolve();
  assert.equal(writes.length, 1);
  release();
  await assert.rejects(first, /write failure/);
  await second;
  assert.equal(writes.length, 2);
});
