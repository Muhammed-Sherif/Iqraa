# Iqraa SVG Icon Pack

Minimal 24×24 SVG icons for the Iqraa Quran memorization and revision app.
All icons use `currentColor`, so you can set their color in CSS/web contexts or convert them to React Native SVG components.

## Included
- mosque, streak, calendar, book-open, quran, target
- check-circle, alert-circle, headphones, play, mic, clock, history, chart
- trophy, bookmark, flag, settings, user, home, plus
- chevron-right, arrow-left, bell, wifi-offline, sun, moon, layers, book-heart
- flame, star, medal, repeat, eye, eye-off, check, x, more

## React Native / Expo
Install if needed:
```bash
pnpm add react-native-svg
pnpm add -D react-native-svg-transformer
```
Configure the SVG transformer according to your Expo version, then:
```tsx
import StreakIcon from '@/assets/icons/streak.svg';

<StreakIcon width={24} height={24} color="#47C9A2" />
```

For `react-native-svg-transformer`, ensure Metro treats `.svg` as a source extension and removes it from asset extensions as described in the package's setup guide.

## Brand palette
- Mint primary: #47C9A2
- Primary soft: #C9EADC
- Primary tint: #E8F4EC
- Dark forest: #122E2A
- Cream: #F5ECE1
