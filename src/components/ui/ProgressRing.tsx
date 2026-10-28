import { ReactNode } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { getStaticColor } from '@/constants/theme';

type Props = {
  percent: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
};

export const ProgressRing = ({
  percent,
  size = 80,
  strokeWidth = 8,
  children,
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percent));
  const offset = circumference * (1 - clamped / 100);
  const center = size / 2;

  return (
    <View style={{ width: size }} className="items-center justify-center">
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* background track */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getStaticColor('border')}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* green progress */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke={getStaticColor('primary')}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
      </Svg>
      {children ?? (
        <Text className="text-4xl font-normal text-foreground">2/3</Text>
      )}
    </View>
  );
};
