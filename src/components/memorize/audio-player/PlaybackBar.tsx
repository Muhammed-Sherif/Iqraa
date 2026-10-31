import React from 'react';
import { View, Text } from 'react-native';
import { formatTime } from '@/core/utils';

export interface PlaybackBarProps {
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration in seconds */
  duration: number;
}

/**
 * Renders the audio progress bar and elapsed / remaining timestamps.
 */
export default function PlaybackBar({ currentTime, duration }: PlaybackBarProps) {
  const progress =
    duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <View className="gap-1.5 px-2">
      {/* Track */}
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-border">
        <View
          className="h-full rounded-full bg-primary"
          style={{ width: `${progress}%` }}
        />
      </View>

      {/* Timestamps */}
      <View className="flex-row justify-between">
        <Text className="text-xs font-medium text-muted">
          {formatTime(currentTime)}
        </Text>
        <Text className="text-xs font-medium text-muted">
          {formatTime(duration)}
        </Text>
      </View>
    </View>
  );
}

