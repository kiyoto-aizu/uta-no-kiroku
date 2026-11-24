import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppFont, SearchColors, Spacing } from '@/constants/theme';

export default function TabLayout() {
  const { bottom } = useSafeAreaInsets();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: SearchColors.clearText,
      tabBarInactiveTintColor: SearchColors.text,
      tabBarActiveBackgroundColor: SearchColors.clearBackground,
      tabBarLabelPosition: 'below-icon',
      tabBarHideOnKeyboard: true,
      tabBarStyle: { height: 60 + bottom, backgroundColor: SearchColors.surface, borderTopColor: SearchColors.clearBorder },
      tabBarItemStyle: { borderRadius: Spacing.two, marginHorizontal: Spacing.two, marginVertical: Spacing.one },
      tabBarLabelStyle: { fontFamily: AppFont, fontSize: 12, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{
        title: '検索',
        tabBarIcon: ({ color }) => (
          <SymbolView name={{ ios: 'magnifyingglass', android: 'search', web: 'search' }} size={22} tintColor={color} />
        ),
      }} />
      <Tabs.Screen name="favorites" options={{
        title: 'お気に入り',
        tabBarIcon: ({ color }) => (
          <SymbolView name={{ ios: 'heart.fill', android: 'favorite', web: 'favorite' }} size={22} tintColor={color} />
        ),
      }} />
    </Tabs>
  );
}
