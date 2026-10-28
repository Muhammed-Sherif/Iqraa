import React, { useState, useEffect } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRevisionSession } from '@/hooks';
import {
  RevisionTasmeeStep,
  RevisionCompareStep,
  RevisionEvaluateStep,
} from './steps';
import { WeaknessModal } from './WeaknessModal';
import { SessionSummaryModal } from './SessionSummaryModal';
import { revisionService, TaskPassage } from '@/services';
import { useMemorization } from '@/store/memorize';
import { Rate } from '@/core/types';
import { WeaknessChoice } from '@/core/revision/types';
import { getStaticColor } from '@/constants/theme';

export interface ActiveRevisionSessionProps {
  /** Callback fired when the user closes the session or completes the final rating */
  onExitSession: () => void;
}

type RevisionStepMode = 'tasmee' | 'compare' | 'evaluate';

/**
 * ActiveRevisionSession Component.
 * Encapsulates the active interactive 3-step revision session flow:
 * 1. Tasmee (microphone recording from memory)
 * 2. Compare (revelation of Quranic text + recorded audio verification)
 * 3. Evaluate (self-assessment SRS rating + weakness attribution modal)
 *
 * @param {ActiveRevisionSessionProps} props Component properties
 * @returns {JSX.Element} Active revision session screen
 */
export function ActiveRevisionSession({
  onExitSession,
}: ActiveRevisionSessionProps) {
  const router = useRouter();
  const primaryColor = getStaticColor('primary');
  const dangerColor = getStaticColor('danger');

  const [currentPassage, setCurrentPassage] = useState<TaskPassage | null>(
    null,
  );
  const [loadingPassage, setLoadingPassage] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<RevisionStepMode>('tasmee');
  const [recordedAudioUri, setRecordedAudioUri] = useState<string | null>(null);

  const {
    sessionState,
    currentTask,
    phase,
    isFinished,
    loading: loadingSession,
    reveal,
    rateTask,
    chooseWeakness,
    skipTask,
    rateSession,
    backToCompare,
  } = useRevisionSession();

  // Reset sub-step and recorded audio when currentTask advances
  useEffect(() => {
    setCurrentStep('tasmee');
    setRecordedAudioUri(null);
  }, [currentTask?.id, sessionState?.currentTaskIndex]);

  // Load Quranic text passage whenever currentTask changes
  useEffect(() => {
    let isActive = true;
    if (currentTask) {
      setLoadingPassage(true);
      revisionService
        .getTaskPassage(
          currentTask.surahNumber,
          currentTask.startAyah,
          currentTask.endAyah,
        )
        .then((passage) => {
          if (isActive) {
            setCurrentPassage(passage);
            setLoadingPassage(false);
          }
        })
        .catch(() => {
          if (isActive) {
            setLoadingPassage(false);
          }
        });
    }

    return () => {
      isActive = false;
    };
  }, [currentTask]);

  /**
   * Submits self-assessment rating for current task.
   *
   * @param {Rate} rate Rating score chosen by the user
   */
  const handleRate = async (rate: Rate) => {
    await rateTask(rate);
  };

  /**
   * Confirms weakness selection and optionally launches focused reinforcement in the memorization screen.
   *
   * @param {WeaknessChoice} weakness Selected weakness category and detail
   * @param {boolean} launchReinforcement Whether to transition to memorization screen
   */
  const handleWeaknessConfirm = async (
    weakness: WeaknessChoice,
    launchReinforcement: boolean,
  ) => {
    const reinforcementTask = await chooseWeakness(
      weakness,
      launchReinforcement,
    );
    if (launchReinforcement && reinforcementTask) {
      useMemorization.getState().setTask(reinforcementTask);
      onExitSession();
      router.push('/memorize');
    }
  };

  /**
   * Returns from weakness modal back to compare step.
   */
  const handleBackFromWeakness = () => {
    backToCompare();
    setCurrentStep('compare');
  };

  /**
   * Records the user's final rating for the overall session and returns to dashboard.
   *
   * @param {Rate} rate Final session quality rating
   */
  const handleRateSession = async (rate: Rate) => {
    await rateSession(rate);
    onExitSession();
  };

  if (loadingSession || loadingPassage) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text className="mt-4 text-sm text-muted">
          جارٍ إعداد مقطع المراجعة...
        </Text>
      </SafeAreaView>
    );
  }

  const taskIndex = sessionState?.currentTaskIndex ?? 0;
  const totalTasks = sessionState?.tasks.length ?? 0;
  const isWeaknessOpen = phase === 'weaknessChoice';
  const isSummaryOpen = phase === 'finalRating' || isFinished;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'bottom']}>
      {/* Top Session Navigation */}
      <View
        className="flex-row items-center justify-between border-b border-border px-5 py-3.5"
        style={{ direction: 'rtl' }}
      >
        <Pressable onPress={onExitSession} className="p-1">
          <MaterialIcons name="close" size={24} color="#888" />
        </Pressable>
        <Text className="text-base font-bold text-foreground">
          جلسة المراجعة التفاعلية
        </Text>
        <View className="w-6" />
      </View>

      {/* 3-Step Flow: Tasmee -> Compare -> Evaluate */}
      {currentPassage && (
        <>
          {currentStep === 'tasmee' && (
            <RevisionTasmeeStep
              passage={currentPassage}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              primaryColor={primaryColor}
              dangerColor={dangerColor}
              onCompleteTasmee={(uri) => {
                setRecordedAudioUri(uri);
                reveal();
                setCurrentStep('compare');
              }}
              onSkipTask={skipTask}
            />
          )}

          {currentStep === 'compare' && (
            <RevisionCompareStep
              passage={currentPassage}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              primaryColor={primaryColor}
              recordedUri={recordedAudioUri}
              onReRecord={() => {
                setRecordedAudioUri(null);
                setCurrentStep('tasmee');
              }}
              onProceedToEvaluate={() => {
                setCurrentStep('evaluate');
              }}
            />
          )}

          {currentStep === 'evaluate' && (
            <RevisionEvaluateStep
              passage={currentPassage}
              taskIndex={taskIndex}
              totalTasks={totalTasks}
              primaryColor={primaryColor}
              onConfirmRate={handleRate}
              onBackToCompare={() => setCurrentStep('compare')}
            />
          )}
        </>
      )}

      {/* Weakness Modal for Hard Ratings */}
      <WeaknessModal
        visible={isWeaknessOpen}
        passage={currentPassage}
        onConfirm={handleWeaknessConfirm}
        onBack={handleBackFromWeakness}
      />

      {/* Session Summary & Final Rating Modal */}
      <SessionSummaryModal
        visible={isSummaryOpen}
        totalTasks={totalTasks}
        onRateSession={handleRateSession}
        primaryColor={primaryColor}
      />
    </SafeAreaView>
  );
}
