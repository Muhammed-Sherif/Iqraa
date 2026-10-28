import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Level } from '@/core/types';

export interface OnboardingGoalStepProps {
  level: Level;
  onChangeLevel: (level: Level) => void;
  primaryColor: string;
}

/**
 * Step 3 in onboarding: Select daily memorization goal/pace (beginner, intermediate, advanced, expert).
 *
 * @param props - OnboardingGoalStepProps
 * @returns React component
 */
export function OnboardingGoalStep({
  level,
  onChangeLevel,
}: OnboardingGoalStepProps) {
  return (
    <View className="gap-3">
      <Text className="w-full text-center text-xl font-bold text-foreground">
        كم آية ترغب في حفظها يومياً؟
      </Text>
      <Text className="mb-2 w-full text-center text-xs leading-5 text-muted">
        يمكن للنظام تعديل الهدف تلقائياً مع مرور الوقت بناءً على سهولة استحضارك.
      </Text>

      {/* Beginner */}
      <Pressable
        onPress={() => onChangeLevel('beginner')}
        className={`rounded-2xl border p-4 ${
          level === 'beginner'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-foreground">مبتدئ 🌱</Text>
            <Text className="mt-0.5 text-xs text-muted">
              آية واحدة يومياً (7 آيات أسبوعياً)
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary">1 آية</Text>
        </View>
      </Pressable>

      {/* Intermediate */}
      <Pressable
        onPress={() => onChangeLevel('intermediate')}
        className={`rounded-2xl border p-4 ${
          level === 'intermediate'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-foreground">متوسط 📖</Text>
            <Text className="mt-0.5 text-xs text-muted">
              3 آيات يومياً (21 آية أسبوعياً)
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary">3 آيات</Text>
        </View>
      </Pressable>

      {/* Advanced */}
      <Pressable
        onPress={() => onChangeLevel('advanced')}
        className={`rounded-2xl border p-4 ${
          level === 'advanced'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-foreground">متقدم 🛡️</Text>
            <Text className="mt-0.5 text-xs text-muted">
              5 آيات يومياً (35 آية أسبوعياً)
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary">5 آيات</Text>
        </View>
      </Pressable>

      {/* Expert */}
      <Pressable
        onPress={() => onChangeLevel('expert')}
        className={`rounded-2xl border p-4 ${
          level === 'expert'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-base font-bold text-foreground">محترف ⚡</Text>
            <Text className="mt-0.5 text-xs text-muted">
              10 آيات يومياً (70 آية أسبوعياً)
            </Text>
          </View>
          <Text className="text-lg font-bold text-primary">10 آيات</Text>
        </View>
      </Pressable>
    </View>
  );
}
