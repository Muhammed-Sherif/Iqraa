import { useEffect, useState } from 'react';
import { getStaticColor } from '@/constants/theme';
import { createListeningSession } from '@/core/memorization/sessionEngine';
import { ListeningSettings } from '@/core/types';
import { memorizationService, settingsService } from '@/services';
import { useSession } from '@/hooks/useSession';
import { useMemorization } from '@/store/memorize';
import { ActivityIndicator, View } from 'react-native';
import { CompareStep } from './steps/CompareStep';
import { EvaluateStep } from './steps/EvaluateStep';
import { ListenSessionStep } from './steps/ListenSessionStep';
import { TasmeeSessionStep } from './steps/TasmeeSessionStep';

export const Steps = () => {
  const task = useMemorization((state) => state.task);
  const [settings, setSettings] = useState<ListeningSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadSettings() {
      try {
        const fetchedSettings = await settingsService.getListeningSettings();
        if (isMounted) {
          setSettings(fetchedSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!task) {
    return null; // Or render an empty-state component
  }

  if (loading || !settings) {
    const primaryColor = getStaticColor('primary');
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  const initialSession = createListeningSession(task, settings);
  return <SessionSteps initialSession={initialSession} settings={settings} />;
};

function SessionSteps({
  initialSession,
  settings,
}: {
  initialSession: NonNullable<ReturnType<typeof createListeningSession>>;
  settings: ListeningSettings;
}) {
  const { state: sessionState } = useSession(initialSession);

  const task = useMemorization((state) => state.task);
  const setSession = useMemorization((state) => state.setSession);
  const setSettings = useMemorization((state) => state.setSettings);
  const currentScreen = useMemorization((state) => state.currentScreen);
  const setScreen = useMemorization((state) => state.setScreen);
  const goPrev = useMemorization((state) => state.goPrev);
  const finishTask = useMemorization((state) => state.finishTask);
  const primaryColor = getStaticColor('primary');

  useEffect(() => {
    setSession(sessionState);
    setSettings(settings);
  }, [sessionState, setSession, setSettings, settings]);

  const handleEvaluateConfirm = async (rate: 'good' | 'bad') => {
    if (task) {
      const srsRate = rate === 'good' ? 'good' : 'hard';
      await memorizationService.recordTasmeeResult(task, srsRate);
    }
    finishTask();
  };

  switch (currentScreen) {
    case 'listen': {
      const listeningSession =
        sessionState.type === 'listening' ? sessionState : initialSession;
      return <ListenSessionStep session={listeningSession} />;
    }

    case 'recall':
      return <TasmeeSessionStep />;

    case 'compare':
      return (
        <CompareStep
          primaryColor={primaryColor}
          onNext={() => setScreen('evaluate')}
        />
      );

    case 'evaluate':
      return (
        <EvaluateStep
          primaryColor={primaryColor}
          onBack={goPrev}
          onConfirm={handleEvaluateConfirm}
        />
      );

    default:
      return null;
  }
}
