import { useColorScheme } from 'nativewind';
import { View } from 'react-native';
import { themes } from '@/constants/theme';

export const Theme = (props: {
  name: keyof typeof themes;
  children: React.ReactNode;
}) => {
  const mode = useColorScheme().colorScheme ?? 'light';
  return (
    <View style={[themes[props.name][mode]]} className='flex-1'>
      {props.children}
    </View>
  );
};
