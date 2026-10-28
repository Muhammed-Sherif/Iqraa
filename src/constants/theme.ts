/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/app.css';

import { Platform } from 'react-native';

import { colorScheme, vars } from 'nativewind';
export const palette = {
  brand: {
    light: {
      header: '#122E2A',
      'header-foreground': '#F5ECE1',
      background: '#F5ECE1',
      surface: '#FCF9F4',
      border: '#E6DDD1',
      foreground: '#122E2A',
      muted: '#8B8A83',
      primary: '#47C9A2',
      'primary-soft': '#C9EADC',
      'primary-tint': '#E8F4EC',
      'primary-foreground': '#ffffff',
      strong: '#3B8173',
      danger: '#E5604F',
    },
    dark: {
      header: '#171F1D',
      'header-foreground': '#F5ECE1',

      background: '#1D2623',
      surface: '#29332F',
      border: '#3A4640',

      foreground: '#F5ECE1',
      muted: '#A2ADA6',

      primary: '#65D9B5',
      'primary-soft': '#294A3F',
      'primary-tint': '#233B32',
      'primary-foreground': '#122E2A',

      strong: '#8BE4C8',
      danger: '#F08072',
    },
  },
} as const;

const hexToChannels = (hex: string) => {
  // i have pasted this regular expression from ai but i dont understand it
  if (!/^#[0-9a-f]{6}$/i.test(hex)) {
    throw new Error(`Expected #RRGGBB, got "${hex}"`);
  }
  const n = parseInt(hex.slice(1), 16);
  return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`;
};
export type ThemeColor = keyof typeof palette.brand.light &
  keyof typeof palette.brand.dark;

type Vars = ReturnType<typeof vars>;
export const getStaticColor = (color: ThemeColor) => {
  return palette.brand[colorScheme.get() ?? 'light'][color];
};
// 3. { primary: "#47C9A2" } -> vars({ "--primary": "71 201 162" })
const toVars = (colors: Record<string, string>) =>
  vars(
    Object.fromEntries(
      Object.entries(colors).map(([name, hex]) => [
        `--${name}`,
        hexToChannels(hex),
      ]),
    ),
  );
export const themes = Object.entries(palette).reduce(
  (accum, [brand, brandColors]) => {
    const ResolvedBrandColors = Object.entries(brandColors).reduce(
      (brandColorsAccumulator, [mode, colors]) => {
        brandColorsAccumulator[mode] = toVars(colors);
        return brandColorsAccumulator;
      },
      {} as Record<string, Vars>,
    );

    accum[brand] = ResolvedBrandColors;
    return accum;
  },
  {} as Record<string, Record<string, Vars>>,
);

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 100, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
