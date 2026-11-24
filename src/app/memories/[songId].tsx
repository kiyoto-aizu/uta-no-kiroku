import { Link, useLocalSearchParams, usePreventRemove } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoritesStatus } from '@/components/favorites-status';
import { MemoriesStatus } from '@/components/memories-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppFont, MaxContentWidth, SearchColors, Spacing } from '@/constants/theme';
import { fictionalBroadcasts } from '@/data/fictional-broadcasts';
import { useFavorites } from '@/hooks/favorites-context';
import { useMemories } from '@/hooks/memories-context';
import { hasUnsavedMemory } from '@/utils/memory-draft';
import { getSongBroadcasts } from '@/utils/search-broadcasts';

export default function MemoriesScreen() {
  const { songId } = useLocalSearchParams<{ songId: string }>();
  const broadcasts = getSongBroadcasts(fictionalBroadcasts, songId);
  const song = broadcasts[0];
  const favorites = useFavorites();
  const { memories, ready, add, edit, remove } = useMemories();
  const [content, setContent] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [originalEditContent, setOriginalEditContent] = useState('');
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [error, setError] = useState('');
  const pendingRemoval = useRef<(() => void) | null>(null);
  const songMemories = memories.filter((memory) => memory.songId === songId);
  const hasUnsavedEdit = editingId !== null && editContent !== originalEditContent;
  const hasUnsavedChanges = hasUnsavedMemory(
    content,
    editingId === null ? null : { content: editContent, original: originalEditContent },
  );

  usePreventRemove(hasUnsavedChanges, ({ repeat }) => {
    pendingRemoval.current = repeat;
    Keyboard.dismiss();
    setConfirmLeave(true);
  });

  function continueEditing() {
    pendingRemoval.current = null;
    setConfirmLeave(false);
  }

  function discardAndLeave() {
    const repeat = pendingRemoval.current;
    pendingRemoval.current = null;
    setContent('');
    setEditingId(null);
    setEditContent('');
    setConfirmLeave(false);
    if (repeat) repeat();
  }

  function perform(action: () => void) {
    try {
      action();
      setError('');
    } catch (caught: unknown) {
      console.error('Failed to update memory:', caught);
      setError(caught instanceof Error ? caught.message : '思い出メモを更新できませんでした。');
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
            <Link href="/favorites" dismissTo asChild>
              <Pressable accessibilityRole="link" style={styles.back}>
                <ThemedText type="smallBold" style={styles.linkText}>‹ お気に入りに戻る</ThemedText>
              </Pressable>
            </Link>
            <ThemedText type="title" style={styles.title} accessibilityRole="header">思い出メモ</ThemedText>
            {song ? <ThemedText type="smallBold" style={styles.text}>{song.title}</ThemedText> : null}
            <ThemedView style={styles.card}>
              <ThemedText type="smallBold" style={styles.text} accessibilityRole="header">放送履歴（架空データ）</ThemedText>
              {broadcasts.length === 0 ? (
                <ThemedText type="small" style={styles.text}>放送情報はありません。</ThemedText>
              ) : broadcasts.map((record) => (
                <View key={record.id} style={styles.broadcast}>
                  <ThemedText type="small" style={styles.text}>放送日 {record.broadcastDate}</ThemedText>
                  <ThemedView style={[
                    styles.badge,
                    { backgroundColor: record.category === 'monthly_song' ? SearchColors.monthly : SearchColors.regular },
                  ]}>
                    <ThemedText type="small" style={styles.text}>
                      {record.category === 'monthly_song' ? '月の歌' : '通常の歌'}
                    </ThemedText>
                  </ThemedView>
                </View>
              ))}
            </ThemedView>
            <ThemedView style={styles.notice}>
              <ThemedText type="small" style={styles.text}>
                メモはこの端末に保存され、家族とは共有されません。お気に入りを解除しても残り、再登録すると表示されます。保存内容は暗号化されません。
              </ThemedText>
            </ThemedView>
            <FavoritesStatus />
            <MemoriesStatus />
            {!song ? (
              <ThemedText style={styles.text}>曲が見つかりませんでした。</ThemedText>
            ) : !favorites.ready ? null : !favorites.songIds.includes(songId) ? (
              <ThemedText style={styles.text}>この曲をお気に入りに再登録すると、メモを表示できます。</ThemedText>
            ) : !ready ? null : (
              <>
                <ThemedView style={styles.card}>
                  <ThemedText type="smallBold" style={styles.text}>新しい思い出</ThemedText>
                  <TextInput
                    accessibilityLabel="新しい思い出メモ"
                    multiline
                    value={content}
                    onChangeText={setContent}
                    placeholder="思い出やエピソードを入力"
                    placeholderTextColor={SearchColors.text}
                    style={styles.input}
                  />
                  <Pressable accessibilityRole="button" onPress={() => perform(() => {
                    add(songId, content);
                    setContent('');
                  })} style={styles.primaryButton}>
                    <ThemedText type="smallBold" style={styles.primaryText}>メモを登録</ThemedText>
                  </Pressable>
                </ThemedView>
                {error ? <ThemedText accessibilityRole="alert" style={styles.text}>{error}</ThemedText> : null}
                <ThemedText type="smallBold" style={styles.text} accessibilityRole="header">思い出の一覧</ThemedText>
                {songMemories.length === 0 ? (
                  <ThemedView style={styles.card}>
                    <ThemedText style={styles.text}>思い出メモはまだありません。</ThemedText>
                  </ThemedView>
                ) : songMemories.map((memory, index) => (
                  <ThemedView key={memory.id} style={styles.card}>
                    {editingId === memory.id ? (
                      <>
                        <TextInput
                          accessibilityLabel={`思い出メモ${index + 1}を編集`}
                          multiline
                          value={editContent}
                          onChangeText={setEditContent}
                          style={styles.input}
                        />
                        {hasUnsavedEdit ? (
                          <ThemedText type="small" style={styles.text}>
                            別のメモを編集するには、変更を保存またはキャンセルしてください。
                          </ThemedText>
                        ) : null}
                        <View style={styles.actions}>
                          <Pressable accessibilityRole="button" onPress={() => perform(() => {
                            edit(songId, memory.id, editContent);
                            setEditingId(null);
                          })} style={styles.primaryButton}>
                            <ThemedText type="smallBold" style={styles.primaryText}>変更を保存</ThemedText>
                          </Pressable>
                          <Pressable accessibilityRole="button" onPress={() => { setEditingId(null); setError(''); }} style={styles.secondaryButton}>
                            <ThemedText type="smallBold" style={styles.linkText}>キャンセル</ThemedText>
                          </Pressable>
                        </View>
                      </>
                    ) : (
                      <>
                        <ThemedText style={styles.text}>{memory.content}</ThemedText>
                        <ThemedText type="small" style={styles.text}>
                          作成 {new Date(memory.createdAt).toLocaleString('ja-JP')}
                        </ThemedText>
                        {confirmId === memory.id ? (
                          <>
                            <ThemedText style={styles.text}>このメモを削除しますか？</ThemedText>
                            <View style={styles.actions}>
                              <Pressable accessibilityRole="button" onPress={() => perform(() => {
                                remove(songId, memory.id);
                                setConfirmId(null);
                              })} style={styles.secondaryButton}>
                                <ThemedText type="smallBold" style={styles.linkText}>削除する</ThemedText>
                              </Pressable>
                              <Pressable accessibilityRole="button" onPress={() => setConfirmId(null)} style={styles.secondaryButton}>
                                <ThemedText type="smallBold" style={styles.linkText}>削除をやめる</ThemedText>
                              </Pressable>
                            </View>
                          </>
                        ) : (
                          <View style={styles.actions}>
                            <Pressable accessibilityRole="button" accessibilityLabel={`思い出メモ${index + 1}を編集`}
                              accessibilityState={{ disabled: hasUnsavedEdit }}
                              disabled={hasUnsavedEdit}
                              onPress={() => {
                                setEditingId(memory.id);
                                setEditContent(memory.content);
                                setOriginalEditContent(memory.content);
                                setError('');
                              }}
                              style={[styles.secondaryButton, hasUnsavedEdit && styles.disabled]}>
                              <ThemedText type="smallBold" style={styles.linkText}>編集</ThemedText>
                            </Pressable>
                            <Pressable accessibilityRole="button" accessibilityLabel={`思い出メモ${index + 1}を削除`}
                              onPress={() => setConfirmId(memory.id)} style={styles.secondaryButton}>
                              <ThemedText type="smallBold" style={styles.linkText}>削除</ThemedText>
                            </Pressable>
                          </View>
                        )}
                      </>
                    )}
                  </ThemedView>
                ))}
              </>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
      <Modal visible={confirmLeave} transparent animationType="fade" onRequestClose={continueEditing}>
        <View style={styles.modalBackdrop}>
          <ThemedView style={styles.confirmCard} accessibilityViewIsModal>
            <ThemedText type="smallBold" style={styles.text} accessibilityRole="alert">
              未保存のメモがあります。
            </ThemedText>
            <ThemedText style={styles.text}>入力を破棄して戻りますか？</ThemedText>
            <View style={styles.actions}>
              <Pressable accessibilityRole="button" onPress={continueEditing} style={styles.primaryButton}>
                <ThemedText type="smallBold" style={styles.primaryText}>入力を続ける</ThemedText>
              </Pressable>
              <Pressable accessibilityRole="button" onPress={discardAndLeave} style={styles.secondaryButton}>
                <ThemedText type="smallBold" style={styles.linkText}>破棄して戻る</ThemedText>
              </Pressable>
            </View>
          </ThemedView>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: SearchColors.background },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  keyboard: { flex: 1 },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  back: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  title: { fontSize: 36, lineHeight: 46, color: SearchColors.text },
  text: { color: SearchColors.text },
  linkText: { color: SearchColors.clearText },
  notice: { padding: Spacing.three, borderRadius: Spacing.three, backgroundColor: SearchColors.notice },
  card: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two, backgroundColor: SearchColors.surface },
  broadcast: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.two },
  badge: { borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
  input: {
    minHeight: 120, padding: Spacing.two, borderRadius: Spacing.two, fontSize: 16, fontFamily: AppFont,
    textAlignVertical: 'top', backgroundColor: SearchColors.panel, color: SearchColors.text,
  },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  primaryButton: {
    minHeight: 48, paddingHorizontal: Spacing.three, borderRadius: Spacing.two,
    backgroundColor: SearchColors.primary, alignItems: 'center', justifyContent: 'center',
  },
  primaryText: { color: SearchColors.buttonText },
  secondaryButton: {
    minHeight: 44, paddingHorizontal: Spacing.three, borderRadius: Spacing.two,
    borderWidth: 1, borderColor: SearchColors.clearBorder, backgroundColor: SearchColors.clearBackground,
    alignItems: 'center', justifyContent: 'center',
  },
  disabled: { opacity: 0.5 },
  modalBackdrop: { flex: 1, justifyContent: 'center', padding: Spacing.four, backgroundColor: 'rgba(0, 0, 0, 0.45)' },
  confirmCard: {
    width: '100%', maxWidth: MaxContentWidth, alignSelf: 'center', padding: Spacing.four,
    borderRadius: Spacing.three, gap: Spacing.three, backgroundColor: SearchColors.surface,
  },
});
