import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useDueSummary } from '@/hooks';
import { RevisionOverviewCard } from './RevisionOverviewCard';
import { WeakAyatSection } from './WeakAyatSection';
import { BottomTabInset, getStaticColor } from '@/constants/theme';

export interface RevisionDashboardProps {
  /** Callback fired when the user chooses to start an active revision session */
  onStartSession: () => void;
}

/**
 * RevisionDashboard Component.
 * Displays the main revision overview: daily summary metrics, session initiation button,
 * and list of weak Ayat requiring reinforcement.
 *
 * @param {RevisionDashboardProps} props Component properties
 * @returns {JSX.Element} Rendered revision dashboard
 */
export function RevisionDashboard({
  onStartSession,
}: RevisionDashboardProps) {
  const primaryColor = getStaticColor('primary');
  const {
    summary,
    loading: loadingSummary,
    error: summaryError,
    refresh: refreshSummary,
  } = useDueSummary();
  console.log(summary)
  if (loadingSummary && !summary) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={primaryColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* Top Header */}
      <View
        className="flex-row items-center justify-between border-b border-border px-5 py-4"
        style={{ direction: 'rtl' }}
      >
        <Text className="text-xl font-bold text-foreground">
          المراجعة اليومية
        </Text>
        <Pressable onPress={() => refreshSummary()} className="p-1">
          <MaterialIcons name="refresh" size={22} color={primaryColor} />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: BottomTabInset,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Error notification if any */}
        {summaryError && (
          <View className="mb-4 rounded-xl bg-rose-100 p-3 dark:bg-rose-950/40">
            <Text className="text-center text-xs text-rose-700 dark:text-rose-300">
              {summaryError.message}
            </Text>
          </View>
        )}

        {/* Today's Overview Card */}
        <RevisionOverviewCard
          summary={summary}
          onStartSession={onStartSession}
        />

        {/* Weak Ayat Section */}
        <WeakAyatSection fallbackTaskId={summary?.tasks?.[0]?.id} />
      </ScrollView>
    </SafeAreaView>
  );
}
