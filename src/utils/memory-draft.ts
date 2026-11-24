export function hasUnsavedMemory(
  newContent: string,
  editing: { content: string; original: string } | null,
): boolean {
  return newContent.trim().length > 0 || (editing !== null && editing.content !== editing.original);
}
