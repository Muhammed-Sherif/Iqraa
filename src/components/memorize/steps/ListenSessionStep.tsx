import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AudioPlayer from '@/components/memorize/AudioPlayer';
import { getStaticColor } from '@/constants/theme';
import { ListeningSession } from '@/core/types';
import { useMemorization } from '@/store/memorize';
import { memorizationService } from '@/services';

export interface ListenSessionStepProps {
  session: ListeningSession;
}

/**
 * Listening and Repetition Step component.
 * Displays the unified listening interface matching the design:
 * - Header bar with Surah info and "الحفظ الجديد" badge
 * - AudioPlayer container with current Ayah card, controls, session info, and tip box
 * - Unified bottom navigation with "السابق" and "التالي"
 */
export function ListenSessionStep({ session }: ListenSessionStepProps) {
  const task = useMemorization((s) => s.task);
  const loadTaskAyat = useMemorization((s) => s.loadTaskAyat);
  const settings = useMemorization((s) => s.settings);
  const goNext = useMemorization((s) => s.goNext);
  const goPrev = useMemorization((s) => s.goPrev);
  const setScreen = useMemorization((s) => s.setScreen);

  const primaryColor = getStaticColor('primary');
  const mutedColor = getStaticColor('muted');

  const [surahName, setSurahName] = useState<string>('');

  useEffect(() => {
    if (task && (!task.quranText || task.quranText.length === 0)) {
      loadTaskAyat();
    }
  }, [task?.taskId, task?.quranText, loadTaskAyat]);

  useEffect(() => {
    if (task) {
      memorizationService.getSurahNames().then((names) => {
        setSurahName(names[task.surahNumber] ?? `سورة ${task.surahNumber}`);
      });
    }
  }, [task?.surahNumber]);

  if (!task) {
    return null;
  }

  const handleNext = () => {
    if (task.type === 'reinforcement') {
      setScreen('evaluate');
    } else {
      goNext();
    }
  };

  const startAyah = task.ayatNumbers[0] ?? 1;
  const endAyah = task.ayatNumbers[task.ayatNumbers.length - 1] ?? startAyah;

  return (
    <View className="flex-1 bg-background" style={{ direction: 'rtl' }}>
      {/* ══ Header matching mock ══════════════════════════════════════ */}
      <View className="flex-row items-center justify-between border-b border-border px-5 py-3.5">
        {/* Right Badge: نوع الحفظ */}
        <View className="flex-row items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5">
          <MaterialIcons name="menu-book" size={16} color={primaryColor} />
          <Text className="text-xs font-bold text-primary">
            {task.type === 'new' ? 'الحفظ الجديد' : 'تثبيت الحفظ'}
          </Text>
        </View>

        {/* Center Title & Subtitle */}
        <View className="items-center">
          <Text className="text-base font-bold text-foreground">
            الاستماع والتكرار
          </Text>
          <Text className="text-xs text-muted">
            {surahName} • الآيات {startAyah} - {endAyah}
          </Text>
        </View>

        {/* Left Back Arrow */}
        <Pressable onPress={goPrev} className="p-1 active:opacity-70">
          <MaterialIcons name="arrow-back-ios" size={18} color={mutedColor} />
        </Pressable>
      </View>

      {/* ══ Scrollable Content ═════════════════════════════════════════ */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <AudioPlayer
          surahNumber={task.surahNumber}
          steps={session.steps}
          setting={settings}
          onFinished={() => {
            if (task.type === 'reinforcement') {
              setScreen('evaluate');
            }
          }}
        />
      </ScrollView>

      {/* ══ Bottom Navigation Bar ═════════════════════════════════════ */}
      <View className="flex-row gap-3 border-t border-border bg-surface p-4">
        {/* Previous Button */}
        <Pressable
          onPress={goPrev}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface py-3.5 active:opacity-70"
        >
          <MaterialIcons name="arrow-back-ios" size={16} color={mutedColor} />
          <Text className="text-base font-bold text-foreground">السابق</Text>
        </Pressable>

        {/* Next Button */}
        <Pressable
          onPress={handleNext}
          className="flex-1 flex-row items-center justify-center gap-2 rounded-2xl py-3.5 shadow-md active:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <Text className="text-base font-bold text-white">التالي</Text>
          <MaterialIcons name="arrow-forward-ios" size={16} color="#FFFFFF" />
        </Pressable>
      </View>
    </View>
  );
}

export default ListenSessionStep;
