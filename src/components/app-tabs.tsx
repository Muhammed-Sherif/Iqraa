import { NativeTabs } from 'expo-router/native-tabs';
import { useColorScheme } from 'nativewind';

import { palette } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme().colorScheme ?? 'light';
  const colors = palette.brand[scheme];

  return (
    <NativeTabs
      backgroundColor={colors.surface}
      indicatorColor={colors.primary}
      labelStyle={{ selected: { color: colors.foreground } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="house.fill"
          md="home"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="memorize">
        <NativeTabs.Trigger.Label>memorize</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="book.fill"
          md="menu_book"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="revision">
        <NativeTabs.Trigger.Label>revision</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="arrow.clockwise"
          md="refresh"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <NativeTabs.Trigger.Label>settings</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf="gearshape.fill"
          md="settings"
          selectedColor={colors.primary}
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
