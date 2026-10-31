import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { ListeningSettings } from '@/core/types';
import { useMemorization } from '@/store/memorize';
import { audioService } from '@/services';
import AyahCard from './audio-player/AyahCard';
import PlaybackBar from './audio-player/PlaybackBar';
import TransportControls from './audio-player/TransportControls';
import SessionInfoGrid from './audio-player/SessionInfoGrid';
import TipCard from './audio-player/TipCard';

export interface AudioPlayerProps {
  surahNumber: number;
  steps: number[][];
  setting: ListeningSettings;
  onFinished?: () => void;
}

/**
 * Orchestrator component for the listening session.
 * Owns only what requires the expo-audio player instance:
 *   - URI resolution and player setup
 *   - Ayah-finished / sakta transition effects
 *   - Play/Pause/Seek handlers
 *
 * Sub-components read their own store slices directly — no prop drilling.
 */
export default function AudioPlayer({
  surahNumber,
  steps,
  setting: settings,
  onFinished,
}: AudioPlayerProps) {
  const [audioSources, setAudioSources] = useState<Record<number, string>>({});

  const { currentStep, currentAyaKey, isInSakta } = useMemorization(
    (state) => state.playerSession,
  );
  const setPlayer = useMemorization((state) => state.setPlayer);
  const handleAyaFinished = useMemorization((state) => state.handleAyaFinished);
  const cancelSakta = useMemorization((state) => state.cancelSakta);

  // Refs to guard against double-firing effects
  const stepDurationRef = useRef<number>(0);
  const initialSourceLoadedRef = useRef<boolean>(false);
  const didFinishHandledRef = useRef<boolean>(false);

  // ── Derived values ────────────────────────────────────────────────────────
  const currentAyah =
    steps[currentStep]?.[currentAyaKey] ?? steps[0]?.[0] ?? 1;
  const firstAyah = steps[0]?.[0] ?? 1;
  const initialSource =
    audioSources[firstAyah] ??
    audioService.getRemoteAudioUrl('ar.alafasy', surahNumber, firstAyah);

  // ── Audio player ──────────────────────────────────────────────────────────
  const player = useAudioPlayer(initialSource);
  const status = useAudioPlayerStatus(player);

  // ── Effects ───────────────────────────────────────────────────────────────

  /** Register player instance in global store */
  useEffect(() => {
    setPlayer(player);
  }, [player, setPlayer]);

  /** Resolve playable URIs for every ayah in this session */
  useEffect(() => {
    let isActive = true;
    async function resolveUris() {
      const uris: Record<number, string> = {};
      for (const ayahNumber of Array.from(new Set(steps.flat()))) {
        uris[ayahNumber] = await audioService.getPlayableUri(
          surahNumber,
          ayahNumber,
        );
      }
      if (isActive) setAudioSources(uris);
    }
    resolveUris();
    return () => {
      isActive = false;
    };
  }, [surahNumber, steps]);

  /** Replace placeholder source once real URI is resolved (once only) */
  useEffect(() => {
    if (!initialSourceLoadedRef.current && audioSources[firstAyah]) {
      initialSourceLoadedRef.current = true;
      player.replace(audioSources[firstAyah]);
    }
  }, [audioSources, firstAyah, player]);

  /** Reset step-duration accumulator when a sakta begins */
  useEffect(() => {
    if (isInSakta) stepDurationRef.current = 0;
  }, [isInSakta]);

  /** Clean up active sakta timer on unmount */
  useEffect(() => {
    return () => {
      cancelSakta();
    };
  }, [cancelSakta]);

  /** Reset finish-handled guard when player re-starts */
  useEffect(() => {
    if (!status.didJustFinish || status.playing) {
      didFinishHandledRef.current = false;
    }
  }, [status.didJustFinish, status.playing]);

  /** Handle ayah completion → step transition or sakta countdown */
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

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleTogglePlay = () => {
    if (isInSakta) {
      cancelSakta();
      return;
    }
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish) player.seekTo(0);
      player.play();
    }
  };

  const handleRewind = () =>
    player.seekTo(Math.max(0, status.currentTime - 15));

  const handleForward = () =>
    player.seekTo(Math.min(status.duration, status.currentTime + 15));

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <View className="gap-5 p-4" style={{ direction: 'rtl' }}>
      <AyahCard currentAyah={currentAyah} />

      <PlaybackBar
        currentTime={status.currentTime}
        duration={status.duration}
      />

      <TransportControls
        isPlaying={status.playing}
        onTogglePlay={handleTogglePlay}
        onRewind={handleRewind}
        onForward={handleForward}
      />

      <SessionInfoGrid />

      <TipCard />
    </View>
  );
}
