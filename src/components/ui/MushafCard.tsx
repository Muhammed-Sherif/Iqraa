import { View, Text } from 'react-native';

interface quranText {
  num: number;
  text: string;
}
export function MushafCard({
  primaryColor,
  quranText,
}: {
  primaryColor: string;
  quranText: quranText[];
}) {
  return (
    <View
      className="rounded-2xl border border-border bg-surface p-5"
      style={{ direction: 'rtl' }}
    >
      {quranText.map((v) => (
        <Text
          key={v.num}
          className="mb-3 text-center text-2xl leading-10 text-foreground"
          style={{ fontFamily: 'serif' }}
        >
          {v.text}{' '}
          <Text className="text-lg" style={{ color: primaryColor }}>
            ﴿{v.num}﴾
          </Text>
        </Text>
      ))}
    </View>
  );
}
