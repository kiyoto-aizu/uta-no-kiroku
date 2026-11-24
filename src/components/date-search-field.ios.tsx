import { DatePicker, Host } from '@expo/ui/swift-ui';
import { font } from '@expo/ui/swift-ui/modifiers';
import { Pressable, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppFontIOSMedium, SearchColors } from '@/constants/theme';

function formatLocalDate(date: Date): string {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function DateSearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  if (!value) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={() => onChange(formatLocalDate(new Date()))}
        style={styles.selectButton}>
        <ThemedText style={styles.text}>日付を選択</ThemedText>
      </Pressable>
    );
  }
  const [year, month, day] = value.split('-').map(Number);
  return (
    <Host colorScheme="light" matchContents={{ vertical: true }} style={styles.host}>
      <DatePicker
        modifiers={[font({ family: AppFontIOSMedium, size: 17 })]}
        title="放送日"
        selection={new Date(year, month - 1, day)}
        displayedComponents={['date']}
        onDateChange={(date) => onChange(formatLocalDate(date))}
      />
    </Host>
  );
}

const styles = StyleSheet.create({
  selectButton: {
    minHeight: 48, borderRadius: 8, paddingHorizontal: 16, justifyContent: 'center',
    backgroundColor: SearchColors.surface,
  },
  text: { color: SearchColors.text },
  host: { width: '100%', minHeight: 48 },
});
