import React from 'react';
import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';
import { useMemorization } from '@/store/memorize';
import VoiceEqualizer from '@/components/ui/VoiceEqualizer';

export interface TransportControlsProps {
  /** Whether audio is currently playing (from expo-audio status) */
  isPlaying: boolean;
  /** Called when the play / pause button is pressed */
  onTogglePlay: () => void;
  /** Called when the −15 s rewind button is pressed */
  onRewind: () => void;
  /** Called when the +15 s forward button is pressed */
  onForward: () => void;
}

/**
 * Playback transport controls:
 * - −15 s rewind, large Play/Pause/Sakta-timer button, +15 s forward
 * - Animated VoiceEqualizer shown while playing (not in sakta)
 * - Tappable Sakta countdown indicator shown during pause
 *
 * Reads isInSakta, saktaDurationSeconds and skipSakta from the store.
 * Only receives playback-status props that come from the expo-audio instance.
 */
export default function TransportControls({
  isPlaying,
  onTogglePlay,
  onRewind,
  onForward,
}: TransportControlsProps) {
  const primaryColor = getStaticColor('primary');

  const { isInSakta, saktaDurationSeconds } = useMemorization(
    (state) => state.playerSession,
  );
  const skipSakta = useMemorization((state) => state.skipSakta);

  return (
    <View className="items-center gap-3">
      <View className="flex-row items-center justify-center gap-6">
        {/* Rewind 15 s */}
        <Pressable
          onPress={onRewind}
          className="h-12 w-12 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
        >
          <View className="items-center justify-center">
            <MaterialIcons name="rotate-left" size={32} color={primaryColor} />
            <Text className="absolute text-[9px] font-black text-primary">
              15
            </Text>
          </View>
        </Pressable>

        {/* Play / Pause / Sakta-timer */}
        <Pressable
          className="h-20 w-20 items-center justify-center rounded-full shadow-lg active:opacity-85"
          style={{ backgroundColor: primaryColor }}
          onPress={onTogglePlay}
        >
          {isPlaying ? (
            <MaterialIcons name="pause" size={44} color="#ffffff" />
          ) : isInSakta ? (
            <MaterialIcons name="timer" size={38} color="#ffffff" />
          ) : (
            <MaterialIcons name="play-arrow" size={44} color="#ffffff" />
          )}
        </Pressable>

        {/* Forward 15 s */}
        <Pressable
          onPress={onForward}
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

      {/* Voice equalizer animation while actively playing */}
      {isPlaying && !isInSakta && (
        <VoiceEqualizer
          isPlaying={true}
          barCount={9}
          maxHeight={26}
          color={primaryColor}
        />
      )}

      {/* Sakta countdown — tap to skip the pause */}
      {isInSakta && (
        <Pressable
          onPress={skipSakta}
          className="flex-row items-center justify-center gap-2 rounded-xl bg-primary-soft/50 px-4 py-2 active:opacity-70"
        >
          <MaterialIcons
            name="hourglass-empty"
            size={16}
            color={primaryColor}
          />
          <Text className="text-xs font-semibold text-primary">
            سكتة للترديد: متبقٍ {saktaDurationSeconds}{' '}
            {saktaDurationSeconds === 1 ? 'ثانية' : 'ثوانٍ'}...
          </Text>
        </Pressable>
      )}
    </View>
  );
}
