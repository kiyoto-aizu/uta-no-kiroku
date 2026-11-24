export type Memory = {
  id: string;
  songId: string;
  content: string;
  createdAt: string;
  updatedAt: string;
};

function requireContent(content: string) {
  if (!content.trim()) throw new Error('メモの本文を入力してください。');
}

export function addMemory(memories: readonly Memory[], songId: string, content: string, now: number): Memory[] {
  requireContent(content);
  if (!songId) throw new Error('曲が見つかりません。');
  const date = new Date(now).toISOString();
  let suffix = 0;
  let id = `memo-${now.toString(36)}-${suffix}`;
  const ids = new Set(memories.map((memory) => memory.id));
  while (ids.has(id)) {
    suffix += 1;
    id = `memo-${now.toString(36)}-${suffix}`;
  }
  return [...memories, { id, songId, content, createdAt: date, updatedAt: date }];
}

export function editMemory(
  memories: readonly Memory[], songId: string, id: string, content: string, now: number,
): Memory[] {
  requireContent(content);
  if (!memories.some((memory) => memory.id === id && memory.songId === songId)) {
    throw new Error('編集するメモが見つかりません。');
  }
  const updatedAt = new Date(now).toISOString();
  return memories.map((memory) => memory.id === id && memory.songId === songId
    ? { ...memory, content, updatedAt }
    : memory);
}

export function deleteMemory(memories: readonly Memory[], songId: string, id: string): Memory[] {
  if (!memories.some((memory) => memory.id === id && memory.songId === songId)) {
    throw new Error('削除するメモが見つかりません。');
  }
  return memories.filter((memory) => memory.id !== id || memory.songId !== songId);
}
