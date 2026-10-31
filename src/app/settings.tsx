import {
  View,
  Text,
  Pressable,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { BottomTabInset, getStaticColor } from '@/constants/theme';
import { useSettings } from '@/hooks';
import { AppSettings, DEFAULT_APP_SETTINGS } from '@/services';
import { useState } from 'react';
import Constants from 'expo-constants';
import { DownloadAudioModal } from '@/components/download/DownloadAudioModal';
import { OnboardingModal } from '@/components/onboarding/OnboardingModal';

// ── Sub-components ─────────────────────────────────────────────────────────────

/**
 * Renders a section header label aligned for Arabic RTL.
 *
 * @param {object} props - Component props.
 * @param {string} props.label - Section title text.
 * @returns {JSX.Element} The rendered section header.
 */
function SectionHeader({ label }: { label: string }) {
  return (
    <Text className="mb-2 mt-6 px-1 text-right text-base font-semibold text-muted">
      {label}
    </Text>
  );
}

/**
 * Renders an interactive settings row item with icon and trailing action.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.icon - Leading icon component.
 * @param {string} props.label - Main setting label.
 * @param {string} [props.sublabel] - Optional secondary descriptive text.
 * @param {React.ReactNode} [props.right] - Trailing control or accessory.
 * @param {() => void} [props.onPress] - Press handler.
 * @param {boolean} [props.danger] - Whether this row performs a destructive action.
 * @returns {JSX.Element} The rendered setting row.
 */
function SettingRow({
  icon,
  label,
  sublabel,
  right,
  onPress,
  danger,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      className="flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4 active:opacity-70"
      style={{ direction: 'rtl' }}
    >
      <View className="flex-row items-center gap-3">
        <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-tint">
          {icon}
        </View>
        <View>
          <Text
            className={`text-base font-medium ${danger ? 'text-danger' : 'text-foreground'}`}
          >
            {label}
          </Text>
          {sublabel ? (
            <Text className="text-sm text-muted">{sublabel}</Text>
          ) : null}
        </View>
      </View>
      {right}
    </Pressable>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────────

export default function Settings() {
  const { colorScheme, toggleColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const primaryColor = getStaticColor('primary');
  const mutedColor = getStaticColor('muted');
  const dangerColor = getStaticColor('danger');

  const { loading, saving, saveSettings } = useSettings();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  // Persist a partial update
  async function save(partial: Partial<AppSettings>) {
    try {
      await saveSettings(partial);
    } catch {
      Alert.alert('خطأ', 'تعذّر حفظ الإعدادات');
    }
  }

  const appVersion = Constants.expoConfig?.version ;

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-background">
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      {/* ── Header ── */}
      <View
        className="flex-row items-center justify-between border-b border-border px-5 py-4"
        style={{ direction: 'rtl' }}
      >
        <Text className="text-2xl font-bold text-foreground">
          الإعدادات
        </Text>
        {saving && (
          <ActivityIndicator size="small" color={getStaticColor('primary')} />
        )}
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 8,
          paddingBottom: BottomTabInset,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* ══ APPEARANCE ══════════════════════════════════════════════════════ */}
        <SectionHeader label="المظهر" />

        <SettingRow
          icon={
            <MaterialIcons
              name={isDark ? 'dark-mode' : 'light-mode'}
              size={22}
              color={primaryColor}
            />
          }
          label={isDark ? 'الوضع الداكن' : 'الوضع الفاتح'}
          sublabel="اضغط للتبديل"
          right={
            <Switch
              value={isDark}
              onValueChange={toggleColorScheme}
              trackColor={{
                false: mutedColor + '44',
                true: primaryColor + '88',
              }}
              thumbColor={isDark ? primaryColor : '#f4f3f4'}
            />
          }
        />

        {/* ══ LISTENING SETTINGS ══════════════════════════════════════════════ */}
        <SectionHeader label="إعدادات الاستماع" />

        <View className="gap-3">        
        </View>
        <View className="mt-3">
          <SettingRow
            icon={
              <MaterialIcons
                name="cloud-download"
                size={22}
                color={primaryColor}
              />
            }
            label="تنزيل التلاوات الصوتية"
            sublabel="تحميل تلاوة المصحف للاستماع بدون إنترنت"
            onPress={() => setDownloadModalOpen(true)}
            right={
              <MaterialIcons
                name="arrow-back-ios"
                size={16}
                color={mutedColor}
              />
            }
          />
        </View>

        {/* ══ PLAN & LEVEL SETUP ══════════════════════════════════════════════ */}
        <SectionHeader label="خطة ومستوى الحفظ" />

        <SettingRow
          icon={
            <MaterialIcons
              name="tune"
              size={22}
              color={primaryColor}
            />
          }
          label="إعداد خطة الحفظ والمستوى"
          sublabel="تعديل الهدف اليومي، المستوى، واتجاه الحفظ"
          onPress={() => setOnboardingOpen(true)}
          right={
            <MaterialIcons
              name="arrow-back-ios"
              size={16}
              color={mutedColor}
            />
          }
        />

        {/* ══ APP INFO ════════════════════════════════════════════════════════ */}
        <SectionHeader label="حول التطبيق" />

        <View className="gap-3">
          <SettingRow
            icon={
              <MaterialIcons
                name="info-outline"
                size={22}
                color={primaryColor}
              />
            }
            label="إصدار التطبيق"
            sublabel={`v${appVersion}`}
          />
        </View>

        {/* ══ DANGER ZONE ═════════════════════════════════════════════════════ */}
        <SectionHeader label="منطقة الخطر" />

        <SettingRow
          icon={<MaterialIcons name="restore" size={22} color={dangerColor} />}
          label="إعادة ضبط الإعدادات"
          sublabel="إرجاع كل الإعدادات للافتراضي"
          danger
          onPress={() =>
            Alert.alert(
              'إعادة الضبط',
              'هل أنت متأكد من إعادة جميع الإعدادات للقيم الافتراضية؟',
              [
                { text: 'إلغاء', style: 'cancel' },
                {
                  text: 'إعادة الضبط',
                  style: 'destructive',
                  onPress: () => save(DEFAULT_APP_SETTINGS),
                },
              ],
            )
          }
        />
      </ScrollView>

      <DownloadAudioModal
        visible={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
      />

      <OnboardingModal
        visible={onboardingOpen}
        onCompleted={() => setOnboardingOpen(false)}
        onClose={() => setOnboardingOpen(false)}
      />
    </SafeAreaView>
  );
}
