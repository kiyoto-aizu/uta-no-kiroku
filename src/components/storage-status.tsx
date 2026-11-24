import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { SearchColors, Spacing } from '@/constants/theme';

type StorageStatusProps = {
  loading: boolean;
  loadingMessage: string;
  message: string | null;
  canRetry: boolean;
  retry: () => void;
};

export function StorageStatus({ loading, loadingMessage, message, canRetry, retry }: StorageStatusProps) {
  if (!loading && !message) return null;
  return (
    <ThemedView style={styles.notice}>
      <ThemedText type="small" style={styles.text} accessibilityRole={message ? 'alert' : 'text'}>
        {loading ? loadingMessage : message}
      </ThemedText>
      {canRetry ? (
        <Pressable accessibilityRole="button" onPress={retry} style={styles.retry}>
          <ThemedText type="smallBold" style={styles.link}>再試行</ThemedText>
        </Pressable>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  notice: { padding: Spacing.three, borderRadius: Spacing.three, backgroundColor: SearchColors.notice },
  text: { color: SearchColors.text },
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center' },
  link: { color: SearchColors.clearText },
});
