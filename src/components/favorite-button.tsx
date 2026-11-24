import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { SearchColors } from '@/constants/theme';
import { useFavorites } from '@/hooks/favorites-context';

export function FavoriteButton({ songId, title }: { songId: string; title: string }) {
  const { songIds, toggle, ready } = useFavorites();
  const selected = songIds.includes(songId);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${title}をお気に入り${selected ? 'から解除' : 'に登録'}`}
      accessibilityState={{ selected, disabled: !ready }}
      disabled={!ready}
      onPress={() => toggle(songId)}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <ThemedText style={styles.heart}>{selected ? '♥' : '♡'}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  heart: { color: SearchColors.clearText, fontSize: 28, lineHeight: 36 },
  pressed: { opacity: 0.7 },
});
