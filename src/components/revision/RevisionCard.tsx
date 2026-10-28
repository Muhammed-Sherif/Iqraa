import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Rate } from '@/core/types';
import { TaskPassage } from '@/services';

export interface RevisionCardProps {
  passage: TaskPassage | null;
  taskIndex: number;
  totalTasks: number;
  isRevealed: boolean;
  onReveal: () => void;
  onRate: (rate: Rate) => void;
  onSkip?: () => void;
  primaryColor?: string;
}

/**
 * Interactive card displaying the current revision passage,
 * recitation prompt, revealed Quranic text, and self-evaluation controls.
 */
export function RevisionCard({
  passage,
  taskIndex,
  totalTasks,
  isRevealed,
  onReveal,
  onRate,
  onSkip,
  primaryColor = '#0B302B',
}: RevisionCardProps) {
  if (!passage) {
    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-base text-muted">
          جارٍ تحميل بيانات المراجعة...
        </Text>
      </View>
    );
  }

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
            {taskIndex + 1} من {totalTasks}
          </Text>
        </View>
      </View>

      {/* Main Content Area */}
      <View className="my-2 flex-1 justify-center">
        {!isRevealed ? (
          <View className="items-center justify-center rounded-2xl border border-dashed border-border bg-surface/50 p-8 py-14">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <MaterialIcons
                name="record-voice-over"
                size={32}
                color={primaryColor}
              />
            </View>
            <Text className="text-center text-xl font-bold text-foreground">
              اتلُ الآيات غيباً
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-muted">
              استحضر الآيات من سورة {passage.surahNameArabic} من الآية{' '}
              {passage.startAyah} إلى الآية {passage.endAyah}
            </Text>

            <Pressable
              onPress={onReveal}
              className="mt-8 flex-row items-center gap-2 rounded-xl bg-primary px-6 py-3.5 shadow-sm active:opacity-90"
            >
              <MaterialIcons name="visibility" size={20} color="#FFFFFF" />
              <Text className="text-base font-semibold text-white">
                أظهر الآيات للمقارنة
              </Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView
            className="flex-1 rounded-2xl border border-border bg-surface p-5"
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            <Text
              className="text-center text-2xl leading-10 text-foreground"
              style={{ fontFamily: 'serif' }}
            >
              {passage.ayat.map((a) => (
                <Text key={a.ayahNumber}>
                  {a.text}{' '}
                  <Text
                    className="text-lg font-bold"
                    style={{ color: primaryColor }}
                  >
                    ﴿{a.ayahNumber}﴾
                  </Text>{' '}
                </Text>
              ))}
            </Text>
          </ScrollView>
        )}
      </View>

      {/* Bottom Evaluation Controls (visible when revealed) */}
      {isRevealed && (
        <View className="mt-3 gap-2">
          <Text className="text-center text-xs font-medium text-muted">
            كيف كان استحضارك للآيات؟
          </Text>
          <View className="flex-row items-center justify-between gap-2">
            {/* Easy (ممتاز) */}
            <Pressable
              onPress={() => onRate('easy')}
              className="flex-1 items-center justify-center rounded-xl bg-emerald-600 py-3 active:opacity-85"
            >
              <Text className="text-sm font-bold text-white">ممتاز</Text>
              <Text className="text-[10px] text-white/80">حفظ متقن</Text>
            </Pressable>

            {/* Good (جيد) */}
            <Pressable
              onPress={() => onRate('good')}
              className="flex-1 items-center justify-center rounded-xl bg-amber-600 py-3 active:opacity-85"
            >
              <Text className="text-sm font-bold text-white">جيد</Text>
              <Text className="text-[10px] text-white/80">مع تردد يسير</Text>
            </Pressable>

            {/* Hard (صعب) */}
            <Pressable
              onPress={() => onRate('hard')}
              className="flex-1 items-center justify-center rounded-xl bg-rose-600 py-3 active:opacity-85"
            >
              <Text className="text-sm font-bold text-white">صعب</Text>
              <Text className="text-[10px] text-white/80">تعثر أو خطأ</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Skip button if not yet revealed */}
      {!isRevealed && onSkip && (
        <Pressable
          onPress={onSkip}
          className="mt-2 items-center py-2 active:opacity-70"
        >
          <Text className="text-xs text-muted">تخطي هذا المقطع مؤقتاً</Text>
        </Pressable>
      )}
    </View>
  );
}
