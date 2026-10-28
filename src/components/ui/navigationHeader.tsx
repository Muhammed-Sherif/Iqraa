import { View, Text, Pressable } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { getStaticColor } from '@/constants/theme';
import { useMemorization } from '@/store/memorize';

export function NavigationHeader({ title }: { title: string }) {
  const primaryColor = getStaticColor('primary');
  const goPrev = useMemorization().goPrev;
  return (
    <View className="flex-row items-center justify-between border-b border-border px-5 py-4">
      <Pressable onPress={goPrev}>
        <MaterialIcons
          name="arrow-forward-ios"
          size={22}
          color={primaryColor}
        />
      </Pressable>
      <Text className="text-foreground text-lg font-medium">{title}</Text>
    </View>
  );
}
