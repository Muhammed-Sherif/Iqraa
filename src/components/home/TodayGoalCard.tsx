import { Image, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';

export function TodayGoalCard({
  dailyGoalAyat,
  currentDay = 12,
  totalDays = 30,
}: {
  dailyGoalAyat: number;
  currentDay?: number;
  totalDays?: number;
}) {
  const progressPercent = Math.min(100, Math.max(0, (currentDay / totalDays) * 100));
  const strong = getStaticColor('strong')
  return (
    <View
      className="relative overflow-hidden rounded-3xl p-5 shadow-md bg-primary/60"
      style={{ direction: 'rtl' }}
    >
        {/* Header row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="track-changes" size={22} color={strong} />
            <Text className="text-xl font-bold text-white">هدفك اليوم</Text>
          </View>
        </View>

      {/* Inner Content: Stats & 3D Quran image */}
      <View className="flex-row items-center justify-between">
        {/* Right: Goals pills */}
        <View className="flex-1 flex-row gap-3">
          {/* New Ayat Goal */}
          <View className="flex-1 items-center justify-center rounded-2xl bg-white/10 p-3 border border-white/10">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialIcons name="auto-stories" size={16} color={strong} />
              <Text className="text-xs text-white/80">حفظ جديد</Text>
            </View>
            <Text className="text-lg font-bold text-white">
              {dailyGoalAyat} {dailyGoalAyat === 1 ? 'آية' : 'آيات'}
            </Text>
          </View>

          {/* Revision Goal */}
          <View className="flex-1 items-center justify-center rounded-2xl bg-white/10 p-3 border border-white/10">
            <View className="flex-row items-center gap-1.5 mb-1">
              <MaterialIcons name="sync" size={16} color={strong} />
              <Text className="text-xs text-white/80">مراجعة</Text>
            </View>
            <Text className="text-lg font-bold text-white">1 آية</Text>
          </View>
        </View>

        {/* Left: 3D Quran Image & Days Progress */}
        <View className="items-center mr-3 gap-2">
          <Image
            source={require('../../../assets/images/quran-3d-green.jpg')}
            className="h-20 w-20 rounded-2xl shadow-lg"
            resizeMode="cover"
          />
          <View className="w-24 items-center">
            <View className="h-1.5 w-full rounded-full bg-white/20 overflow-hidden mb-1">
              <View
                className="h-full rounded-full bg-strong"
                style={{ width: `${progressPercent}%` }}
              />
            </View>
            <Text className="text-[11px] text-white/80 font-medium">
              اليوم {currentDay} من {totalDays}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
