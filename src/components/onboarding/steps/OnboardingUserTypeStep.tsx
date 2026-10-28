import React from 'react';
import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { UserType } from '@/core/types';

export interface OnboardingUserTypeStepProps {
  userType: UserType;
  onChangeUserType: (type: UserType) => void;
  primaryColor: string;
}

/**
 * Step 1 in onboarding: Select user memorization baseline (notHafiz, partiallyHafiz, hafiz).
 *
 * @param props - OnboardingUserTypeStepProps
 * @returns React component
 */
export function OnboardingUserTypeStep({
  userType,
  onChangeUserType,
  primaryColor,
}: OnboardingUserTypeStepProps) {
  return (
    <View className="gap-3">
      <Text className="w-full text-center text-xl font-bold text-foreground">
        ما هو مستواك الحالي في حفظ القرآن الكريم؟
      </Text>
      <Text className="mb-2 w-full text-center text-xs leading-5 text-muted">
        سنخصص خطة الحفظ والمراجعة الذكية بناءً على إجابتك.
      </Text>

      {/* notHafiz */}
      <Pressable
        onPress={() => onChangeUserType('notHafiz')}
        className={`rounded-2xl border p-4 ${
          userType === 'notHafiz'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MaterialIcons name="menu-book" size={22} color={primaryColor} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              سأبدأ الحفظ من البداية
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              ليس لدي محفوظ سابق وسأبدأ بحفظ آيات جديدة.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* partiallyHafiz */}
      <Pressable
        onPress={() => onChangeUserType('partiallyHafiz')}
        className={`rounded-2xl border p-4 ${
          userType === 'partiallyHafiz'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MaterialIcons name="auto-stories" size={22} color={primaryColor} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              أحفظ بعض السور والأجزاء
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              أريد مراجعة محفوظي السابق ومتابعة الحفظ الجديد.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* hafiz */}
      <Pressable
        onPress={() => onChangeUserType('hafiz')}
        className={`rounded-2xl border p-4 ${
          userType === 'hafiz'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MaterialIcons
              name="workspace-premium"
              size={22}
              color={primaryColor}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              خاتم للقرآن الكريم كاملاً
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              هدفي هو تثبيت ومراجعة القرآن الكريم بجدول تكرار ذكي.
            </Text>
          </View>
        </View>
      </Pressable>
    </View>
  );
}
