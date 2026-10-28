# Iqraa Tab Icons

10 matching 24×24 SVG icons for a bottom tab bar:
- Home
- Revision
- Memorize
- Achievements
- Profile
- Library
- History
- Settings
- Statistics
- More

Icons use `currentColor` and are designed for 24px display.

## Expo use
With `react-native-svg-transformer` configured:
```tsx
import HomeTabIcon from '@/assets/icons/tab-home.svg';

<HomeTabIcon width={24} height={24} color={focused ? '#47C9A2' : '#8B8A83'} />
```

Suggested Iqraa colors:
- Active tab: `#47C9A2`
- Inactive tab: `#8B8A83`
- Dark forest: `#122E2A`
