import React from 'react';
import { View, Text } from 'react-native';
import { getStaticColor } from '@/constants/theme';
import { removeTashkeel } from '@/core/utils';
import { useMemorization } from '@/store/memorize';

export interface AyahCardProps {
  /** The currently active ayah number in the session */
  currentAyah: number;
}

/**
 * Displays the currently active ayah inside a card:
 * - Badge showing position within the session (e.g. "الآية 2 من 5")
 * - Full Uthmani text with verse marker
 * - Simplified clean text (tashkeel stripped) for easy reference
 * - Decorative divider
 *
 * Reads quranText and ayatNumbers directly from the memorization store.
 * Only receives `currentAyah` as a prop because `steps` lives in the audio orchestrator.
 */
export default function AyahCard({ currentAyah }: AyahCardProps) {
  const primaryColor = getStaticColor('primary');

  const task = useMemorization((state) => state.task);

  const currentAyahIndex = task?.ayatNumbers
    ? Math.max(1, task.ayatNumbers.indexOf(currentAyah) + 1)
    : 1;
  const totalCount = task?.ayatNumbers?.length ?? 1;
  const ayahText =
    task?.quranText?.find((a) => a.num === currentAyah)?.text ?? '';
  const cleanText = ayahText ? removeTashkeel(ayahText) : '';

  return (
    <View className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
      {/* Ayah Index Badge */}
      <View className="mb-5 self-center rounded-full bg-border/40 px-4 py-1">
        <Text className="text-xs font-semibold text-muted">
          الآية {currentAyahIndex} من {totalCount}
        </Text>
      </View>

      {/* Uthmani Quranic Text */}
      <Text
        className="text-center text-3xl font-bold leading-relaxed text-foreground"
        style={{ fontFamily: 'serif' }}
      >
        {ayahText ? (
          <>
            {ayahText}{' '}
            <Text className="text-2xl" style={{ color: primaryColor }}>
              ﴿{currentAyah}﴾
            </Text>
          </>
        ) : (
          'جارٍ تحميل نص الآية...'
        )}
      </Text>

      {/* Clean simplified reading text */}
      {cleanText ? (
        <Text className="mt-3 text-center text-sm leading-6 text-muted">
          ({currentAyah}) {cleanText}
        </Text>
      ) : null}

      {/* Decorative divider */}
      <View className="mt-5 h-px w-2/3 self-center bg-border/60" />
    </View>
  );
}
