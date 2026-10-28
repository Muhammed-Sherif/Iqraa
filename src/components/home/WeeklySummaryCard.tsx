import { Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';

interface WeeklySummaryCardProps {
  savedAyatCount?: number;
  revisionsCount?: number;
  listeningHours?: number;
  commitmentRate?: number;
}

export function WeeklySummaryCard({
  savedAyatCount = 10,
  revisionsCount = 3,
  listeningHours = 2,
  commitmentRate = 92,
}: WeeklySummaryCardProps) {
  const strongColor = getStaticColor('strong');
  const primaryColor = getStaticColor('primary');

  return (
    <View
      className="rounded-3xl border border-border bg-surface p-5 shadow-sm"
      style={{ direction: 'rtl' }}
    >
      {/* Title */}
      <View className="flex-row items-center gap-2 mb-4">
        <MaterialIcons name="insert-chart" size={22} color={strongColor} />
        <Text className="text-lg font-bold text-foreground">ملخص الأسبوع</Text>
      </View>

      {/* 4 Metrics Columns */}
      <View className="flex-row items-center justify-between">
        {/* Stat 1 */}
        <View className="flex-1 items-center gap-1.5">
          <Text className="text-2xl font-bold text-foreground">{savedAyatCount}</Text>
          <Text className="text-xs text-muted text-center">آيات محفوظة</Text>
          <MaterialIcons name="auto-stories" size={18} color={primaryColor} />
        </View>

        <View className="h-10 w-[1px] bg-border" />

        {/* Stat 2 */}
        <View className="flex-1 items-center gap-1.5">
          <Text className="text-2xl font-bold text-foreground">{revisionsCount}</Text>
          <Text className="text-xs text-muted text-center">مراجعات</Text>
          <MaterialIcons name="sync" size={18} color="#3B82F6" />
        </View>

        <View className="h-10 w-[1px] bg-border" />

        {/* Stat 3 */}
        <View className="flex-1 items-center gap-1.5">
          <Text className="text-2xl font-bold text-foreground">{listeningHours}</Text>
          <Text className="text-xs text-muted text-center">ساعات استماع</Text>
          <MaterialIcons name="headphones" size={18} color="#8B5CF6" />
        </View>

        <View className="h-10 w-[1px] bg-border" />

        {/* Stat 4 */}
        <View className="flex-1 items-center gap-1.5">
          <Text className="text-2xl font-bold text-foreground">{commitmentRate}%</Text>
          <Text className="text-xs text-muted text-center">معدل الالتزام</Text>
          <MaterialIcons name="event-available" size={18} color="#10B981" />
        </View>
      </View>
    </View>
  );
}
