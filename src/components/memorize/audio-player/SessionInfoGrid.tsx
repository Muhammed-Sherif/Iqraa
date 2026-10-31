import React from 'react';
import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';
import { useMemorization } from '@/store/memorize';

/**
 * Three-column info grid displaying the current session parameters:
 * - Pause duration (automatic or countdown)
 * - Repeat count per ayah
 * - Reciter name
 *
 * Reads isInSakta, saktaDurationSeconds and settings directly from the store.
 */
export default function SessionInfoGrid() {
  const primaryColor = getStaticColor('primary');

  const { isInSakta, saktaDurationSeconds } = useMemorization(
    (state) => state.playerSession,
  );
  const repeatCount = useMemorization(
    (state) => state.settings?.repeatCount ?? 5,
  );

  return (
    <View className="flex-row gap-2.5">
      {/* Card 1: مدة الإيقاف */}
      <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
        <MaterialIcons name="timer" size={20} color={primaryColor} />
        <Text className="mt-1 text-xs text-muted">مدة الإيقاف</Text>
        <Text className="mt-0.5 text-xs font-bold text-foreground">
          {isInSakta ? `${saktaDurationSeconds} ثواني` : 'تلقائي'}
        </Text>
      </View>

      {/* Card 2: عدد التكرارات */}
      <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
        <MaterialIcons name="replay" size={20} color={primaryColor} />
        <Text className="mt-1 text-xs text-muted">عدد التكرارات</Text>
        <Text className="mt-0.5 text-xs font-bold text-foreground">
          {repeatCount} مرات
        </Text>
      </View>

      {/* Card 3: القارئ */}
      <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
        <MaterialIcons name="mic" size={20} color={primaryColor} />
        <Text className="mt-1 text-xs text-muted">القارئ</Text>
        <Text className="mt-0.5 text-xs font-bold text-foreground">
          مشاري العفاسي
        </Text>
      </View>
    </View>
  );
}
