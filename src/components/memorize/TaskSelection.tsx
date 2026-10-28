import { useEffect } from 'react';
import { getStaticColor } from '@/constants/theme';
import { MemorizationTask } from '@/core/types';
import { useMemorization } from '@/store/memorize';
import { useMemorizationTasks } from '@/hooks';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

/**
 * Formats an array of ayah numbers into a user-friendly Arabic range string.
 *
 * @param ayatNumbers - Array of ayah numbers.
 * @returns Formatted range string.
 */
function formatAyatRange(ayatNumbers: number[]): string {
  if (!ayatNumbers || ayatNumbers.length === 0) return '';
  if (ayatNumbers.length === 1) {
    return `الآية ${ayatNumbers[0]}`;
  }
  const min = Math.min(...ayatNumbers);
  const max = Math.max(...ayatNumbers);
  return `الآيات من ${min} إلى ${max}`;
}

/**
 * TaskSelection component allowing users to view and pick today's memorization tasks.
 * Follows layer separation: Screen / UI -> Hook -> Service -> DB Repository -> SQLite.
 */
export const TaskSelection = () => {
  const { tasks, surahNames, loading } = useMemorizationTasks();
  const setTasks = useMemorization((state) => state.setTasks);
  const setTask = useMemorization((state) => state.setTask);

  useEffect(() => {
    if (tasks.length > 0) {
      setTasks(tasks);
    }
  }, [tasks, setTasks]);

  const onPress = (task: MemorizationTask) => {
    setTask(task);
  };

  const primaryColor = getStaticColor('primary');
  const mutedColor = getStaticColor('muted');

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-4">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  if (tasks.length === 0) {
    return (
      <View
        className="flex-1 items-center justify-center bg-background p-6"
        style={{ direction: 'rtl' }}
      >
        <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-soft mb-4">
          <MaterialIcons name="fact-check" size={32} color={primaryColor} />
        </View>
        <Text className="text-xl font-bold text-foreground text-center">
          لا توجد مهام متاحة حالياً
        </Text>
        <Text className="text-sm text-muted text-center mt-2">
          تم إكمال جميع المهام المجدولة لليوم، بارك الله فيك!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ padding: 16, gap: 12 }}
    >
      {/* Header Info */}
      <View className="mb-2 gap-1" style={{ direction: 'rtl' }}>
        <Text className="text-2xl font-bold text-foreground">مهام اليوم</Text>
        <Text className="text-sm text-muted">
          اختر الورد اليومي للبدء في جلسة الحفظ والاستماع
        </Text>
      </View>

      {/* Task Cards */}
      {tasks.map((task) => {
        const surahName =
          surahNames[task.surahNumber] || `سورة رقم ${task.surahNumber}`;
        const ayatText = formatAyatRange(task.ayatNumbers);
        const isCompleted = task.status === 'completed';
        const isNew = task.type === 'new';

        return (
          <Pressable
            key={task.taskId}
            onPress={() => onPress(task)}
            className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4 shadow-sm active:scale-[0.99] active:opacity-90"
            style={{ direction: 'rtl' }}
          >
            {/* Surah emblem + details */}
            <View className="flex-row items-center gap-3.5 flex-1">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary-soft">
                <Text className="text-base font-bold text-strong">
                  {task.surahNumber}
                </Text>
              </View>

              <View className="flex-1 gap-1">
                <View className="flex-row items-center gap-2 flex-wrap">
                  <Text className="text-lg font-bold text-foreground">
                    {surahName}
                  </Text>
                  <View
                    className={`rounded-full px-2.5 py-0.5 ${
                      isNew ? 'bg-primary-tint' : 'bg-surface border border-border'
                    }`}
                  >
                    <Text
                      className={`text-xs font-semibold ${
                        isNew ? 'text-strong' : 'text-muted'
                      }`}
                    >
                      {isNew ? 'حفظ جديد' : 'تثبيت ومراجعة'}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-1.5">
                  <MaterialIcons
                    name="auto-stories"
                    size={14}
                    color={mutedColor}
                  />
                  <Text className="text-sm text-muted">{ayatText}</Text>
                  <Text className="text-xs text-muted">
                    • ({task.ayatNumbers.length}{' '}
                    {task.ayatNumbers.length === 1 ? 'آية' : 'آيات'})
                  </Text>
                </View>
              </View>
            </View>

            {/* Action / Status Indicator */}
            <View className="mr-2">
              {isCompleted ? (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-soft">
                  <MaterialIcons name="check" size={20} color={primaryColor} />
                </View>
              ) : (
                <View className="h-9 w-9 items-center justify-center rounded-full bg-surface border border-border">
                  <MaterialIcons
                    name="play-arrow"
                    size={20}
                    color={primaryColor}
                  />
                </View>
              )}
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
};
