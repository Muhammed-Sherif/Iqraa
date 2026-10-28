import { Pressable, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

interface QuickActionCardsProps {
  onNavigateToMemorize: () => void;
  onNavigateToRevision: () => void;
  onNavigateToTasmee: () => void;
}

export function QuickActionCards({
  onNavigateToMemorize,
  onNavigateToRevision,
  onNavigateToTasmee,
}: QuickActionCardsProps) {
  return (
    <View className="flex-row gap-3" style={{ direction: 'rtl' }}>
      {/* Card 1: حفظ جديد (New Memorization) */}
      <Pressable
        onPress={onNavigateToMemorize}
        className="flex-1 items-center justify-between rounded-3xl p-4 bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/40 shadow-sm active:scale-[0.98] active:opacity-90"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#3B82F6] shadow-sm mb-2.5">
          <MaterialIcons name="add" size={26} color="#ffffff" />
        </View>
        <Text className="text-base font-bold text-[#1E3A8A] dark:text-sky-300 mb-0.5">
          حفظ جديد
        </Text>
        <Text className="text-[11px] text-sky-600 dark:text-sky-400 text-center mb-2">
          ابدأ بحفظ آية جديدة
        </Text>
        <MaterialIcons name="chevron-left" size={20} color="#3B82F6" />
      </Pressable>

      {/* Card 2: المراجعة (Revision) */}
      <Pressable
        onPress={onNavigateToRevision}
        className="flex-1 items-center justify-between rounded-3xl p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/40 shadow-sm active:scale-[0.98] active:opacity-90"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#10B981] shadow-sm mb-2.5">
          <MaterialIcons name="auto-stories" size={22} color="#ffffff" />
        </View>
        <Text className="text-base font-bold text-[#065F46] dark:text-emerald-300 mb-0.5">
          المراجعة
        </Text>
        <Text className="text-[11px] text-emerald-600 dark:text-emerald-400 text-center mb-2">
          راجع ما حفظته
        </Text>
        <MaterialIcons name="chevron-left" size={20} color="#10B981" />
      </Pressable>

      {/* Card 3: التسميع (Tasmee / Recall) */}
      <Pressable
        onPress={onNavigateToTasmee}
        className="flex-1 items-center justify-between rounded-3xl p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-100 dark:border-purple-900/40 shadow-sm active:scale-[0.98] active:opacity-90"
      >
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#8B5CF6] shadow-sm mb-2.5">
          <MaterialIcons name="star" size={22} color="#ffffff" />
        </View>
        <Text className="text-base font-bold text-[#5B21B6] dark:text-purple-300 mb-0.5">
          التسميع
        </Text>
        <Text className="text-[11px] text-purple-600 dark:text-purple-400 text-center mb-2">
          اقرأ من ذاكرتك
        </Text>
        <MaterialIcons name="chevron-left" size={20} color="#8B5CF6" />
      </Pressable>
    </View>
  );
}
