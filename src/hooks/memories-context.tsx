import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { addMemory, deleteMemory, editMemory, type Memory } from '@/data/memories';
import { createMemoriesStorage, InvalidMemoriesDataError } from '@/data/memories-storage';

type MemoriesContextValue = {
  memories: readonly Memory[];
  ready: boolean;
  loading: boolean;
  message: string | null;
  canRetry: boolean;
  retry: () => void;
  add: (songId: string, content: string) => void;
  edit: (songId: string, id: string, content: string) => void;
  remove: (songId: string, id: string) => void;
};

const MemoriesContext = createContext<MemoriesContextValue | null>(null);
const memoryStorage = createMemoriesStorage(AsyncStorage);

export function MemoriesProvider({ children }: { children: ReactNode }) {
  const [memories, setMemories] = useState<Memory[]>([]);
  const current = useRef<Memory[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'read-error'>('loading');
  const [message, setMessage] = useState<string | null>(null);
  const [saveFailed, setSaveFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const mounted = useRef(false);

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setStatus('loading');
    setMessage(null);
    memoryStorage.load().then((saved) => {
      if (!active) return;
      current.current = saved;
      setMemories(saved);
      setStatus('ready');
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Failed to load memories:', error);
      setMessage(error instanceof InvalidMemoriesDataError
        ? '思い出メモの保存データが壊れているため読み込めません。データは上書きしません。'
        : '思い出メモを読み込めませんでした。再試行してください。');
      setStatus('read-error');
    });
    return () => { active = false; };
  }, [loadAttempt]);

  function save(updated: Memory[]) {
    memoryStorage.save(updated).then(() => {
      if (!mounted.current) return;
      setSaveFailed(false);
      setMessage(null);
    }).catch((error: unknown) => {
      console.error('Failed to save memories:', error);
      if (!mounted.current) return;
      setSaveFailed(true);
      setMessage('思い出メモを保存できませんでした。アプリを閉じる前に再試行してください。');
    });
  }

  function update(transform: (memories: readonly Memory[]) => Memory[]) {
    if (status !== 'ready') throw new Error('思い出メモを読み込めていません。');
    const updated = transform(current.current);
    current.current = updated;
    setMemories(updated);
    save(updated);
  }

  function retry() {
    if (status === 'read-error') {
      setLoadAttempt((attempt) => attempt + 1);
    } else if (saveFailed) {
      save(current.current);
    }
  }

  return (
    <MemoriesContext.Provider value={{
      memories, ready: status === 'ready', loading: status === 'loading',
      message, canRetry: status === 'read-error' || saveFailed, retry,
      add: (songId, content) => update((items) => addMemory(items, songId, content, Date.now())),
      edit: (songId, id, content) => update((items) => editMemory(items, songId, id, content, Date.now())),
      remove: (songId, id) => update((items) => deleteMemory(items, songId, id)),
    }}>
      {children}
    </MemoriesContext.Provider>
  );
}

export function useMemories(): MemoriesContextValue {
  const context = useContext(MemoriesContext);
  if (!context) throw new Error('MemoriesProvider is missing');
  return context;
}
