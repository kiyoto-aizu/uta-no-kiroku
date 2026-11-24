import { createQueuedWriter, type KeyValueStorage } from './favorites-storage.ts';
import type { Memory } from './memories.ts';

const MEMORIES_KEY = '@uta-no-kiroku/memories/v1';

export class InvalidMemoriesDataError extends Error {
  constructor() {
    super('Invalid saved memories data');
    this.name = 'InvalidMemoriesDataError';
  }
}

function isMemory(value: unknown): value is Memory {
  if (!value || typeof value !== 'object') return false;
  const entry = value as Record<string, unknown>;
  return typeof entry.id === 'string' && entry.id.length > 0
    && typeof entry.songId === 'string' && entry.songId.length > 0
    && typeof entry.content === 'string' && entry.content.trim().length > 0
    && typeof entry.createdAt === 'string' && !Number.isNaN(Date.parse(entry.createdAt))
    && typeof entry.updatedAt === 'string' && !Number.isNaN(Date.parse(entry.updatedAt));
}

export function createMemoriesStorage(storage: KeyValueStorage) {
  const write = createQueuedWriter(storage, MEMORIES_KEY);
  return {
    async load(): Promise<Memory[]> {
      const saved = await storage.getItem(MEMORIES_KEY);
      if (saved === null) return [];
      let parsed: unknown;
      try {
        parsed = JSON.parse(saved);
      } catch (error) {
        if (error instanceof SyntaxError) throw new InvalidMemoriesDataError();
        throw error;
      }
      if (!Array.isArray(parsed) || !parsed.every(isMemory)
        || new Set(parsed.map((memory) => memory.id)).size !== parsed.length) {
        throw new InvalidMemoriesDataError();
      }
      return parsed;
    },
    save(memories: readonly Memory[]): Promise<void> {
      return write(JSON.stringify(memories));
    },
  };
}
