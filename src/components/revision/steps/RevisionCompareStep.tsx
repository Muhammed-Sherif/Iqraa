import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { TaskPassage } from '@/services';
import { MushafCard } from '@/components/ui/MushafCard';
import { VoiceEqualizer } from '@/components/ui/VoiceEqualizer';

export interface RevisionCompareStepProps {
  /** Passage details for the active task */
  passage: TaskPassage;
  /** Current task index (0-based) */
  taskIndex: number;
  /** Total number of tasks in the session */
  totalTasks: number;
  /** Primary brand theme color */
  primaryColor: string;
  /** Local file URI of the recorded recitation, if recorded */
  recordedUri: string | null;
  /** Callback to return to recording step to re-record */
  onReRecord: () => void;
  /** Callback to proceed to self-evaluation step */
  onProceedToEvaluate: () => void;
}

/**
 * Second step of the revision workflow: compare (المقارنة).
 * Reveals the Quranic text and provides playback of the user's recorded audio
 * so they can verify their recitation accuracy against the Mushaf text.
 *
 * @param props Component properties
 * @returns {JSX.Element} Compare step view
 */
export function RevisionCompareStep({
  passage,
  taskIndex,
  totalTasks,
  primaryColor,
  recordedUri,
  onReRecord,
  onProceedToEvaluate,
}: RevisionCompareStepProps) {
  const userPlayer = useAudioPlayer(recordedUri ?? undefined);
  const userStatus = useAudioPlayerStatus(userPlayer);

  const toggleUserPlay = () => {
    if (!recordedUri) return;
    if (userStatus.playing) {
      userPlayer.pause();
    } else {
      if (userStatus.didJustFinish) {
        userPlayer.seekTo(0);
      }
      userPlayer.play();
    }
  };

  const formattedAyat = passage.ayat.map((a) => ({
    num: a.ayahNumber,
    text: a.text,
  }));

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

      {/* Main Content: Quran Text & Voice Player */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 24, gap: 14 }}
      >
        <MushafCard primaryColor={primaryColor} quranText={formattedAyat} />

        {/* Audio Playback Card (if recording exists) */}
        {recordedUri ? (
          <View className="rounded-2xl border border-border bg-surface p-4">
            <View className="flex-row items-center justify-between">
              <Pressable
                onPress={toggleUserPlay}
                className="flex-row items-center gap-3 active:opacity-80"
              >
                <View
                  className="h-12 w-12 items-center justify-center rounded-full"
                  style={{ backgroundColor: primaryColor }}
                >
                  <MaterialIcons
                    name={userStatus.playing ? 'pause' : 'play-arrow'}
                    size={28}
                    color="#FFFFFF"
                  />
                </View>
                <View>
                  <Text className="text-base font-bold text-foreground">
                    {userStatus.playing
                      ? 'إيقاف الاستماع مؤقتاً'
                      : 'الاستماع إلى تلاوتك المسجلة'}
                  </Text>
                  <Text className="text-xs text-muted">
                    قارن تلاوتك بالآيات أعلاه بدقة
                  </Text>
                </View>
              </Pressable>

              <Pressable
                onPress={onReRecord}
                className="flex-row items-center gap-1 rounded-lg bg-surface px-2.5 py-1.5 border border-border active:opacity-70"
              >
                <MaterialIcons name="replay" size={16} color={primaryColor} />
                <Text className="text-xs font-semibold text-primary">
                  إعادة التسجيل
                </Text>
              </Pressable>
            </View>

            {userStatus.playing && (
              <View className="mt-2 items-center">
                <VoiceEqualizer
                  isPlaying={true}
                  barCount={7}
                  maxHeight={26}
                  color={primaryColor}
                />
              </View>
            )}
          </View>
        ) : (
          <View className="flex-row items-center justify-between rounded-xl border border-dashed border-border bg-surface/50 p-3.5">
            <Text className="text-xs text-muted">
              لم تسجل صوتاً لهذا المقطع (قراءة غيبية مباشرة)
            </Text>
            <Pressable
              onPress={onReRecord}
              className="flex-row items-center gap-1 active:opacity-70"
            >
              <MaterialIcons name="mic" size={16} color={primaryColor} />
              <Text className="text-xs font-bold text-primary">تسجيل الآن</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>

      {/* Bottom Action: Proceed to Evaluate */}
      <View className="pt-3">
        <Pressable
          onPress={onProceedToEvaluate}
          className="w-full flex-row items-center justify-center gap-2 rounded-2xl p-4 shadow-md active:opacity-90"
          style={{ backgroundColor: primaryColor }}
        >
          <MaterialIcons name="done-all" size={22} color="#FFFFFF" />
          <Text className="text-center text-lg font-bold text-white">
            التالي: تقييم الحفظ
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
