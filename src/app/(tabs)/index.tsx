import { useIsFocused } from 'expo-router';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateSearchField } from '@/components/date-search-field';
import { FavoriteButton } from '@/components/favorite-button';
import { FavoritesStatus } from '@/components/favorites-status';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { AppFont, MaxContentWidth, SearchColors, Spacing } from '@/constants/theme';
import { fictionalBroadcasts } from '@/data/fictional-broadcasts';
import { isValidBroadcastDate, searchBroadcasts } from '@/utils/search-broadcasts';

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [criteria, setCriteria] = useState({ title: '', date: '' });
  const [error, setError] = useState('');
  const results = searchBroadcasts(fictionalBroadcasts, criteria);

  function handleSearch() {
    if (date && !isValidBroadcastDate(date)) {
      setError('日付は YYYY-MM-DD 形式の存在する日付を入力してください。');
      return;
    }
    setError('');
    setCriteria({ title, date });
    Keyboard.dismiss();
  }

  function handleClear() {
    setTitle('');
    setDate('');
    setCriteria({ title: '', date: '' });
    setError('');
    Keyboard.dismiss();
  }

  return (
    <ThemedView
      style={[styles.container, Platform.OS === 'web' && !isFocused && styles.hidden]}
      accessibilityElementsHidden={!isFocused}
      importantForAccessibility={isFocused ? 'auto' : 'no-hide-descendants'}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.heading}>
            <ThemedText type="title" style={styles.title} accessibilityRole="header">
              うたのきろく
            </ThemedText>
            <ThemedText style={styles.text}>
              曲名や放送日から、歌をさがそう。
            </ThemedText>
          </View>

          <ThemedView type="backgroundElement" style={styles.notice}>
            <ThemedText type="smallBold" style={styles.text}>これは架空のテストデータです</ThemedText>
            <ThemedText type="small" style={styles.text}>
              曲名・放送日は実際の放送履歴ではありません。
            </ThemedText>
          </ThemedView>

          <FavoritesStatus />

          <ThemedView type="backgroundElement" style={styles.searchCard}>
            <ThemedText type="smallBold" style={styles.text}>曲名</ThemedText>
            <TextInput
              accessibilityLabel="曲名"
              value={title}
              onChangeText={setTitle}
              onSubmitEditing={handleSearch}
              placeholder="曲名の一部を入力"
              placeholderTextColor={SearchColors.text}
              returnKeyType="search"
              style={styles.input}
            />
            <ThemedText type="smallBold" style={styles.text}>放送日</ThemedText>
            <DateSearchField value={date} onChange={setDate} />
            <ThemedText type="small" style={styles.text}>
              両方指定すると、両方に一致する放送を表示します。
            </ThemedText>
            {error ? (
              <ThemedText type="small" style={styles.text} accessibilityRole="alert">
                {error}
              </ThemedText>
            ) : null}
            <View style={styles.actions}>
              <Pressable
                accessibilityRole="button"
                onPress={handleSearch}
                style={({ pressed }) => [styles.searchButton, pressed && styles.pressed]}>
                <ThemedText type="smallBold" style={styles.searchButtonText}>検索</ThemedText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleClear}
                style={({ pressed }) => [
                  styles.clearButton,
                  pressed && styles.pressed,
                ]}>
                <ThemedText type="smallBold" style={styles.clearButtonText}>クリア</ThemedText>
              </Pressable>
            </View>
          </ThemedView>

          <View style={styles.resultsHeading}>
            <ThemedText type="smallBold" style={styles.text} accessibilityRole="header">検索結果</ThemedText>
            <ThemedText type="small" style={styles.text}>{results.length}件</ThemedText>
          </View>
          {results.length === 0 ? (
            <ThemedView type="backgroundElement" style={styles.empty}>
              <ThemedText style={styles.text}>該当する歌は見つかりませんでした。</ThemedText>
              <ThemedText type="small" style={styles.text}>
                曲名や日付を変えて検索してください。
              </ThemedText>
            </ThemedView>
          ) : (
            results.map((record) => (
              <ThemedView key={record.id} type="backgroundElement" style={styles.result}>
                <View style={styles.resultText}>
                  <ThemedText type="smallBold" style={styles.text}>{record.title}</ThemedText>
                  <ThemedText type="small" style={styles.text}>
                    放送日 {record.broadcastDate}
                  </ThemedText>
                </View>
                <ThemedView style={[
                  styles.badge,
                  { backgroundColor: record.category === 'monthly_song' ? SearchColors.monthly : SearchColors.regular },
                ]}>
                  <ThemedText type="small" style={styles.text}>{record.category === 'monthly_song' ? '月の歌' : '通常の歌'}</ThemedText>
                </ThemedView>
                <FavoriteButton songId={record.songId} title={record.title} />
              </ThemedView>
            ))
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', backgroundColor: SearchColors.background },
  hidden: { display: 'none' },
  safeArea: { flex: 1, width: '100%', maxWidth: MaxContentWidth },
  content: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.six,
    gap: Spacing.three,
  },
  heading: { gap: Spacing.one },
  text: { color: SearchColors.text },
  title: { fontSize: 36, lineHeight: 46, color: SearchColors.text },
  notice: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.one, backgroundColor: SearchColors.notice },
  searchCard: { padding: Spacing.three, borderRadius: Spacing.three, gap: Spacing.two, backgroundColor: SearchColors.panel },
  input: {
    minHeight: 48, borderRadius: Spacing.two, paddingHorizontal: Spacing.three, fontSize: 16, fontFamily: AppFont,
    backgroundColor: SearchColors.surface, color: SearchColors.text,
  },
  actions: { flexDirection: 'row', gap: Spacing.two, marginTop: Spacing.one },
  searchButton: {
    flex: 1, minHeight: 48, backgroundColor: SearchColors.primary, borderRadius: Spacing.two,
    alignItems: 'center', justifyContent: 'center',
  },
  searchButtonText: { color: SearchColors.buttonText },
  clearButton: {
    minHeight: 48, paddingHorizontal: Spacing.four, borderRadius: Spacing.two, backgroundColor: SearchColors.clearBackground,
    borderWidth: 1, borderColor: SearchColors.clearBorder,
    alignItems: 'center', justifyContent: 'center',
  },
  clearButtonText: { color: SearchColors.clearText },
  pressed: { opacity: 0.7 },
  resultsHeading: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  empty: { padding: Spacing.four, borderRadius: Spacing.three, gap: Spacing.one, backgroundColor: SearchColors.surface },
  result: {
    padding: Spacing.three, borderRadius: Spacing.three, flexDirection: 'row',
    alignItems: 'center', gap: Spacing.two, backgroundColor: SearchColors.surface,
  },
  resultText: { flex: 1, gap: Spacing.one },
  badge: { borderRadius: Spacing.two, paddingHorizontal: Spacing.two, paddingVertical: Spacing.one },
});
