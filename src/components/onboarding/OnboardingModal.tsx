import React, { useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';
import { Direction, Level, UserType } from '@/core/types';
import { onboardingService } from '@/services';
import { OnboardingUserTypeStep } from './steps/OnboardingUserTypeStep';
import { OnboardingDirectionStep } from './steps/OnboardingDirectionStep';
import { OnboardingGoalStep } from './steps/OnboardingGoalStep';

export interface OnboardingModalProps {
  visible: boolean;
  onCompleted: () => void;
  onClose?: () => void;
}

/**
 * Onboarding setup modal to determine user level, memorization background,
 * and direction, and initialize their SQLite progress profile.
 *
 * @param props - OnboardingModalProps
 * @returns React modal component
 */
export function OnboardingModal({
  visible,
  onCompleted,
  onClose,
}: OnboardingModalProps) {
  const primaryColor = getStaticColor('primary');
  const insets = useSafeAreaInsets();

  const [step, setStep] = useState<number>(1);
  const [userType, setUserType] = useState<UserType>('notHafiz');
  const [direction, setDirection] = useState<Direction>('asc');
  const [lastSurah, setLastSurah] = useState<number>(78);
  const [lastAyah, setLastAyah] = useState<number>(1);
  const [level, setLevel] = useState<Level>('beginner');
  const [loading, setLoading] = useState<boolean>(false);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const endParam =
        userType === 'partiallyHafiz'
          ? { surahNumber: lastSurah, ayahNumber: lastAyah }
          : undefined;

      await onboardingService.registerExistingMemorization({
        userType,
        direction,
        level,
        end: endParam,
      });

      setLoading(false);
      onCompleted();
    } catch (error) {
      console.error('[OnboardingModal] Registration failed:', error);
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose ?? onCompleted}
    >
      <View
        className="flex-1 bg-background"
        style={{
          direction: 'rtl',
        }}
      >
        {/* Header Indicator */}
        <View className="relative flex-row items-center justify-center border-b border-border bg-surface px-5 py-4">
          {step > 1 && (
            <Pressable
              onPress={() => setStep(step - 1)}
              className="absolute right-5 h-9 w-9 items-center justify-center rounded-xl border border-border bg-background active:opacity-70"
            >
              <MaterialIcons
                name="arrow-forward-ios"
                size={16}
                color={primaryColor}
              />
            </Pressable>
          )}

          <Text className="text-center text-base font-bold text-foreground">
            إعداد خطة الحفظ والمراجعة ({step} من 3)
          </Text>

          {onClose && (
            <Pressable
              onPress={onClose}
              className="absolute left-5 h-9 w-9 items-center justify-center rounded-xl border border-border bg-background active:opacity-70"
            >
              <MaterialIcons name="close" size={20} color={primaryColor} />
            </Pressable>
          )}
        </View>

        {/* Content Body */}
        <ScrollView
          className="flex-1 m-4"
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        >
          {step === 1 && (
            <OnboardingUserTypeStep
              userType={userType}
              onChangeUserType={setUserType}
              primaryColor={primaryColor}
            />
          )}

          {step === 2 && (
            <OnboardingDirectionStep
              direction={direction}
              onChangeDirection={setDirection}
              userType={userType}
              lastSurah={lastSurah}
              lastAyah={lastAyah}
              onChangeLastSurah={setLastSurah}
              onChangeLastAyah={setLastAyah}
              primaryColor={primaryColor}
            />
          )}

          {step === 3 && (
            <OnboardingGoalStep
              level={level}
              onChangeLevel={setLevel}
              primaryColor={primaryColor}
            />
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View
          className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface px-4 pt-3 pb-6 shadow-lg"
        >
          {loading ? (
            <View className="items-center py-4">
              <ActivityIndicator size="large" color={primaryColor} />
              <Text className="mt-2 text-xs text-muted">
                جارٍ تهيئة جدول الحفظ والمراجعة...
              </Text>
            </View>
          ) : step < 3 ? (
            <Pressable
              onPress={() => setStep(step + 1)}
              className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 shadow-sm active:opacity-85"
            >
              <Text className="text-lg font-bold text-white">المتابعة</Text>
              <MaterialIcons name="arrow-back-ios" size={18} color="#FFFFFF" />
            </Pressable>
          ) : (
            <Pressable
              onPress={handleFinish}
              className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 shadow-sm active:opacity-85"
            >
              <MaterialIcons name="check" size={22} color="#FFFFFF" />
              <Text className="text-lg font-bold text-white">
                ابدأ رحلة الحفظ والمراجعة
              </Text>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}
