import { Image, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';

export function HomeHeader({ userName = 'أحمد' }: { userName?: string }) {
  const strongColor = getStaticColor('strong');

  return (
    <View className="relative w-full overflow-hidden bg-background h-60">
      {/* Mosque Background Banner */}
      <Image
        source={require('../../../assets/images/mosque-header-bg.jpg')}
        className="absolute top-0 right-0 left-0 h-44 w-full opacity-40 dark:opacity-25"
        resizeMode="cover"
      />

      {/* User Greeting Bar */}
      <View
        className="flex-row items-center justify-between px-6 pt-5 pb-4"
        style={{ direction: 'rtl' }}
      >
        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-surface border border-border shadow-sm">
            <MaterialIcons name="person" size={28} color={strongColor} />
          </View>
          <View className="gap-0.5">
            <Text className="text-xs text-muted font-medium">السلام عليكم</Text>
            <Text className="text-2xl font-bold text-foreground">{userName}</Text>
            <Text className="text-xs text-muted">.. رحلتك مع القرآن مستمرة</Text>
          </View>
        </View>
      </View>
    </View>
  );
}
