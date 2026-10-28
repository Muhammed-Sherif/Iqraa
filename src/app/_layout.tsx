import * as SplashScreen from 'expo-splash-screen';

import 'global.css';
import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { Theme } from '@/components/theme';
import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import migrations from '../../drizzle/migrations';
import { ActivityIndicator, Text, View } from 'react-native';
import { db } from '../db/client';
import { useQuranSeed } from '../hooks/useQuranSeed';

SplashScreen.preventAutoHideAsync();

function SeededApp() {
  const { status, error: seedError } = useQuranSeed();

  if (seedError) {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <Text className="text-center text-base text-danger">
          خطأ في تحميل بيانات القرآن: {seedError.message}
        </Text>
      </View>
    );
  }

  if (status === 'seeding') {
    return (
      <View className="flex-1 items-center justify-center bg-background p-6">
        <ActivityIndicator size="large" color="#0B302B" />
        <Text className="mt-4 text-center text-base font-medium text-foreground">
          جارٍ تحميل بيانات القرآن الكريم لأول مرة…
        </Text>
      </View>
    );
  }

  return (
    <Theme name="brand">
      <AnimatedSplashOverlay />
      <AppTabs />
    </Theme>
  );
}

export default function TabLayout() {
  const { success, error } = useMigrations(db, migrations);

  if (error) {
    return (
      <View>
        <Text>Migration error: {error.message}</Text>
      </View>
    );
  }

  if (!success) {
    return (
      <View>
        <Text>Migration is in progress...</Text>
      </View>
    );
  }

  return <SeededApp />;
}
