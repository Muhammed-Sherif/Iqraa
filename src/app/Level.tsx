import { getStaticColor } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Level selection UI component.
 *
 * @param {object} props - Component props.
 * @param {string | null} [props.currentLevel] - The currently selected level ID.
 * @param {(levelId: string) => void} props.onNext - Callback when next is pressed.
 * @returns {JSX.Element} The rendered level selector.
 */
export function LevelScreen({
  currentLevel,
  onNext,
}: {
  currentLevel?: string | null;
  onNext: (levelId: string) => void;
}) {
  const [selectedLevel, setSelectedLevel] = useState(
    currentLevel ?? 'beginner',
  );
  const primaryColor = getStaticColor('primary');
  const levels = [
    {
      id: 'beginner',
      label: 'مبتدئ',
      sub: '1 آية يومياً',
      daily: '1 آية',
      weekly: '7 آيات',
      icon: '🌱',
    },
    {
      id: 'medium',
      label: 'متوسط',
      sub: '3 آيات يومياً',
      daily: '3 آيات',
      weekly: '21 آية',
      icon: '📖',
    },
    {
      id: 'advanced',
      label: 'متقدم',
      sub: '5 آيات يومياً',
      daily: '5 آيات',
      weekly: '35 آية',
      icon: '🛡️',
    },
    {
      id: 'pro',
      label: 'محترف',
      sub: '10 آيات يومياً',
      daily: '10 آيات',
      weekly: '70 آية',
      icon: '⚡',
    },
  ];
  return (
    <SafeAreaView className="flex-1 bg-background" style={{ direction: 'rtl' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 20 }}
      >
        <View className="items-center py-4">
          <Text className="text-3xl font-bold text-foreground">
            تحديد المستوى
          </Text>
          <Text className="mt-1 text-lg text-muted">اختر مستواك في الحفظ</Text>
        </View>
        <View className="gap-3">
          {levels.map((level) => {
            const isSelected = selectedLevel === level.id;
            return (
              <Pressable
                key={level.id}
                onPress={() => setSelectedLevel(level.id)}
                className={`flex-row items-center justify-between rounded-2xl border p-5 ${
                  isSelected
                    ? 'border-primary bg-primary-soft'
                    : 'border-border bg-surface'
                }`}
              >
                <View className="flex-row items-center gap-4">
                  <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-tint">
                    <Text className="text-2xl">{level.icon}</Text>
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-foreground">
                      {level.label}
                    </Text>
                    <Text className="text-base text-muted">{level.sub}</Text>
                  </View>
                </View>
                <View
                  className={`h-6 w-6 items-center justify-center rounded-full border-2 ${
                    isSelected ? 'border-primary bg-primary' : 'border-border'
                  }`}
                >
                  {isSelected && (
                    <MaterialIcons name="check" size={14} color="#ffffff" />
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View className="border-t border-border p-5">
        <Pressable
          className="w-full rounded-2xl p-4"
          style={{ backgroundColor: primaryColor }}
          onPress={() => onNext(selectedLevel)}
        >
          <Text className="text-center text-2xl font-bold text-primary-foreground">
            التالي
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/**
 * Route page for level selection in Expo Router.
 *
 * @returns {JSX.Element} The level route page.
 */
export default function LevelScreenRoute() {
  const router = useRouter();
  return (
    <LevelScreen
      onNext={(levelId) => {
        router.push({ pathname: '/Plan', params: { userLevel: levelId } });
      }}
    />
  );
}
