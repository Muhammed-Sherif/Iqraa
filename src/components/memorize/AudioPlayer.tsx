import React, { useEffect, useState, useRef } from 'react';
import { View, Pressable, Text } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';
import { formatTime } from '@/core/utils';
import { ListeningSettings } from '@/core/types';
import { useMemorization } from '@/store/memorize';
import { audioService } from '@/services';
import VoiceEqualizer from '@/components/ui/VoiceEqualizer';

/**
 * Removes Arabic diacritics / tashkeel for secondary clean reading text.
 *
 * @param text Arabic text with diacritics
 * @returns Clean text without diacritics
 */
function removeTashkeel(text: string): string {
  return text.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED]/g, '');
}

export interface AudioPlayerProps {
  surahNumber: number;
  steps: number[][];
  setting: ListeningSettings;
  onFinished?: () => void;
}

/**
 * AudioPlayer component updated to match the design specification:
 * - Active Ayah card with calligraphy, verse badge, and clean text
 * - Progress bar and timestamps
 * - 15s rewind / forward and large play/pause button
 * - Sakta countdown & VoiceEqualizer animation
 * - Session info grid (Reciter, repeat count, pause duration)
 * - Pedagogical tip box
 */
export default function AudioPlayer({
  surahNumber,
  steps,
  setting: settings,
  onFinished,
}: AudioPlayerProps) {
  const [audioSources, setAudioSources] = useState<Record<number, string>>({});

  const task = useMemorization((state) => state.task);
  const { currentStep, currentAyaKey, isInSakta, saktaDurationSeconds } =
    useMemorization((state) => state.playerSession);
  const setPlayer = useMemorization((state) => state.setPlayer);
  const handleAyaFinished = useMemorization((state) => state.handleAyaFinished);
  const cancelSakta = useMemorization((state) => state.cancelSakta);

  // Cumulative playback duration for all ayat within the currently playing step
  const stepDurationRef = useRef<number>(0);

  // Current active ayah number
  const currentAyah =
    steps[currentStep]?.[currentAyaKey] ?? steps[0]?.[0] ?? 1;

  // Index of the current ayah within the task
  const currentAyahIndex = task?.ayatNumbers
    ? Math.max(1, task.ayatNumbers.indexOf(currentAyah) + 1)
    : 1;
  const totalAyatCount = task?.ayatNumbers?.length ?? 1;

  // Ayah Quranic text
  const currentAyahObj = task?.quranText?.find((a) => a.num === currentAyah);
  const currentAyahText = currentAyahObj?.text ?? '';
  const cleanAyahText = currentAyahText ? removeTashkeel(currentAyahText) : '';

  // Reset step duration accumulation when sakta starts
  useEffect(() => {
    if (isInSakta) {
      stepDurationRef.current = 0;
    }
  }, [isInSakta]);

  // Resolve playable audio URIs for all ayat in this session
  useEffect(() => {
    let isActive = true;
    async function resolveUris() {
      const uris: Record<number, string> = {};
      const allAyat = Array.from(new Set(steps.flat()));
      for (const ayahNumber of allAyat) {
        uris[ayahNumber] = await audioService.getPlayableUri(
          surahNumber,
          ayahNumber,
        );
      }
      if (isActive) {
        setAudioSources(uris);
      }
    }
    resolveUris();
    return () => {
      isActive = false;
    };
  }, [surahNumber, steps]);

  const firstAyah = steps[0]?.[0] ?? 1;
  const initialSource =
    audioSources[firstAyah] ??
    audioService.getRemoteAudioUrl('ar.alafasy', surahNumber, firstAyah);

  const initialSourceLoadedRef = useRef<boolean>(false);
  const didFinishHandledRef = useRef<boolean>(false);

  const player = useAudioPlayer(initialSource);
  const status = useAudioPlayerStatus(player);

  useEffect(() => {
    setPlayer(player);
  }, [player, setPlayer]);

  // Ensure initial source is replaced once audioSources are resolved (only once on initial load)
  useEffect(() => {
    if (!initialSourceLoadedRef.current && audioSources[firstAyah]) {
      initialSourceLoadedRef.current = true;
      player.replace(audioSources[firstAyah]);
    }
  }, [audioSources, firstAyah, player]);

  // Clean up any active sakta timer on unmount
  useEffect(() => {
    return () => {
      cancelSakta();
    };
  }, [cancelSakta]);

  // Reset finish-handled ref whenever didJustFinish resets to false or player is playing
  useEffect(() => {
    if (!status.didJustFinish || status.playing) {
      didFinishHandledRef.current = false;
    }
  }, [status.didJustFinish, status.playing]);

  // When an aya finishes, handle step transitions and calculate sakta from total step duration
  useEffect(() => {
    if (status.didJustFinish && !didFinishHandledRef.current) {
      didFinishHandledRef.current = true;
      const ayahDuration = status.duration > 0 ? status.duration : 2;
      stepDurationRef.current += ayahDuration;
      const currentStepDuration = stepDurationRef.current;

      handleAyaFinished(
        steps,
        currentStepDuration,
        (nextAyahNumber) => {
          const nextSource =
            audioSources[nextAyahNumber] ??
            audioService.getRemoteAudioUrl(
              'ar.alafasy',
              surahNumber,
              nextAyahNumber,
            );
          player.replace(nextSource);
          player.play();
        },
        onFinished,
      );
    }
  }, [
    status.didJustFinish,
    status.duration,
    steps,
    onFinished,
    handleAyaFinished,
    player,
    audioSources,
    surahNumber,
  ]);

  const handleTogglePlay = () => {
    if (isInSakta) {
      cancelSakta();
      return;
    }

    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) {
        player.seekTo(0);
      }
      player.play();
    }
  };

  const handleRewind15 = () => {
    player.seekTo(Math.max(0, status.currentTime - 15));
  };

  const handleForward15 = () => {
    player.seekTo(Math.min(status.duration, status.currentTime + 15));
  };

  const progress =
    status.duration > 0
      ? Math.min((status.currentTime / status.duration) * 100, 100)
      : 0;

  const primaryColor = getStaticColor('primary');

  return (
    <View className="gap-5 p-4" style={{ direction: 'rtl' }}>
      {/* ══ Current Ayah Card ══════════════════════════════════════════ */}
      <View className="rounded-3xl border border-border bg-surface p-6 shadow-sm">
        {/* Ayah Index Badge */}
        <View className="self-center rounded-full bg-border/40 px-4 py-1 mb-5">
          <Text className="text-xs font-semibold text-muted">
            الآية {currentAyahIndex} من {totalAyatCount}
          </Text>
        </View>

        {/* Uthmani Quranic Text */}
        <Text
          className="text-center text-3xl font-bold leading-relaxed text-foreground"
          style={{ fontFamily: 'serif' }}
        >
          {currentAyahText ? (
            <>
              {currentAyahText}{' '}
              <Text className="text-2xl" style={{ color: primaryColor }}>
                ﴿{currentAyah}﴾
              </Text>
            </>
          ) : (
            'جارٍ تحميل نص الآية...'
          )}
        </Text>

        {/* Clean simplified reading text */}
        {cleanAyahText ? (
          <Text className="mt-3 text-center text-sm leading-6 text-muted">
            ({currentAyah}) {cleanAyahText}
          </Text>
        ) : null}

        {/* Decorative divider */}
        <View className="mt-5 h-px w-2/3 self-center bg-border/60" />
      </View>

      {/* ══ Playback Progress Bar ══════════════════════════════════════ */}
      <View className="gap-1.5 px-2">
        <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full bg-primary"
            style={{ width: `${progress}%` }}
          />
        </View>
        <View className="flex-row justify-between">
          <Text className="text-xs font-medium text-muted">
            {formatTime(status.currentTime)}
          </Text>
          <Text className="text-xs font-medium text-muted">
            {formatTime(status.duration)}
          </Text>
        </View>
      </View>

      {/* ══ Transport Controls (15s Rewind, Play/Pause, 15s Forward) ═══ */}
      <View className="items-center gap-3">
        <View className="flex-row items-center justify-center gap-6">
          {/* Rewind 15s */}
          <Pressable
            onPress={handleRewind15}
            className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
          >
            <View className="items-center justify-center">
              <MaterialIcons name="rotate-left" size={32} color={primaryColor} />
              <Text className="absolute text-[9px] font-black text-primary">
                15
              </Text>
            </View>
          </Pressable>

          {/* Big Play / Pause Button */}
          <Pressable
            className="h-20 w-20 items-center justify-center rounded-full shadow-lg active:opacity-85"
            style={{ backgroundColor: primaryColor }}
            onPress={handleTogglePlay}
          >
            {status.playing ? (
              <MaterialIcons name="pause" size={44} color="#ffffff" />
            ) : isInSakta ? (
              <MaterialIcons name="hourglass-top" size={38} color="#ffffff" />
            ) : (
              <MaterialIcons name="play-arrow" size={44} color="#ffffff" />
            )}
          </Pressable>

          {/* Forward 15s */}
          <Pressable
            onPress={handleForward15}
            className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
          >
            <View className="items-center justify-center">
              <MaterialIcons name="rotate-right" size={32} color={primaryColor} />
              <Text className="absolute text-[9px] font-black text-primary">
                15
              </Text>
            </View>
          </Pressable>
        </View>

        {/* Voice Equalizer animation when actively reciting */}
        {status.playing && !isInSakta && (
          <VoiceEqualizer
            isPlaying={true}
            barCount={9}
            maxHeight={26}
            color={primaryColor}
          />
        )}

        {/* Sakta Countdown Indicator */}
        {isInSakta && (
          <View className="flex-row items-center justify-center gap-2 rounded-xl bg-primary-soft/50 px-4 py-2">
            <MaterialIcons
              name="hourglass-empty"
              size={16}
              color={primaryColor}
            />
            <Text className="text-xs font-semibold text-primary">
              سكتة للترديد: متبقٍ {saktaDurationSeconds}{' '}
              {saktaDurationSeconds === 1 ? 'ثانية' : 'ثوانٍ'}...
            </Text>
          </View>
        )}
      </View>

      {/* ══ Session Info (3 Columns Grid) ═══════════════════════════════ */}
      <View className="flex-row gap-2.5">
        {/* Card 1: مدة الإيقاف */}
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
          <MaterialIcons name="timer" size={20} color={primaryColor} />
          <Text className="mt-1 text-xs text-muted">مدة الإيقاف</Text>
          <Text className="mt-0.5 text-xs font-bold text-foreground">
            {isInSakta ? `${saktaDurationSeconds} ثواني` : 'تلقائي'}
          </Text>
        </View>

        {/* Card 2: عدد التكرارات */}
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
          <MaterialIcons name="replay" size={20} color={primaryColor} />
          <Text className="mt-1 text-xs text-muted">عدد التكرارات</Text>
          <Text className="mt-0.5 text-xs font-bold text-foreground">
            {settings?.repeatCount ?? 5} مرات
          </Text>
        </View>

        {/* Card 3: القارئ */}
        <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-3">
          <MaterialIcons name="mic" size={20} color={primaryColor} />
          <Text className="mt-1 text-xs text-muted">القارئ</Text>
          <Text className="mt-0.5 text-xs font-bold text-foreground">
            مشاري العفاسي
          </Text>
        </View>
      </View>

      {/* ══ Tip Card (نصيحة) ═══════════════════════════════════════════ */}
      <View className="flex-row items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft/25 p-4">
        <View className="flex-1 gap-1">
          <View className="flex-row items-center gap-1.5">
            <MaterialIcons
              name="lightbulb-outline"
              size={18}
              color={primaryColor}
            />
            <Text className="text-sm font-bold text-primary">نصيحة</Text>
          </View>
          <Text className="text-xs leading-5 text-muted">
            حاول ترديد الآيات بصوتك بعد انتهاء القارئ، ثم انتقل إلى المرحلة
            التالية.
          </Text>
        </View>

        <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
          <MaterialIcons name="headphones" size={26} color={primaryColor} />
        </View>
      </View>
    </View>
  );
}
