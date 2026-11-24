import { StyleSheet, TextInput } from 'react-native';

import { AppFont, SearchColors } from '@/constants/theme';

export function DateSearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <TextInput
      accessibilityLabel="放送日"
      value={value}
      onChangeText={onChange}
      placeholder="YYYY-MM-DD"
      placeholderTextColor={SearchColors.text}
      autoCapitalize="none"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  input: {
    minHeight: 48, borderRadius: 8, paddingHorizontal: 16, fontSize: 16, fontFamily: AppFont,
    backgroundColor: SearchColors.surface, color: SearchColors.text,
  },
});
