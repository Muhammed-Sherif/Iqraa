import { getStaticColor } from '@/constants/theme';
import { View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

type Props = {
  percent: number; // 0 to 100
  size?: number;
};

export const ProgressBar = ({ percent, size = 310 }: Props) => {
  const primaryColor = getStaticColor('primary');
  const mutedColor = getStaticColor('muted');
  return (
    <View style={{ width: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* background track */}
        <Line
          x1={0}
          y1={size / 2}
          x2={size}
          y2={size / 2}
          stroke={mutedColor}
          strokeWidth={4}
        />
        {/* green progress */}
        <Line
          x1={0}
          y1={size / 2}
          x2={(percent / 100) * size}
          y2={size / 2}
          stroke={primaryColor}
          strokeWidth={4}
        />
      </Svg>
    </View>
  );
};
