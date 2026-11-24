import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { toggleFavorite } from '@/data/favorites';
import { createFavoritesStorage, InvalidFavoritesDataError } from '@/data/favorites-storage';

type FavoritesContextValue = {
  songIds: readonly string[];
  ready: boolean;
  loading: boolean;
  message: string | null;
  canRetry: boolean;
  retry: () => void;
  toggle: (songId: string) => void;
};

const FavoritesContext = createContext<FavoritesContextValue | null>(null);
const favoritesStorage = createFavoritesStorage(AsyncStorage);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [songIds, setSongIds] = useState<string[]>([]);
  const currentSongIds = useRef<string[]>([]);
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
    favoritesStorage.load().then((saved) => {
      if (!active) return;
      currentSongIds.current = saved;
      setSongIds(saved);
      setStatus('ready');
    }).catch((error: unknown) => {
      if (!active) return;
      console.error('Failed to load favorites:', error);
      if (error instanceof InvalidFavoritesDataError) {
        setMessage('お気に入りの保存データが壊れているため、空の一覧を表示しています。次の登録で保存データを上書きします。');
        setStatus('ready');
      } else {
        setMessage('お気に入りを読み込めませんでした。再読み込みしてください。');
        setStatus('read-error');
      }
    });
    return () => { active = false; };
  }, [loadAttempt]);

  function save(ids: string[]) {
    favoritesStorage.save(ids).then(() => {
      if (!mounted.current) return;
      setSaveFailed(false);
      setMessage(null);
    }).catch((error: unknown) => {
      console.error('Failed to save favorites:', error);
      if (!mounted.current) return;
      setSaveFailed(true);
      setMessage('お気に入りを保存できませんでした。再試行してください。');
    });
  }

  function toggle(songId: string) {
    if (status !== 'ready') return;
    const updated = toggleFavorite(currentSongIds.current, songId);
    currentSongIds.current = updated;
    setSongIds(updated);
    save(updated);
  }

  function retry() {
    if (status === 'read-error') {
      setLoadAttempt((attempt) => attempt + 1);
    } else if (saveFailed) {
      save(currentSongIds.current);
    }
  }

  return (
    <FavoritesContext.Provider value={{
      songIds, toggle, ready: status === 'ready', loading: status === 'loading',
      message, canRetry: status === 'read-error' || saveFailed, retry,
    }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites(): FavoritesContextValue {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('FavoritesProvider is missing');
  return context;
}
