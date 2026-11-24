export type KeyValueStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
};

export function createQueuedWriter(storage: KeyValueStorage, key: string) {
  let pendingWrite = Promise.resolve();
  return (value: string): Promise<void> => {
    const write = pendingWrite.then(() => storage.setItem(key, value));
    // Keep subsequent writes available while reporting each failure to its caller.
    pendingWrite = write.then(() => undefined, () => undefined);
    return write;
  };
}

const FAVORITES_KEY = '@uta-no-kiroku/favorites/v1';

export class InvalidFavoritesDataError extends Error {
  constructor() {
    super('Invalid saved favorites data');
    this.name = 'InvalidFavoritesDataError';
  }
}

export function createFavoritesStorage(storage: KeyValueStorage) {
  const write = createQueuedWriter(storage, FAVORITES_KEY);

  return {
    async load(): Promise<string[]> {
      const saved = await storage.getItem(FAVORITES_KEY);
      if (saved === null) return [];

      let parsed: unknown;
      try {
        parsed = JSON.parse(saved);
      } catch (error) {
        if (error instanceof SyntaxError) throw new InvalidFavoritesDataError();
        throw error;
      }
      if (!Array.isArray(parsed) || !parsed.every((id) => typeof id === 'string' && id.length > 0)) {
        throw new InvalidFavoritesDataError();
      }
      return [...new Set<string>(parsed)];
    },
    save(songIds: readonly string[]): Promise<void> {
      return write(JSON.stringify(songIds));
    },
  };
}
