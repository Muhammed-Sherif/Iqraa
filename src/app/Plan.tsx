import { getStaticColor } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Plan summary UI component.
 *
 * @param {object} props - Component props.
 * @param {string | null} [props.userLevel] - The user's chosen level ID.
 * @param {() => void} props.onNext - Callback when "Start Now" is pressed.
 * @param {() => void} props.onBack - Callback when back navigation is pressed.
 * @returns {JSX.Element} The rendered plan screen.
 */
export function PlanScreen({
  userLevel,
  onNext,
  onBack,
}: {
  userLevel?: string | null;
  onNext: () => void;
  onBack: () => void;
}) {
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
  const upcomingPlans = [
    { surah: 'سورة الفاتحة', ayah: 'آية 1' },
    { surah: 'سورة البقرة', ayah: 'آية 1' },
    { surah: 'سورة آل عمران', ayah: 'آية 1' },
  ];

  const primaryColor = getStaticColor('primary');
  const planInfo = levels.find((l) => l.id === userLevel) ?? levels[0];

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ direction: 'rtl' }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, gap: 16 }}
      >
        <View className="items-center gap-1 py-4">
          <View className="mb-2 h-10 w-10 items-center justify-center rounded-xl bg-primary-soft">
            <MaterialIcons
              name="calendar-today"
              size={22}
              color={primaryColor}
            />
          </View>
          <Text className="text-3xl font-bold text-foreground">
            الخطة اليومية
          </Text>
          <Text className="text-lg text-muted">
            أهدافك لهذا الأسبوع • مستوى {planInfo.label}
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 items-center rounded-2xl border border-border bg-surface p-4">
            <Text className="mb-1 text-base text-muted">الهدف اليومي</Text>
            <Text className="text-4xl font-bold text-foreground">
              {planInfo.daily}
            </Text>
          </View>
          <View className="flex-1 items-center rounded-2xl border border-border bg-primary-soft p-4">
            <Text className="mb-1 text-base text-muted">الهدف الأسبوعي</Text>
            <Text className="text-4xl font-bold text-foreground">
              {planInfo.weekly}
            </Text>
          </View>
        </View>

        <View className="gap-3">
          <Text className="text-xl font-bold text-foreground">
            خططك القادمة
          </Text>
          {upcomingPlans.map((plan, index) => (
            <Pressable
              key={index}
              onPress={onNext}
              className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-5 active:opacity-70"
            >
              <View>
                <Text className="text-xl font-bold text-foreground">
                  {plan.surah}
                </Text>
                <Text className="text-base text-muted">{plan.ayah}</Text>
              </View>
              <View className="h-6 w-6 rounded-full border-2 border-border" />
            </Pressable>
          ))}
        </View>
      </ScrollView>

      <View className="flex-row gap-3 border-t border-border p-5">
        <Pressable
          className="rounded-2xl border border-border bg-surface px-6 py-4"
          onPress={onBack}
        >
          <MaterialIcons
            name="arrow-forward-ios"
            size={20}
            color={primaryColor}
          />
        </Pressable>
        <Pressable
          className="flex-1 rounded-2xl p-4"
          style={{ backgroundColor: primaryColor }}
          onPress={onNext}
        >
          <Text className="text-center text-2xl font-bold text-primary-foreground">
            ابدأ الآن
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

/**
 * Route page for plan view in Expo Router.
 *
 * @returns {JSX.Element} The plan route page.
 */
export default function PlanScreenRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ userLevel?: string }>();

  return (
    <PlanScreen
      userLevel={params.userLevel}
      onNext={() => {
        router.push('/');
      }}
      onBack={() => {
        router.back();
      }}
    />
  );
}
