import { palette } from '@/constants/theme';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Text, View, Pressable } from 'react-native';

export function EvaluateStep({
  primaryColor,
  onBack,
  onConfirm,
}: {
  primaryColor: string;
  onBack: () => void;
  onConfirm?: (rate: 'good' | 'bad') => void;
}) {
  const [selected, setSelected] = useState<'good' | 'bad' | null>(null);
  const scheme = useColorScheme().colorScheme ?? 'light';
  const colors = palette.brand[scheme];

  return (
    <>
      <View className="flex-1 gap-4 px-6 pt-6">
        {/* title */}
        <Text className="text-center text-2xl font-bold text-foreground">
          كيف كان أداؤك؟
        </Text>

        {/* good option */}
        <Pressable
          onPress={() => setSelected('good')}
          className="flex-row items-center gap-4 rounded-2xl border p-5"
          style={{
            borderColor: selected === 'good' ? primaryColor : colors.border,
            backgroundColor:
              selected === 'good' ? primaryColor + '18' : colors.surface,
          }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: primaryColor + '22' }}
          >
            <MaterialIcons name="check-circle" size={28} color={primaryColor} />
          </View>
          <View className="flex-1" style={{ direction: 'rtl' }}>
            <Text className="text-xl font-bold text-foreground">جيد</Text>
            <Text className="text-sm text-muted">
              لقد تذكرت الآية بشكل صحيح
            </Text>
          </View>
        </Pressable>

        {/* not good option */}
        <Pressable
          onPress={() => setSelected('bad')}
          className="flex-row items-center gap-4 rounded-2xl border p-5"
          style={{
            borderColor: selected === 'bad' ? colors.danger : colors.border,
            backgroundColor:
              selected === 'bad' ? colors.danger + '18' : colors.surface,
          }}
        >
          <View
            className="h-12 w-12 items-center justify-center rounded-full"
            style={{ backgroundColor: colors.danger + '22' }}
          >
            <MaterialIcons name="cancel" size={28} color={colors.danger} />
          </View>
          <View className="flex-1" style={{ direction: 'rtl' }}>
            <Text className="text-xl font-bold text-foreground">
              لم أكن جيداً
            </Text>
            <Text className="text-sm text-muted">
              واجهت صعوبة في التذكر{'\n'}أو أخطأت في بعض الكلمات
            </Text>
          </View>
        </Pressable>

        {/* back link */}
        <Pressable onPress={onBack} className="items-center pt-2">
          <Text className="text-base text-muted">
            العودة إلى الخاصية التالية
          </Text>
        </Pressable>
      </View>

      {/* confirm */}
      <View className="border-t border-border p-5">
        <Pressable
          className="w-full rounded-2xl p-4"
          style={{ backgroundColor: selected ? primaryColor : colors.border }}
          disabled={!selected}
          onPress={() => {
            if (selected) {
              onConfirm?.(selected);
            }
          }}
        >
          <Text className="text-center text-xl font-bold text-primary-foreground">
            تأكيد
          </Text>
        </Pressable>
      </View>
    </>
  );
}
