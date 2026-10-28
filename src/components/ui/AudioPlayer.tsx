import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';

/* ─── AudioPlayer ─────────────────────────────────────────────
   Static audio player card with progress bar and transport controls.
   Designed for the memorize session screen.
──────────────────────────────────────────────────────────────── */
export function AudioPlayer() {
  const primaryColor = getStaticColor('primary');

  return (
    <View className="flex-1 items-center justify-center gap-6 px-6">
      {/* tip */}
      <View className="items-center gap-2">
        <View className="h-12 w-12 items-center justify-center rounded-full bg-primary-tint">
          <MaterialIcons name="lightbulb-outline" size={26} color={primaryColor} />
        </View>
        <Text className="text-2xl font-bold text-foreground">استمع ثم كرر</Text>
        <Text className="text-center text-base text-muted">
          استمع إلى الآية ثم كررها بصوتك{'\n'}حاول حفظها من دون صوت
        </Text>
      </View>

      {/* player card */}
      <View className="w-full gap-5 rounded-2xl border border-border bg-surface p-6">
        {/* progress bar + timestamps */}
        <View className="gap-1.5">
          <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
            <View className="h-full rounded-full bg-primary" style={{ width: '25%' }} />
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-muted">00:00</Text>
            <Text className="text-xs text-muted">01:12</Text>
          </View>
        </View>

        {/* transport controls */}
        <View className="flex-row items-center justify-between px-2">
          {/* speed */}
          <Pressable className="rounded-lg border border-border px-2.5 py-1">
            <Text className="text-sm font-bold text-muted">1×</Text>
          </Pressable>

          {/* rewind 10s */}
          <Pressable className="h-11 w-11 items-center justify-center">
            <MaterialIcons name="replay-10" size={30} color={primaryColor} />
          </Pressable>

          {/* play / pause */}
          <Pressable
            className="h-16 w-16 items-center justify-center rounded-full shadow-md"
            style={{ backgroundColor: primaryColor }}
          >
            <MaterialIcons name="play-arrow" size={38} color="#ffffff" />
          </Pressable>

          {/* forward 10s */}
          <Pressable className="h-11 w-11 items-center justify-center">
            <MaterialIcons name="forward-10" size={30} color={primaryColor} />
          </Pressable>

          {/* repeat */}
          <Pressable className="h-11 w-11 items-center justify-center">
            <MaterialIcons name="repeat-one" size={26} color={primaryColor} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

export default AudioPlayer;
