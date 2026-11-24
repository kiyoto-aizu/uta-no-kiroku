import { StorageStatus } from '@/components/storage-status';
import { useFavorites } from '@/hooks/favorites-context';

export function FavoritesStatus() {
  const { loading, message, canRetry, retry } = useFavorites();
  return (
    <StorageStatus loading={loading} loadingMessage="お気に入りを読み込み中です。"
      message={message} canRetry={canRetry} retry={retry} />
  );
}
