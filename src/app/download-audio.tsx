import React, { useState, useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { getStaticColor } from '@/constants/theme';
import { audioService, DownloadProgress, SUPPORTED_RECITERS } from '@/services';
import { useProgress } from '@/hooks/useProgress';

export default function DownloadAudioScreen() {
  const router = useRouter();
  const primaryColor = getStaticColor('primary');
  const { progress } = useProgress();

  const [reciterId, setReciterId] = useState<string>('ar.alafasy');
  const [downloadMode, setDownloadMode] = useState<
    'currentSurah' | 'fullQuran'
  >('currentSurah');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [progressState, setProgressState] = useState<DownloadProgress | null>(
    null,
  );

  const isCancelledRef = useRef<boolean>(false);

  const currentSurah = progress?.currentSurah ?? 1;
  const currentReciter =
    SUPPORTED_RECITERS[reciterId] ?? SUPPORTED_RECITERS['ar.alafasy'];

  // Check if current surah or full Quran is already downloaded
  useEffect(() => {
    let isActive = true;
    audioService
      .checkDownloadStatus(
        reciterId,
        downloadMode === 'currentSurah' ? currentSurah : undefined,
      )
      .then((status) => {
        if (isActive) {
          setIsCompleted(status);
        }
      });
    return () => {
      isActive = false;
    };
  }, [reciterId, downloadMode, currentSurah]);

  const handleStartDownload = async () => {
    setIsDownloading(true);
    setIsCompleted(false);
    isCancelledRef.current = false;

    try {
      if (downloadMode === 'currentSurah') {
        await audioService.downloadSurah(
          currentSurah,
          reciterId,
          (prog) => setProgressState(prog),
          () => isCancelledRef.current,
        );
      } else {
        await audioService.downloadCompleteQuran(
          reciterId,
          (prog) => setProgressState(prog),
          () => isCancelledRef.current,
        );
      }

      if (!isCancelledRef.current) {
        setIsCompleted(true);
        Alert.alert('نجاح', 'تم اكتمال تنزيل الملفات الصوتية بنجاح!');
      }
    } catch (error) {
      console.error('[DownloadAudio] Download error:', error);
      Alert.alert(
        'خطأ',
        'حدث خطأ أثناء تنزيل الملفات الصوتية. يرجى التحقق من اتصال الإنترنت.',
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCancelDownload = () => {
    isCancelledRef.current = true;
    setIsDownloading(false);
  };

  const features = [
    {
      icon: 'wifi-off',
      title: 'استماع بدون إنترنت',
      desc: 'استمع إلى الآيات وكررها في أي وقت بدون استهلاك باقة البيانات.',
    },
    {
      icon: 'high-quality',
      title: 'جودة صوتية عالية',
      desc: 'تلاوة واضحة ونقية برواية حفص عن عاصم (128 kbps).',
    },
    {
      icon: 'repeat',
      title: 'تكرار سلس ومثالي',
      desc: 'انتقال فوري بين الآيات مع مدة الوقف المحددة بدون تأخير.',
    },
  ];

  const percent = progressState?.percent ?? (isCompleted ? 100 : 0);

  return (
    <SafeAreaView className="flex-1 bg-background" style={{ direction: 'rtl' }}>
      {/* Header */}
      <View className="relative flex-row items-center justify-center border-b border-border bg-surface px-5 py-4">
        <Text className="text-center text-xl font-bold text-foreground">
          تحميل تلاوات القرآن
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="absolute right-5 h-10 w-10 items-center justify-center rounded-xl border border-border bg-background active:opacity-70"
        >
          <MaterialIcons
            name="arrow-forward-ios"
            size={18}
            color={primaryColor}
          />
        </Pressable>
      </View>

      <ScrollView
        className="flex-1 px-5"
        contentContainerStyle={{ paddingBottom: 130 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View className="my-6 items-center">
          <View className="mb-4 h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 shadow-sm">
            <MaterialIcons
              name={isCompleted ? 'verified' : 'cloud-download'}
              size={44}
              color={isCompleted ? '#059669' : primaryColor}
            />
          </View>
          <Text className="text-center text-2xl font-bold text-foreground">
            {isCompleted
              ? 'التلاوات جاهزة للاستخدام'
              : 'تنزيل التلاوات القرآنية'}
          </Text>
          <Text className="mt-2 text-center text-sm leading-6 text-muted">
            حفظ التلاوات محلياً على جهازك لتكرارها والاستماع إليها أثناء الحفظ
            والمراجعة بدون إنترنت.
          </Text>
        </View>

        {/* Download Mode Selector */}
        <View className="mb-4 flex-row gap-2">
          <Pressable
            onPress={() => !isDownloading && setDownloadMode('currentSurah')}
            className={`flex-1 items-center justify-center rounded-2xl border p-4 ${
              downloadMode === 'currentSurah'
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-center text-sm font-bold ${
                downloadMode === 'currentSurah'
                  ? 'text-primary'
                  : 'text-foreground'
              }`}
            >
              سورة الحفظ الحالية
            </Text>
            <Text className="mt-1 text-center text-xs text-muted">
              سورة {currentSurah} (سريع ~3MB)
            </Text>
          </Pressable>

          <Pressable
            onPress={() => !isDownloading && setDownloadMode('fullQuran')}
            className={`flex-1 items-center justify-center rounded-2xl border p-4 ${
              downloadMode === 'fullQuran'
                ? 'border-primary bg-primary/10'
                : 'border-border bg-surface'
            }`}
          >
            <Text
              className={`text-center text-sm font-bold ${
                downloadMode === 'fullQuran'
                  ? 'text-primary'
                  : 'text-foreground'
              }`}
            >
              المصحف كاملاً
            </Text>
            <Text className="mt-1 text-center text-xs text-muted">114 سورة (~850MB)</Text>
          </Pressable>
        </View>

        {/* Reciter Info Card */}
        <View className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <View className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <FontAwesome6 name="microphone" size={20} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-foreground">
                الشيخ {currentReciter.nameArabic}
              </Text>
              <Text className="text-xs text-muted">
                رواية حفص عن عاصم · مصحف مرتل
              </Text>
            </View>
          </View>
        </View>

        {/* Live Progress Card */}
        <View className="mb-4 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-foreground">
              حالة التنزيل
            </Text>
            <Text
              className={`text-xs font-bold ${
                isCompleted
                  ? 'text-emerald-600'
                  : isDownloading
                    ? 'text-primary'
                    : 'text-muted'
              }`}
            >
              {isCompleted
                ? 'مكتمل بالكامل'
                : isDownloading
                  ? `جارٍ التحميل (${percent}%)`
                  : 'جاهز للبدء'}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="my-3 h-2.5 w-full overflow-hidden rounded-full bg-border">
            <View
              className={`h-full transition-all ${
                isCompleted ? 'bg-emerald-600' : 'bg-primary'
              }`}
              style={{ width: `${percent}%` }}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text className="text-xs text-muted">
              {progressState
                ? `الآية ${progressState.currentAyah} من ${progressState.totalAyatInSurah}`
                : isCompleted
                  ? 'جميع الآيات مخزنة محلياً'
                  : '0 آيات محملة'}
            </Text>
            <Text className="text-xs font-semibold text-foreground">
              {percent}%
            </Text>
          </View>
        </View>

        {/* Features List */}
        <View className="my-2 gap-3">
          <Text className="px-1 text-base font-semibold text-foreground">
            مميزات التنزيل:
          </Text>
          {features.map((f, idx) => (
            <View
              key={idx}
              className="flex-row items-start gap-3 rounded-2xl border border-border bg-surface p-4"
            >
              <View className="mt-0.5 h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                <MaterialIcons
                  name={f.icon as any}
                  size={22}
                  color={primaryColor}
                />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-foreground">
                  {f.title}
                </Text>
                <Text className="mt-1 text-xs leading-5 text-muted">
                  {f.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Footer */}
      <View className="absolute bottom-0 left-0 right-0 border-t border-border bg-surface p-4 shadow-lg">
        {isDownloading ? (
          <Pressable
            onPress={handleCancelDownload}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-rose-600 py-4 shadow-sm active:opacity-85"
          >
            <MaterialIcons name="pause" size={22} color="#ffffff" />
            <Text className="text-lg font-bold text-white">
              إيقاف مؤقت للتحميل
            </Text>
          </Pressable>
        ) : isCompleted ? (
          <Pressable
            onPress={() => router.push('/memorize')}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-emerald-600 py-4 shadow-sm active:opacity-85"
          >
            <MaterialIcons
              name="play-circle-outline"
              size={24}
              color="#ffffff"
            />
            <Text className="text-lg font-bold text-white">
              الانتقال إلى جلسة الحفظ
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleStartDownload}
            className="w-full flex-row items-center justify-center gap-2 rounded-2xl bg-primary py-4 shadow-sm active:opacity-85"
          >
            <MaterialIcons name="file-download" size={22} color="#ffffff" />
            <Text className="text-lg font-bold text-white">
              بدء التحميل الآن
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.back()}
          className="mt-2.5 w-full items-center py-2 active:opacity-70"
        >
          <Text className="text-sm font-medium text-muted">
            {isCompleted ? 'الرجوع' : 'تخطي والتحميل لاحقاً'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
