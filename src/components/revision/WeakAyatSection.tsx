import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useWeakAyat } from '@/hooks';
import { useMemorization } from '@/store/memorize';
import { getStaticColor } from '@/constants/theme';

export interface WeakAyatSectionProps {
  /** Optional task ID to associate with the reinforcement session. Defaults to 1. */
  fallbackTaskId?: number;
}

/**
 * WeakAyatSection Component.
 * Displays list of Ayat flagged for reinforcement due to high fail count,
 * with options to immediately launch a focused memorization session.
 *
 * @param {WeakAyatSectionProps} props Component properties
 * @returns {JSX.Element} Weak Ayat section UI
 */
export function WeakAyatSection({ fallbackTaskId = 1 }: WeakAyatSectionProps) {
  const router = useRouter();
  const primaryColor = getStaticColor('primary');
  const { weakAyat, loading: loadingWeakAyat, reinforcePassage } = useWeakAyat();

  /**
   * Triggers targeted reinforcement for a single weak Ayah and navigates to the memorization screen.
   *
   * @param {number} surahNumber Surah number
   * @param {number} ayahNumber Ayah number
   */
  const handleReinforceWeakAyah = async (
    surahNumber: number,
    ayahNumber: number,
  ) => {
    const task = await reinforcePassage(fallbackTaskId, {
      ayah: ayahNumber,
    });
    useMemorization.getState().setTask(task);
    router.push('/memorize');
  };

  return (
    <View className="mb-5">
      <View
        className="mb-3 flex-row items-center justify-between"
        style={{ direction: 'rtl' }}
      >
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="error-outline" size={20} color="#E11D48" />
          <Text className="text-base font-bold text-foreground">
            آيات تحتاج إلى تثبيت
          </Text>
        </View>
        <Text className="text-xs text-muted">
          {weakAyat.length} {weakAyat.length === 1 ? 'آية' : 'آيات'}
        </Text>
      </View>

      {loadingWeakAyat ? (
        <ActivityIndicator size="small" color={primaryColor} />
      ) : weakAyat.length === 0 ? (
        <View className="items-center rounded-xl border border-dashed border-border p-4">
          <Text className="text-xs text-muted">
            لا توجد مواضع تعثر حالياً، حفظك متين بحمد الله!
          </Text>
        </View>
      ) : (
        <View className="gap-2">
          {weakAyat.slice(0, 5).map((item) => (
            <View
              key={`${item.surahNumber}-${item.ayahNumber}`}
              className="flex-row items-center justify-between rounded-xl border border-border bg-surface p-3.5"
              style={{ direction: 'rtl' }}
            >
              <View className="flex-row items-center gap-2">
                <View className="h-7 w-7 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
                  <Text className="text-xs font-bold text-rose-600">
                    {item.failCount}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-semibold text-foreground">
                    سورة {item.surahNumber} • الآية {item.ayahNumber}
                  </Text>
                  <Text className="text-[10px] text-muted">
                    مرات التعثر: {item.failCount}
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={() =>
                  handleReinforceWeakAyah(item.surahNumber, item.ayahNumber)
                }
                className="rounded-lg bg-primary/10 px-3 py-1.5 active:opacity-75"
              >
                <Text className="text-xs font-semibold text-primary">
                  تثبيت
                </Text>
              </Pressable>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}
