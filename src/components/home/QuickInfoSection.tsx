import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface QuickInfoSectionProps {
  levelName?: string;
  nextRevisionText?: string;
  hardestAyahText?: string;
  streakDays?: number;
}

export function QuickInfoSection({
  levelName = 'سهل',
  nextRevisionText = 'بعد 2 يوم',
  hardestAyahText = '(البقرة: 216)',
  streakDays = 7,
}: QuickInfoSectionProps) {
  return (
    <View className="gap-3" style={{ direction: 'rtl' }}>
      {/* Header */}
      <View className="flex-row items-center gap-2">
        <MaterialIcons name="lightbulb-outline" size={20} color="#D97706" />
        <Text className="text-lg font-bold text-foreground">معلومات سريعة</Text>
      </View>

      {/* 4 Cards Grid */}
      <View className="flex-row gap-2.5">
        {/* Item 1: المستوى */}
        <View className="flex-1 items-center justify-center rounded-2xl p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/50">
          <MaterialIcons name="menu-book" size={20} color="#D97706" />
          <Text className="text-[11px] text-muted font-medium mt-1">المستوى</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5">{levelName}</Text>
        </View>

        {/* Item 2: أقرب مراجعة */}
        <View className="flex-1 items-center justify-center rounded-2xl p-3 bg-sky-50 dark:bg-sky-950/40 border border-sky-200/60 dark:border-sky-900/50">
          <MaterialIcons name="star" size={20} color="#2563EB" />
          <Text className="text-[11px] text-muted font-medium mt-1">أقرب مراجعة</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5">
            {nextRevisionText}
          </Text>
        </View>

        {/* Item 3: أصعب آية */}
        <View className="flex-1 items-center justify-center rounded-2xl p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50">
          <MaterialIcons name="track-changes" size={20} color="#059669" />
          <Text className="text-[11px] text-muted font-medium mt-1">أصعب آية</Text>
          <Text className="text-xs font-bold text-foreground mt-0.5">
            {hardestAyahText}
          </Text>
        </View>

        {/* Item 4: أطول سلسلة */}
        <View className="flex-1 items-center justify-center rounded-2xl p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-900/50">
          <MaterialIcons name="local-fire-department" size={20} color="#E11D48" />
          <Text className="text-[11px] text-muted font-medium mt-1">أطول سلسلة</Text>
          <Text className="text-sm font-bold text-foreground mt-0.5">
            {streakDays} أيام
          </Text>
        </View>
      </View>
    </View>
  );
}
