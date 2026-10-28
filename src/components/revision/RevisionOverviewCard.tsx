import React from 'react';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DueSummary } from '@/services';
import { getStaticColor } from '@/constants/theme';

export interface RevisionOverviewCardProps {
  /** Summary of today's revision session tasks and metrics */
  summary: DueSummary | null;
  /** Callback fired when the user presses the start revision session button */
  onStartSession: () => void;
}

/**
 * RevisionOverviewCard Component.
 * Displays today's revision progress, metric pills (Total, Completed, SRS Overdue),
 * and action buttons or statuses based on session progress.
 *
 * @param {RevisionOverviewCardProps} props Component properties
 * @returns {JSX.Element} Rendered overview card
 */
export function RevisionOverviewCard({
  summary,
  onStartSession,
}: RevisionOverviewCardProps) {
  const primaryColor = getStaticColor('primary');
  const hasTasks = (summary?.totalTasks ?? 0) > 0;
  const isCompleted = summary?.isSessionFinished ?? false;
  const pendingCount = summary?.pendingTasks ?? 0;

  return (
    <View className="mb-5 rounded-2xl border border-border bg-surface p-5 shadow-sm">
      <View
        className="flex-row items-center justify-between"
        style={{ direction: 'rtl' }}
      >
        <View>
          <Text className="text-xs text-muted">مهام المراجعة اليوم</Text>
          <Text className="mt-1 text-2xl font-bold text-foreground">
            {isCompleted
              ? 'مكتملة بالكامل'
              : hasTasks
                ? `${pendingCount} مقاطع متبقية`
                : 'لا توجد مقاطع اليوم'}
          </Text>
        </View>
        <View
          className={`h-12 w-12 items-center justify-center rounded-2xl ${
            isCompleted
              ? 'bg-emerald-100 dark:bg-emerald-950/40'
              : 'bg-primary/10'
          }`}
        >
          <MaterialIcons
            name={isCompleted ? 'check-circle' : 'schedule'}
            size={26}
            color={isCompleted ? '#059669' : primaryColor}
          />
        </View>
      </View>

      {/* Metric Pills */}
      <View
        className="mt-4 flex-row items-center gap-2 border-t border-border pt-4"
        style={{ direction: 'rtl' }}
      >
        <View className="flex-1 items-center rounded-xl bg-background p-2.5">
          <Text className="text-xs text-muted">الإجمالي</Text>
          <Text className="text-base font-bold text-foreground">
            {summary?.totalTasks ?? 0}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-background p-2.5">
          <Text className="text-xs text-muted">المكتمل</Text>
          <Text className="text-base font-bold text-emerald-600">
            {summary?.completedTasks ?? 0}
          </Text>
        </View>
        <View className="flex-1 items-center rounded-xl bg-background p-2.5">
          <Text className="text-xs text-muted">المستحق SRS</Text>
          <Text className="text-base font-bold text-amber-600">
            {summary?.overdueCount ?? 0}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      {hasTasks && !isCompleted && (
        <Pressable
          onPress={onStartSession}
          className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-primary py-3.5 shadow-sm active:opacity-90"
        >
          <MaterialIcons name="play-arrow" size={22} color="#FFFFFF" />
          <Text className="text-base font-bold text-white">
            بدء جلسة المراجعة ({pendingCount})
          </Text>
        </Pressable>
      )}

      {isCompleted && (
        <View className="mt-4 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <Text className="text-center text-xs font-medium text-emerald-800 dark:text-emerald-300">
            أحسنت! تم إنجاز مراجعة اليوم بنجاح وستُجدول المراجعات القادمة
            تلقائياً.
          </Text>
        </View>
      )}

      {!hasTasks && (
        <View className="mt-4 rounded-xl bg-background p-3">
          <Text className="text-center text-xs leading-5 text-muted">
            لا توجد مقاطع مجدولة للمراجعة الآن. يمكنك حفظ آيات جديدة في تبويب
            الحفظ لتضاف إلى جدول المراجعة الذكي.
          </Text>
        </View>
      )}
    </View>
  );
}
