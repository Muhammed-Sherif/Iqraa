import React from 'react';
import { Modal, View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Rate } from '@/core/types';

export interface SessionSummaryModalProps {
  visible: boolean;
  totalTasks: number;
  onRateSession: (rate: Rate) => void;
  primaryColor?: string;
}

/**
 * Modal dialog displayed upon completing all scheduled revision tasks.
 * Collects the user's overall session rating to adjust tomorrow's daily goal.
 */
export function SessionSummaryModal({
  visible,
  totalTasks,
  onRateSession,
  primaryColor = '#0B302B',
}: SessionSummaryModalProps) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View
        className="flex-1 items-center justify-center bg-black/70 p-4"
        style={{ direction: 'rtl' }}
      >
        <View className="w-full max-w-md rounded-2xl border border-border bg-surface p-6 shadow-2xl">
          {/* Badge Icon */}
          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/40">
              <MaterialIcons name="verified" size={36} color="#059669" />
            </View>
          </View>

          {/* Heading */}
          <Text className="text-center text-xl font-bold text-foreground">
            أتممت مراجعة اليوم بنجاح!
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">
            راجعت {totalTasks} {totalTasks === 1 ? 'مقطع' : 'مقاطع'} قرآنية
            مباركة. كيف وجدت مستوى الجلسة ككل؟
          </Text>

          {/* Overall Rating Options */}
          <View className="mt-6 gap-3">
            {/* Easy */}
            <Pressable
              onPress={() => onRateSession('easy')}
              className="flex-row items-center justify-between rounded-xl border border-emerald-500/30 bg-emerald-50/50 p-4 active:opacity-85 dark:bg-emerald-950/20"
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons
                  name="sentiment-very-satisfied"
                  size={24}
                  color="#059669"
                />
                <View>
                  <Text className="text-base font-bold text-emerald-800 dark:text-emerald-300">
                    سهل وميسر
                  </Text>
                  <Text className="text-xs text-muted">
                    استحضار سلس، مناسب لزيادة المحفوظ
                  </Text>
                </View>
              </View>
              <MaterialIcons name="arrow-back-ios" size={16} color="#059669" />
            </Pressable>

            {/* Good */}
            <Pressable
              onPress={() => onRateSession('good')}
              className="flex-row items-center justify-between rounded-xl border border-amber-500/30 bg-amber-50/50 p-4 active:opacity-85 dark:bg-amber-950/20"
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons
                  name="sentiment-satisfied"
                  size={24}
                  color="#D97706"
                />
                <View>
                  <Text className="text-base font-bold text-amber-800 dark:text-amber-300">
                    متوسط ومناسب
                  </Text>
                  <Text className="text-xs text-muted">
                    جهد متوازن، حافظ على هذا الإيقاع
                  </Text>
                </View>
              </View>
              <MaterialIcons name="arrow-back-ios" size={16} color="#D97706" />
            </Pressable>

            {/* Hard */}
            <Pressable
              onPress={() => onRateSession('hard')}
              className="flex-row items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50/50 p-4 active:opacity-85 dark:bg-rose-950/20"
            >
              <View className="flex-row items-center gap-3">
                <MaterialIcons
                  name="sentiment-dissatisfied"
                  size={24}
                  color="#E11D48"
                />
                <View>
                  <Text className="text-base font-bold text-rose-800 dark:text-rose-300">
                    صعب ومجهد
                  </Text>
                  <Text className="text-xs text-muted">
                    تخفيف المقدار الجديد للتركيز على التثبيت
                  </Text>
                </View>
              </View>
              <MaterialIcons name="arrow-back-ios" size={16} color="#E11D48" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
