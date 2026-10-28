import { useState, useEffect } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useMemorization } from '@/store/memorize';
import { useProgress } from '@/hooks/useProgress';
import { LEVEL_LABELS } from '@/constants/levels';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';
import {
  HomeHeader,
  TodayGoalCard,
  QuickActionCards,
  WeeklySummaryCard,
  VerseOfTheDayCard,
  QuickInfoSection,
} from '@/components/home';
import { BottomTabInset } from '@/constants/theme';

export default function HomeScreen() {
  const router = useRouter();
  const setScreen = useMemorization((s) => s.setScreen);
  const { progress, loading, refresh } = useProgress();
  const [showOnboarding, setShowOnboarding] = useState(false);

  const onNavigateToMemorize = () => {
    setScreen('listen');
    router.push('/memorize');
  };

  const onNavigateToTasmee = () => {
    setScreen('recall');
    router.push('/memorize');
  };

  const onNavigateToRevision = () => {
    router.push('/revision');
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-background items-center justify-center" edges={['top']}>
        <ActivityIndicator size="large" color="#10b981" />
      </SafeAreaView>
    );
  }

  const dailyGoalAyat = progress?.numberOfNewAyat ?? 1;
  const levelName = progress ? LEVEL_LABELS[progress.level] : 'سهل';

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Greeting & Mosque Skyline */}
        <HomeHeader userName="محمد" />

        <View className="px-5 gap-4 relative bottom-[12%]">
          {/* Today's Goal Card */}
          <TodayGoalCard
            dailyGoalAyat={dailyGoalAyat}
            currentDay={12}
            totalDays={30}
          />

          {/* 3 Main Action Cards */}
          <QuickActionCards
            onNavigateToMemorize={onNavigateToMemorize}
            onNavigateToRevision={onNavigateToRevision}
            onNavigateToTasmee={onNavigateToTasmee}
          />

          {/* Weekly Summary */}
          <WeeklySummaryCard
            savedAyatCount={10}
            revisionsCount={3}
            listeningHours={2}
            commitmentRate={92}
          />

          {/* Ayah of the Day Quote Banner */}
          <VerseOfTheDayCard
            verse="إِنَّ مَعَ الْعُسْرِ يُسْرًا"
            surahName="الشرح"
            ayahNumber={6}
          />

          {/* Quick Info Grid */}
          <QuickInfoSection
            levelName={levelName}
            nextRevisionText="بعد 2 يوم"
            hardestAyahText="(البقرة: 216)"
            streakDays={7}
          />
        </View>
      </ScrollView>

      <OnboardingModal
        visible={(!loading && !progress) || showOnboarding}
        onCompleted={async () => {
          setShowOnboarding(false);
          await refresh();
        }}
      />
    </SafeAreaView>
  );
}
