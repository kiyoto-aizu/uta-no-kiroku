import { Link, useIsFocused } from 'expo-router';
import { Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { FavoritesStatus } from '@/components/favorites-status';
import { MemoriesStatus } from '@/components/memories-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, SearchColors, Spacing } from '@/constants/theme';
import { getFavoriteSongs } from '@/data/favorites';
import { fictionalBroadcasts } from '@/data/fictional-broadcasts';
import { useFavorites } from '@/hooks/favorites-context';
import { useMemories } from '@/hooks/memories-context';

export default function FavoritesScreen() {
  const isFocused = useIsFocused();
  const { songIds, ready } = useFavorites();
  const { memories, ready: memoriesReady } = useMemories();
  const songs = getFavoriteSongs(fictionalBroadcasts, songIds);

  return (
    <ThemedView
      style={[styles.container, Platform.OS === 'web' && !isFocused && styles.hidden]}
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" style={styles.title} accessibilityRole="header">
            お気に入り
          </ThemedText>
          <ThemedView style={styles.notice}>
            <ThemedText type="small" style={styles.text}>
              架空のテストデータです。お気に入りはこの端末に保存され、家族とは共有されません。
            </ThemedText>
          </ThemedView>
          <FavoritesStatus />
          <MemoriesStatus />
          {!ready ? null : songs.length === 0 ? (
            <ThemedView style={styles.card}>
              <ThemedText style={styles.text}>お気に入りはまだありません。</ThemedText>
              <ThemedText type="small" style={styles.text}>
                検索結果のハートから登録できます。
              </ThemedText>
            </ThemedView>
          ) : songs.map((song) => {
            const count = memories.filter((memory) => memory.songId === song.songId).length;
            return (
              <ThemedView key={song.songId} style={styles.song}>
                <View style={styles.songTitle}>
                  <ThemedText type="smallBold" style={styles.text}>{song.title}</ThemedText>
                  <Link href={{ pathname: '/memories/[songId]', params: { songId: song.songId } }} asChild>
                    <Pressable accessibilityRole="link"
                      accessibilityLabel={`${song.title}の思い出メモ ${memoriesReady ? `${count}件` : '読み込み待ち'}`}
                      style={styles.memoryLink}>
                      <ThemedText type="smallBold" style={styles.linkText}>
                        思い出メモ {memoriesReady ? `${count}件` : '—'}
                      </ThemedText>
                    </Pressable>
                  </Link>
                </View>
                <FavoriteButton songId={song.songId} title={song.title} />
              </ThemedView>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: SearchColors.background },
  hidden: { display: 'none' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  content: { paddingHorizontal: Spacing.four, paddingTop: Spacing.four, paddingBottom: Spacing.six, gap: Spacing.three },
  linkText: { color: SearchColors.clearText },
  title: { fontSize: 36, lineHeight: 46, color: SearchColors.text },
  text: { color: SearchColors.text },
  notice: { padding: Spacing.three, borderRadius: Spacing.three, backgroundColor: SearchColors.notice },
  card: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.one, backgroundColor: SearchColors.surface },
  song: {
    padding: Spacing.three, borderRadius: Spacing.three, flexDirection: 'row',
    alignItems: 'center', gap: Spacing.two, backgroundColor: SearchColors.surface,
  },
  songTitle: { flex: 1 },
  memoryLink: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
});
