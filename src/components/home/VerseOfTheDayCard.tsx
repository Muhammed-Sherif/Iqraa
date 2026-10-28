import { Image, Text, View } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export function VerseOfTheDayCard({
  verse = 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
  surahName = 'الشرح',
  ayahNumber = 6,
}: {
  verse?: string;
  surahName?: string;
  ayahNumber?: number;
}) {
  return (
    <View
      className="flex-row items-center justify-between rounded-3xl border border-[#E9DFCE] dark:border-[#2B3F3A] bg-[#F7F2E7] dark:bg-[#1A2E28] p-4 shadow-sm"
      style={{ direction: 'rtl' }}
    >
      {/* Right: Verse text */}
      <View className="flex-1 pr-1 gap-1">
        <View className="flex-row items-center gap-1.5">
          <MaterialIcons name="eco" size={18} color="#B38E46" />
          <Text className="text-xs font-semibold text-[#8C6D2D] dark:text-[#E2C792]">
            قال تعالى:
          </Text>
        </View>
        <Text
          className="text-xl font-bold text-foreground leading-8"
          style={{ fontFamily: 'serif' }}
        >
          {`{ ${verse} }`}
        </Text>
        <Text className="text-xs text-muted font-medium">
          ({surahName}: {ayahNumber})
        </Text>
      </View>

      {/* Left: Rehal / Open Quran on stand */}
      <View className="ml-2">
        <Image
          source={require('../../../assets/images/quran-rehal-stand.jpg')}
          className="h-20 w-20 rounded-2xl"
          resizeMode="cover"
        />
      </View>
    </View>
  );
}
