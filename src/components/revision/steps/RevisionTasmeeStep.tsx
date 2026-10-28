import React, { useEffect } from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { TaskPassage } from '@/services';
import { formatDuration } from '@/core/utils';
import { VoiceEqualizer } from '@/components/ui/VoiceEqualizer';

export interface RevisionTasmeeStepProps {
  /** Passage information for the current revision task */
  passage: TaskPassage;
  /** Current task index (0-based) */
  taskIndex: number;
  /** Total tasks in current session */
  totalTasks: number;
  /** Primary brand color hex */
  primaryColor: string;
  /** Danger color hex for active recording state */
  dangerColor: string;
  /** Callback when recording completes or user skips recording to compare */
  onCompleteTasmee: (recordedUri: string | null) => void;
  /** Callback to skip task entirely */
  onSkipTask: () => void;
}

/**
 * First step of the revision workflow: microphone recording (Tasmee).
 * Allows the user to recite from memory into the microphone or skip directly to comparison.
 *
 * @param props Component properties
 * @returns {JSX.Element} Interactive Tasmee recording screen
 */
export function RevisionTasmeeStep({
  passage,
  taskIndex,
  totalTasks,
  primaryColor,
  dangerColor,
  onCompleteTasmee,
  onSkipTask,
}: RevisionTasmeeStepProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert(
            'تنبيه',
            'يجب إعطاء صلاحية استخدام الميكروفون لتسجيل التلاوة',
          );
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (err) {
        console.error('Failed to configure audio mode for revision:', err);
      }
    })();
  }, []);

  const handleStartRecord = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start revision recording:', err);
    }
  };

  const handleStopRecord = async () => {
    try {
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      onCompleteTasmee(uri ?? null);
    } catch (err) {
      console.error('Failed to stop revision recording:', err);
      onCompleteTasmee(null);
    }
  };

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

      {/* Center Recording Area */}
      <View className="my-auto items-center justify-center gap-6 px-4">
        <View className="items-center gap-3">
          <Pressable
            onPress={
              recorderState.isRecording ? handleStopRecord : handleStartRecord
            }
            className="h-28 w-28 items-center justify-center rounded-full shadow-lg active:opacity-85"
            style={{
              backgroundColor: recorderState.isRecording
                ? dangerColor
                : primaryColor,
            }}
          >
            <MaterialIcons
              name={recorderState.isRecording ? 'stop' : 'mic'}
              size={54}
              color="#FFFFFF"
            />
          </Pressable>

          <Text className="mt-2 text-center text-2xl font-bold text-foreground">
            {recorderState.isRecording
              ? 'جارٍ تسجيل التلاوة...'
              : 'اتلُ الآيات غيباً'}
          </Text>

          <Text className="text-center text-sm leading-6 text-muted">
            {recorderState.isRecording
              ? 'اتلُ الآيات بصوت واضح ثم اضغط الزر لإيقاف التسجيل'
              : `استحضر الآيات (${passage.startAyah} - ${passage.endAyah}) من سورة ${passage.surahNameArabic}`}
          </Text>
        </View>

        {/* Recording Equalizer & Elapsed Duration */}
        {recorderState.isRecording && (
          <View className="items-center gap-2">
            <VoiceEqualizer
              isPlaying={true}
              barCount={9}
              maxHeight={34}
              color={dangerColor}
            />
            <Text className="text-xl font-bold text-foreground">
              {formatDuration(recorderState.durationMillis)}
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Actions */}
      <View className="gap-3 pt-4">
        {recorderState.isRecording ? (
          <Pressable
            onPress={handleStopRecord}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl p-4 shadow-md active:opacity-90"
            style={{ backgroundColor: dangerColor }}
          >
            <MaterialIcons name="stop-circle" size={24} color="#FFFFFF" />
            <Text className="text-center text-lg font-bold text-white">
              إنهاء التسجيل والمقارنة
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => onCompleteTasmee(null)}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl p-4 shadow-md active:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            <MaterialIcons name="visibility" size={22} color="#FFFFFF" />
            <Text className="text-center text-lg font-bold text-white">
              المتابعة إلى المقارنة (بدون تسجيل)
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onSkipTask}
          className="items-center py-2 active:opacity-70"
        >
          <Text className="text-sm font-medium text-muted">تخطي هذا المقطع</Text>
        </Pressable>
      </View>
    </View>
  );
}
