import { View, Text } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';

/**
 * Static pedagogical tip card shown at the bottom of the listening session.
 * Encourages the learner to repeat the ayah aloud before advancing.
 */
export default function TipCard() {
  const primaryColor = getStaticColor('primary');

  return (
    <View className="flex-row items-center justify-between rounded-2xl border border-primary/20 bg-primary-soft/25 p-4">
      <View className="flex-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons
            name="lightbulb-outline"
            size={18}
            color={primaryColor}
          />
          <Text className="text-sm font-bold text-primary">نصيحة</Text>
        </View>
        <Text className="text-xs leading-5 text-muted">
          حاول ترديد الآيات بصوتك بعد انتهاء القارئ، ثم انتقل إلى المرحلة
          التالية.
        </Text>
      </View>

      <View className="h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <MaterialIcons name="headphones" size={26} color={primaryColor} />
      </View>
    </View>
  );
}
