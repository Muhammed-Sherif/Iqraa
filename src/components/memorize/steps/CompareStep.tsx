import { MushafCard } from '@/components/ui/MushafCard';
import { useMemorization } from '@/store/memorize';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { useEffect } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

export function CompareStep({
  primaryColor,
  onNext,
}: {
  primaryColor: string;
  onNext: () => void;
}) {
  const task = useMemorization((s) => s.task);
  const recordedAudioUri = useMemorization((s) => s.recordedAudioUri);
  const loadTaskAyat = useMemorization((s) => s.loadTaskAyat);

  const quranText = task?.quranText ?? [];
  const loadingAyat = !task?.quranText;

  const userPlayer = useAudioPlayer(recordedAudioUri ?? undefined);
  const userStatus = useAudioPlayerStatus(userPlayer);

  const toggleUserPlay = () => {
    if (!recordedAudioUri) return;
    if (userStatus.playing) {
      userPlayer.pause();
    } else {
      if (userStatus.didJustFinish) {
        userPlayer.seekTo(0);
      }
      userPlayer.play();
    }
  };

  useEffect(() => {
    if (task && (!task.quranText || task.quranText.length === 0)) {
      loadTaskAyat();
    }
  }, [task?.taskId, task?.quranText, loadTaskAyat]);

  return (
    <>
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingVertical: 16, gap: 12 }}
      >
        {loadingAyat ? (
          <View className="py-12 items-center justify-center">
            <ActivityIndicator size="large" color={primaryColor} />
          </View>
        ) : (
          <MushafCard primaryColor={primaryColor} quranText={quranText} />
        )}

        {/* Listen to user's own recording if available */}
        {recordedAudioUri && (
          <Pressable
            onPress={toggleUserPlay}
            className="flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 shadow-sm active:opacity-80"
            style={{ direction: 'rtl' }}
          >
            <MaterialIcons
              name={userStatus.playing ? 'pause-circle-filled' : 'play-circle-fill'}
              size={24}
              color={primaryColor}
            />
            <Text className="text-lg font-bold text-foreground">
              {userStatus.playing ? 'إيقاف تسجيلك مؤقتاً' : 'استمع إلى تسجيلك الصوتي'}
            </Text>
          </Pressable>
        )}

        <Text className="text-center text-sm text-muted">
          بإمكانك الاستماع لتلاوتك المسجلة ومقارنتها بالآيات أعلاه
        </Text>
      </ScrollView>

      <View className="border-t border-border p-5">
        <Pressable
          className="w-full rounded-2xl p-4"
          style={{ backgroundColor: primaryColor }}
          onPress={onNext}
        >
          <Text className="text-center text-xl font-bold text-primary-foreground">
            التالي
          </Text>
        </Pressable>
      </View>
    </>
  );
}
