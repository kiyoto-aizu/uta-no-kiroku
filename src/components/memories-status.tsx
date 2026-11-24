import { StorageStatus } from '@/components/storage-status';
import { useMemories } from '@/hooks/memories-context';

export function MemoriesStatus() {
  const { loading, message, canRetry, retry } = useMemories();
  return (
    <StorageStatus loading={loading} loadingMessage="思い出メモを読み込み中です。"
      message={message} canRetry={canRetry} retry={retry} />
  );
}
