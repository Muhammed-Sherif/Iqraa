import { Text, View } from 'react-native';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { getStaticColor } from '@/constants/theme';

export const Header = () => {
  const headerForegroundColor = getStaticColor('header-foreground');
  return (
    <View className="h-[22%] w-full  flex-row justify-between bg-header p-5">
      <View>
        <Text className="text-3xl text-header-foreground">
          السلام عليكم, محمد
        </Text>
        <Text className="text-xl text-muted">
          {new Date().toLocaleDateString(['ar-EG'], {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </Text>
      </View>
      <View>
        <FontAwesome6 name="bell" size={30} color={headerForegroundColor} />
        <View className="absolute right-0 top-1 h-3 w-3 rounded-full bg-red-500" />
      </View>
    </View>
  );
};

export default Header;
