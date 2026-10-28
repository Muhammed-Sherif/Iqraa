import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Direction, UserType } from '@/core/types';
import { onboardingService } from '@/services';

export interface SurahItem {
  surahNumber: number;
  name: string;
  ayahCount: number;
}

export interface OnboardingDirectionStepProps {
  direction: Direction;
  onChangeDirection: (dir: Direction) => void;
  userType: UserType;
  lastSurah: number;
  lastAyah: number;
  onChangeLastSurah: (surahNumber: number) => void;
  onChangeLastAyah: (ayahNumber: number) => void;
  primaryColor: string;
}

/**
 * Step 2 in onboarding: Select recitation direction and specify the last memorized Surah & Ayah from the database.
 *
 * @param props - OnboardingDirectionStepProps
 * @returns React component
 */
export function OnboardingDirectionStep({
  direction,
  onChangeDirection,
  userType,
  lastSurah,
  lastAyah,
  onChangeLastSurah,
  onChangeLastAyah,
  primaryColor,
}: OnboardingDirectionStepProps) {
  const [surahs, setSurahs] = useState<SurahItem[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState<boolean>(true);
  const [surahPickerVisible, setSurahPickerVisible] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    let isActive = true;
    async function loadSurahs() {
      try {
        const rows = await onboardingService.getAllSurahs();
        if (isActive) {
          setSurahs(
            rows.map((r) => ({
              surahNumber: r.surahNumber,
              name: r.name,
              ayahCount: r.ayahCount,
            })),
          );
        }
      } catch (error) {
        console.error('[OnboardingDirectionStep] Failed to fetch surahs:', error);
      } finally {
        if (isActive) setLoadingSurahs(false);
      }
    }

    if (userType === 'partiallyHafiz') {
      loadSurahs();
    }
    return () => {
      isActive = false;
    };
  }, [userType]);

  const selectedSurah = surahs.find((s) => s.surahNumber === lastSurah) ?? {
    surahNumber: lastSurah,
    name: `سورة ${lastSurah}`,
    ayahCount: 286,
  };

  const filteredSurahs = surahs.filter(
    (s) =>
      s.name.includes(searchQuery.trim()) ||
      String(s.surahNumber).includes(searchQuery.trim()),
  );

  const handleSelectSurah = (surah: SurahItem) => {
    onChangeLastSurah(surah.surahNumber);
    // Clamp lastAyah if it exceeds new surah ayahCount
    if (lastAyah > surah.ayahCount) {
      onChangeLastAyah(surah.ayahCount);
    }
    setSurahPickerVisible(false);
  };

  const handleAyahDecrement = () => {
    if (lastAyah > 1) {
      onChangeLastAyah(lastAyah - 1);
    }
  };

  const handleAyahIncrement = () => {
    if (lastAyah < selectedSurah.ayahCount) {
      onChangeLastAyah(lastAyah + 1);
    }
  };

  return (
    <View className="gap-4">
      <Text className="w-full text-center text-xl font-bold text-foreground">
        ما هو اتجاه الحفظ المفضل لديك؟
      </Text>
      <Text className="mb-2 w-full text-center text-xs leading-5 text-muted">
        يمكنك اختيار الترتيب التصاعدي أو البدء من قصار السور.
      </Text>

      {/* Ascending Direction */}
      <Pressable
        onPress={() => onChangeDirection('asc')}
        className={`rounded-2xl border p-4 ${
          direction === 'asc'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MaterialIcons
              name="arrow-downward"
              size={22}
              color={primaryColor}
            />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              من الفاتحة إلى الناس (ترتيب المصحف)
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              البدء من سورة الفاتحة والبقرة ثم التقدم نحو نهاية المصحف.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Descending Direction */}
      <Pressable
        onPress={() => onChangeDirection('desc')}
        className={`rounded-2xl border p-4 ${
          direction === 'desc'
            ? 'border-primary bg-primary/10'
            : 'border-border bg-surface'
        }`}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MaterialIcons name="arrow-upward" size={22} color={primaryColor} />
          </View>
          <View className="flex-1">
            <Text className="text-base font-bold text-foreground">
              من الناس إلى الفاتحة (قصار السور أولاً)
            </Text>
            <Text className="mt-0.5 text-xs text-muted">
              البدء من جزء عمّ ثم الصعود تدريجياً نحو السور الطوال.
            </Text>
          </View>
        </View>
      </Pressable>

      {/* Section for partiallyHafiz: Pick Last Surah & Ayah */}
      {userType === 'partiallyHafiz' && (
        <View className="mt-2 rounded-2xl border border-border bg-surface p-4 shadow-sm">
          <Text className="mb-1 text-sm font-bold text-foreground">
            آخر موضع محفوظ لديك:
          </Text>
          <Text className="mb-4 text-xs text-muted">
            حدد آخر سورة ورقم الآية التي أتممت حفظها لتبدأ الخطة من بعدها.
          </Text>

          {loadingSurahs ? (
            <View className="items-center py-4">
              <ActivityIndicator size="small" color={primaryColor} />
              <Text className="mt-2 text-xs text-muted">
                جارٍ تحميل فهرس السور...
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              {/* Surah Selector Button */}
              <Pressable
                onPress={() => setSurahPickerVisible(true)}
                className="flex-row items-center justify-between rounded-xl border border-border bg-background p-3.5 active:opacity-70"
              >
                <View className="flex-row items-center gap-2">
                  <MaterialIcons name="menu-book" size={20} color={primaryColor} />
                  <Text className="text-sm font-bold text-foreground">
                    سورة {selectedSurah.name} ({selectedSurah.surahNumber})
                  </Text>
                </View>
                <View className="flex-row items-center gap-1">
                  <Text className="text-xs text-muted">
                    {selectedSurah.ayahCount} آية
                  </Text>
                  <MaterialIcons
                    name="keyboard-arrow-down"
                    size={20}
                    color="#9CA3AF"
                  />
                </View>
              </Pressable>

              {/* Ayah Stepper Selector */}
              <View className="flex-row items-center justify-between rounded-xl border border-border bg-background p-3">
                <View>
                  <Text className="text-xs font-semibold text-foreground">
                    رقم آخر آية محفوظة
                  </Text>
                  <Text className="text-[11px] text-muted">
                    من 1 إلى {selectedSurah.ayahCount}
                  </Text>
                </View>

                <View className="flex-row items-center gap-2">
                  <Pressable
                    onPress={handleAyahDecrement}
                    disabled={lastAyah <= 1}
                    className={`h-9 w-9 items-center justify-center rounded-lg border ${
                      lastAyah <= 1
                        ? 'border-border bg-muted/10 opacity-40'
                        : 'border-border bg-surface active:opacity-70'
                    }`}
                  >
                    <MaterialIcons name="remove" size={18} color={primaryColor} />
                  </Pressable>

                  <View className="min-w-[44px] items-center justify-center rounded-lg bg-surface px-2 py-1.5 border border-border">
                    <Text className="text-sm font-bold text-primary">
                      {lastAyah}
                    </Text>
                  </View>

                  <Pressable
                    onPress={handleAyahIncrement}
                    disabled={lastAyah >= selectedSurah.ayahCount}
                    className={`h-9 w-9 items-center justify-center rounded-lg border ${
                      lastAyah >= selectedSurah.ayahCount
                        ? 'border-border bg-muted/10 opacity-40'
                        : 'border-border bg-surface active:opacity-70'
                    }`}
                  >
                    <MaterialIcons name="add" size={18} color={primaryColor} />
                  </Pressable>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Modal: Full Surahs Picker */}
      <Modal
        visible={surahPickerVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSurahPickerVisible(false)}
      >
        <View className="flex-1 bg-background p-4" style={{ direction: 'rtl' }}>
          {/* Picker Header */}
          <View className="flex-row items-center justify-between border-b border-border pb-3">
            <Text className="text-lg font-bold text-foreground">
              اختر السورة الكريمة
            </Text>
            <Pressable
              onPress={() => setSurahPickerVisible(false)}
              className="h-9 w-9 items-center justify-center rounded-xl bg-surface border border-border"
            >
              <MaterialIcons name="close" size={20} color={primaryColor} />
            </Pressable>
          </View>

          {/* Search Input */}
          <View className="my-3 flex-row items-center rounded-xl border border-border bg-surface px-3 py-2">
            <MaterialIcons name="search" size={20} color="#9CA3AF" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="ابحث باسم السورة أو رقمها..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 px-2 text-sm text-foreground text-right"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <MaterialIcons name="cancel" size={16} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Surahs List */}
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 24 }}
          >
            {filteredSurahs.map((surah) => {
              const isSelected = surah.surahNumber === lastSurah;
              return (
                <Pressable
                  key={surah.surahNumber}
                  onPress={() => handleSelectSurah(surah)}
                  className={`mb-2 flex-row items-center justify-between rounded-xl border p-3.5 ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-surface active:opacity-70'
                  }`}
                >
                  <View className="flex-row items-center gap-3">
                    <View className="h-8 w-8 items-center justify-center rounded-lg bg-border/40">
                      <Text className="text-xs font-bold text-muted">
                        {surah.surahNumber}
                      </Text>
                    </View>
                    <Text className="text-base font-bold text-foreground">
                      سورة {surah.name}
                    </Text>
                  </View>

                  <Text className="text-xs font-semibold text-muted">
                    {surah.ayahCount} آية
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}
