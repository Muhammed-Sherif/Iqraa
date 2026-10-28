import React, { useEffect, useRef } from 'react';
import { Animated, Easing, View } from 'react-native';
import { getStaticColor } from '@/constants/theme';

export interface VoiceEqualizerProps {
  /** Whether the audio recitation is currently playing */
  isPlaying: boolean;
  /** Whether the player is currently in a Sakta pause */
  isSakta?: boolean;
  /** Number of vertical equalizer columns (defaults to 7) */
  barCount?: number;
  /** Maximum bar height in pixels (defaults to 36) */
  maxHeight?: number;
  /** Custom bar color hex string (defaults to theme primary) */
  color?: string;
}

// Preset frequencies / durations to create an organic, realistic voice wave
const WAVE_DURATIONS = [430, 610, 380, 520, 470, 580, 350, 490, 410];
const WAVE_TARGET_SCALES = [0.75, 1.0, 0.65, 0.95, 0.85, 0.9, 0.6, 0.8, 0.7];

/**
 * Animated equalizer visualizer component displaying oscillating voice columns.
 * Animates smoothly when audio is actively playing, and settles at resting height
 * when paused or during Sakta.
 *
 * @param props.isPlaying - Audio playback active state
 * @param props.isSakta - Sakta interval active state
 * @param props.barCount - Number of equalizer columns
 * @param props.maxHeight - Maximum vertical height of bars
 * @param props.color - Custom color for equalizer bars
 */
export function VoiceEqualizer({
  isPlaying,
  isSakta = false,
  barCount = 7,
  maxHeight = 36,
  color,
}: VoiceEqualizerProps) {
  const activeColor = color ?? getStaticColor('primary');
  const barAnimations = useRef<Animated.Value[]>(
    Array.from({ length: barCount }, () => new Animated.Value(0.25)),
  ).current;

  useEffect(() => {
    const runningAnimations: Animated.CompositeAnimation[] = [];

    if (isPlaying && !isSakta) {
      barAnimations.forEach((anim, i) => {
        const duration = WAVE_DURATIONS[i % WAVE_DURATIONS.length];
        const targetScale = WAVE_TARGET_SCALES[i % WAVE_TARGET_SCALES.length];

        const loop = Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: targetScale,
              duration: duration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2,
              duration: duration / 2,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }),
          ]),
        );
        runningAnimations.push(loop);
        loop.start();
      });
    } else {
      // Smoothly settle bars to baseline resting height
      barAnimations.forEach((anim) => {
        const settle = Animated.timing(anim, {
          toValue: 0.2,
          duration: 250,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        });
        runningAnimations.push(settle);
        settle.start();
      });
    }

    return () => {
      runningAnimations.forEach((anim) => anim.stop());
    };
  }, [isPlaying, isSakta, barAnimations, barCount]);

  return (
    <View
      className="flex-row items-center justify-center gap-1.5 py-2"
      style={{ height: maxHeight + 10 }}
    >
      {barAnimations.slice(0, barCount).map((anim, index) => (
        <Animated.View
          key={index}
          style={{
            width: 4,
            height: maxHeight,
            borderRadius: 2,
            backgroundColor: activeColor,
            opacity: isPlaying && !isSakta ? 0.9 : 0.35,
            transform: [{ scaleY: anim }],
          }}
        />
      ))}
    </View>
  );
}

export default VoiceEqualizer;
