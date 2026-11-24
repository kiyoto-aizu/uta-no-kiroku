import { AppFont, SearchColors } from '@/constants/theme';

export function DateSearchField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  return (
    <input
      aria-label="放送日"
      type="date"
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      style={{
        minHeight: 48, width: '100%', boxSizing: 'border-box', border: 0,
        borderRadius: 8, padding: '0 16px', fontSize: 16, fontFamily: AppFont,
        backgroundColor: SearchColors.surface, color: SearchColors.text, colorScheme: 'light',
      }}
    />
  );
}
