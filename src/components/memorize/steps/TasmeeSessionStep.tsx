import { useEffect } from 'react';
import { getStaticColor } from '@/constants/theme';
import { memorizationService } from '@/services';
import { useMemorization } from '@/store/memorize';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { formatDuration } from '@/core/utils';
import { Alert, Pressable, Text, View } from 'react-native';

export function TasmeeSessionStep() {
  const primaryColor = getStaticColor('primary');
  const dangerColor = getStaticColor('danger');

  const task = useMemorization((s) => s.task);
  const onSkip = useMemorization((s) => s.goNext);
  const recordedAudioUri = useMemorization((s) => s.recordedAudioUri);
  const setRecordedAudioUri = useMemorization((s) => s.setRecordedAudioUri);

  const lastDurationMillis = useMemorization((s) => s.lastDurationMillis);
  const setLastDurationMillis = useMemorization((s) => s.setLastDurationMillis);

  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);

  useEffect(() => {
    (async () => {
      try {
        const status = await AudioModule.requestRecordingPermissionsAsync();
        if (!status.granted) {
          Alert.alert('تنبيه', 'يجب إعطاء صلاحية استخدام الميكروفون لتسجيل التلاوة');
        }

        await setAudioModeAsync({
          playsInSilentMode: true,
          allowsRecording: true,
        });
      } catch (err) {
        console.error('Failed to configure audio mode:', err);
      }
    })();
  }, []);

  const record = async () => {
    try {
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
    } catch (err) {
      console.error('Failed to start recording:', err);
    }
  };

  const stopRecording = async () => {
    try {
      const finalDuration = recorderState.durationMillis;
      setLastDurationMillis(finalDuration);
      await audioRecorder.stop();
      const uri = audioRecorder.uri;
      if (uri) {
        setRecordedAudioUri(uri);
        if (task) {
          await memorizationService.saveRecordedAudio(task.taskId, uri);
        }
      }
    } catch (err) {
      console.error('Failed to stop recording:', err);
    }
  };

  return (
    <>
      <View className="flex-1 items-center justify-center gap-6 px-6">
        {/* icon + instruction */}
        <View className="items-center gap-3">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{
              backgroundColor: recorderState.isRecording
                ? dangerColor + '22'
                : primaryColor + '22',
            }}
          >
            <MaterialIcons
              name={recorderState.isRecording ? 'mic' : 'psychology'}
              size={48}
              color={recorderState.isRecording ? dangerColor : primaryColor}
            />
          </View>
          <Text className="text-center text-2xl font-bold text-foreground">
            {recorderState.isRecording
              ? 'تلاوة الآيات من الذاكرة'
              : 'حاول تلاوة الآية كاملةً\nمن الذاكرة'}
          </Text>
          <Text className="text-center text-sm text-muted px-4">
            {recorderState.isRecording
              ? 'جارٍ التسجيل الآن... رتّل بهدوء ووضوح'
              : 'رتل الآيات دون النظر إلى المصحف ليتم حفظ تسجيلك ومقارنته في الخطوة التالية'}
          </Text>
        </View>

        {/* Live Recording Indicator (Red bullet + duration) */}
        {recorderState.isRecording && (
          <View
            className="flex-row items-center gap-3 rounded-full border border-border bg-surface px-5 py-2.5 shadow-sm"
            style={{ direction: 'rtl' }}
          >
            <View
              className="h-3.5 w-3.5 rounded-full"
              style={{ backgroundColor: dangerColor }}
            />
            <Text className="text-2xl font-bold text-foreground tracking-wider">
              {formatDuration(recorderState.durationMillis)}
            </Text>
            <Text className="text-sm font-semibold" style={{ color: dangerColor }}>
              تسجيل مباشر
            </Text>
          </View>
        )}

        {/* Saved recording indicator if stopped and audio URI exists */}
        {!recorderState.isRecording && recordedAudioUri && (
          <View
            className="flex-row items-center gap-2.5 rounded-2xl border border-border bg-surface px-4 py-3"
            style={{ direction: 'rtl' }}
          >
            <View className="h-8 w-8 items-center justify-center rounded-full bg-primary-soft">
              <MaterialIcons name="check" size={18} color={primaryColor} />
            </View>
            <View className="flex-1">
              <Text className="text-sm font-bold text-foreground">
                تم حفظ التسجيل الصوتي بنجاح
              </Text>
              {lastDurationMillis > 0 && (
                <Text className="text-xs text-muted">
                  المدة: {formatDuration(lastDurationMillis)}
                </Text>
              )}
            </View>
          </View>
        )}

        {/* record / action button */}
        <View className="w-full gap-3">
          {recorderState.isRecording ? (
            <Pressable
              className="w-full flex-row items-center justify-center gap-3 rounded-2xl p-5 shadow-sm active:opacity-90"
              style={{ backgroundColor: dangerColor }}
              onPress={stopRecording}
            >
              <MaterialIcons name="stop" size={26} color="#ffffff" />
              <Text className="text-xl font-bold text-white">
                إيقاف التسجيل
              </Text>
            </Pressable>
          ) : recordedAudioUri ? (
            <>
              <Pressable
                className="w-full flex-row items-center justify-center gap-3 rounded-2xl p-5 shadow-sm active:opacity-90"
                style={{ backgroundColor: primaryColor }}
                onPress={onSkip}
              >
                <MaterialIcons name="compare-arrows" size={24} color="#ffffff" />
                <Text className="text-xl font-bold text-primary-foreground">
                  متابعة إلى المقارنة
                </Text>
              </Pressable>

              <Pressable
                className="w-full flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface p-4 active:opacity-70"
                onPress={record}
              >
                <MaterialIcons name="replay" size={20} color={primaryColor} />
                <Text className="text-base font-bold text-foreground">
                  إعادة التسجيل من جديد
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              className="w-full flex-row items-center justify-center gap-3 rounded-2xl p-5 shadow-sm active:opacity-90"
              style={{ backgroundColor: primaryColor }}
              onPress={record}
            >
              <MaterialIcons name="mic" size={26} color="#ffffff" />
              <Text className="text-xl font-bold text-primary-foreground">
                ابدأ التسجيل
              </Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* skip */}
      <View className="border-t border-border p-5">
        <Pressable onPress={onSkip} className="items-center py-2 active:opacity-70">
          <Text className="text-lg text-muted">
            {recordedAudioUri ? 'تخطي والمتابعة' : 'تخطي'}
          </Text>
        </Pressable>
      </View>
    </>
  );
}
