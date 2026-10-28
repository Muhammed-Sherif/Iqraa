import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Rate } from '@/core/types';
import { TaskPassage } from '@/services';
import { getStaticColor } from '@/constants/theme';
import { REVISION_RATING_OPTIONS } from '@/constants/revision';

export interface RevisionEvaluateStepProps {
  /** Passage information for active revision task */
  passage: TaskPassage;
  /** Current task index (0-based) */
  taskIndex: number;
  /** Total tasks in current session */
  totalTasks: number;
  /** Primary brand color hex */
  primaryColor: string;
  /** Callback fired when user confirms their self-assessment rating */
  onConfirmRate: (rate: Rate) => void;
  /** Callback to return to the compare step */
  onBackToCompare: () => void;
}

/**
 * Third step of the revision workflow: evaluate (التقييم).
 * Allows the user to choose their self-assessment rating (easy, good, hard)
 * which updates the Spaced Repetition System (SRS).
 *
 * Configured via REVISION_RATING_OPTIONS in constants/revision.ts,
 * with dynamic theme color resolution.
 *
 * @param props Component properties
 * @returns {JSX.Element} Evaluate step view
 */
export function RevisionEvaluateStep({
  passage,
  taskIndex,
  totalTasks,
  primaryColor,
  onConfirmRate,
  onBackToCompare,
}: RevisionEvaluateStepProps) {
  const [selectedRate, setSelectedRate] = useState<Rate | null>(null);

  const borderColor = getStaticColor('border');
  const surfaceColor = getStaticColor('surface');
  const foregroundColor = getStaticColor('foreground');

  return (
    <View className="flex-1 justify-between p-4" style={{ direction: 'rtl' }}>
      {/* Top Header info */}
      <View className="mb-3 flex-row items-center justify-between rounded-xl border border-border bg-surface p-3">
        <View className="flex-row items-center gap-2">
          <MaterialIcons name="menu-book" size={20} color={primaryColor} />
          <Text className="text-base font-semibold text-foreground">
            {passage.surahNameArabic}
          </Text>
          <Text className="text-xs text-muted">
            (الآيات {passage.startAyah} - {passage.endAyah})
          </Text>
        </View>

        <View className="rounded-full bg-primary/10 px-3 py-1">
          <Text className="text-xs font-medium text-primary">
            المقطع {taskIndex + 1} من {totalTasks}
          </Text>
        </View>
      </View>

      {/* Main Rating Options */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingVertical: 12, gap: 12 }}
      >
        <Text className="text-center text-2xl font-bold text-foreground">
          كيف كان أداؤك وحفظك؟
        </Text>
        <Text className="mb-2 text-center text-sm text-muted">
          اختر التقييم الذي يصف مستوى تذكرك لهذا المقطع بدقة
        </Text>

        {REVISION_RATING_OPTIONS.map((opt) => {
          const isSelected = selectedRate === opt.key;
          const optColor = getStaticColor(opt.colorToken);
          const optBgTint =
            opt.bgTintToken === 'danger'
              ? optColor + '18'
              : getStaticColor('primary-soft') + '35';

          return (
            <Pressable
              key={opt.key}
              onPress={() => setSelectedRate(opt.key)}
              className="flex-row items-center gap-4 rounded-2xl border p-4 active:opacity-80"
              style={{
                borderColor: isSelected ? optColor : borderColor,
                borderWidth: isSelected ? 2 : 1,
                backgroundColor: isSelected ? optBgTint : surfaceColor,
              }}
            >
              <View
                className="h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: optBgTint }}
              >
                <MaterialIcons name={opt.icon} size={28} color={optColor} />
              </View>

              <View className="flex-1" style={{ direction: 'rtl' }}>
                <Text
                  className="text-lg font-bold"
                  style={{ color: isSelected ? optColor : foregroundColor }}
                >
                  {opt.label}
                </Text>
                <Text className="mt-0.5 text-xs text-muted leading-5">
                  {opt.sublabel}
                </Text>
              </View>

              {isSelected && (
                <MaterialIcons
                  name="radio-button-checked"
                  size={22}
                  color={optColor}
                />
              )}
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Bottom Actions: Confirm and Back */}
      <View className="gap-2.5 pt-3">
        <Pressable
          disabled={!selectedRate}
          onPress={() => {
            if (selectedRate) {
              onConfirmRate(selectedRate);
            }
          }}
          className="w-full rounded-2xl p-4 shadow-md active:opacity-90"
          style={{
            backgroundColor: selectedRate ? primaryColor : borderColor,
          }}
        >
          <Text className="text-center text-lg font-bold text-white">
            تأكيد التقييم والمتابعة
          </Text>
        </Pressable>

        <Pressable
          onPress={onBackToCompare}
          className="items-center py-2 active:opacity-70"
        >
          <Text className="text-sm font-semibold text-muted">
            العودة إلى المقارنة والآيات
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
