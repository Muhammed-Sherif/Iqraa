import React, { useState } from 'react';
import { Modal, View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { WeaknessChoice } from '@/core/revision/types';
import { TaskPassage } from '@/services';

export interface WeaknessModalProps {
  visible: boolean;
  passage: TaskPassage | null;
  onConfirm: (choice: WeaknessChoice, launchReinforcement: boolean) => void;
  onBack: () => void;
}

/**
 * Modal dialog presented when a task is rated 'hard', allowing the user
 * to select the specific weak Ayah and choose whether to trigger immediate reinforcement.
 */
export function WeaknessModal({
  visible,
  passage,
  onConfirm,
  onBack,
}: WeaknessModalProps) {
  const [selectedAyah, setSelectedAyah] = useState<number | null>(null);
  const [choiceType, setChoiceType] = useState<
    'specific' | 'whole' | 'unknown'
  >('whole');

  if (!passage) return null;

  const handleSelectSpecific = (ayahNumber: number) => {
    setSelectedAyah(ayahNumber);
    setChoiceType('specific');
  };

  const handleSelectWhole = () => {
    setSelectedAyah(null);
    setChoiceType('whole');
  };

  const handleSelectUnknown = () => {
    setSelectedAyah(null);
    setChoiceType('unknown');
  };

  const getResolvedChoice = (): WeaknessChoice => {
    if (choiceType === 'specific' && selectedAyah != null) {
      return { ayah: selectedAyah };
    }
    if (choiceType === 'unknown') {
      return 'unknown';
    }
    return 'wholePassage';
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View
        className="flex-1 items-center justify-center bg-black/60 p-4"
        style={{ direction: 'rtl' }}
      >
        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-xl">
          {/* Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-rose-100 dark:bg-rose-950/40">
                <MaterialIcons name="flag" size={20} color="#E11D48" />
              </View>
              <Text className="text-lg font-bold text-foreground">
                تحديد موضع التعثر
              </Text>
            </View>

            <Pressable onPress={onBack} className="p-1">
              <MaterialIcons name="close" size={22} color="#888" />
            </Pressable>
          </View>

          <Text className="mb-4 text-sm text-muted">
            أين واجهت صعوبة في سورة {passage.surahNameArabic}؟
          </Text>

          {/* Ayah selector chips */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mb-4 flex-row gap-2 py-1"
          >
            {passage.ayat.map((a) => {
              const isSelected =
                choiceType === 'specific' && selectedAyah === a.ayahNumber;
              return (
                <Pressable
                  key={a.ayahNumber}
                  onPress={() => handleSelectSpecific(a.ayahNumber)}
                  className={`rounded-xl border px-4 py-2.5 ${
                    isSelected
                      ? 'border-primary bg-primary'
                      : 'border-border bg-background'
                  }`}
                >
                  <Text
                    className={`text-sm font-semibold ${
                      isSelected ? 'text-white' : 'text-foreground'
                    }`}
                  >
                    الآية {a.ayahNumber}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Broad options */}
          <View className="mb-6 flex-row gap-2">
            <Pressable
              onPress={handleSelectWhole}
              className={`flex-1 items-center rounded-xl border p-3 ${
                choiceType === 'whole'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  choiceType === 'whole'
                    ? 'font-bold text-primary'
                    : 'text-foreground'
                }`}
              >
                المقطع كاملاً
              </Text>
            </Pressable>

            <Pressable
              onPress={handleSelectUnknown}
              className={`flex-1 items-center rounded-xl border p-3 ${
                choiceType === 'unknown'
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-background'
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  choiceType === 'unknown'
                    ? 'font-bold text-primary'
                    : 'text-foreground'
                }`}
              >
                غير متأكد
              </Text>
            </Pressable>
          </View>

          {/* Action Buttons */}
          <View className="gap-2">
            <Pressable
              onPress={() => onConfirm(getResolvedChoice(), true)}
              className="items-center rounded-xl bg-primary py-3.5 shadow-sm active:opacity-90"
            >
              <Text className="text-base font-bold text-white">
                تثبيت وتكرار الآن
              </Text>
              <Text className="text-[11px] text-white/80">
                فتح جلسة تدريب مكثفة لهذا الموضع
              </Text>
            </Pressable>

            <Pressable
              onPress={() => onConfirm(getResolvedChoice(), false)}
              className="items-center rounded-xl border border-border bg-background py-3 active:opacity-75"
            >
              <Text className="text-sm font-medium text-foreground">
                تسجيل ومتابعة المراجعة
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
