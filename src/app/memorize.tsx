import { SafeAreaView } from 'react-native-safe-area-context';
import { NavigationHeader } from '@/components/ui/navigationHeader';
import { TaskSelection } from '@/components/memorize/TaskSelection';
import { Steps } from '@/components/memorize/steps';
import { useMemorization } from '@/store/memorize';

const STEP_TITLES: Record<string, string> = {
  listen: 'الاستماع والتكرار',
  recall: 'التسميع',
  compare: 'المقارنة',
  evaluate: 'التقييم',
};

/* ─── session screen ─────────────────────────────────────────── */
export default function Memorize() {
  const { task, currentScreen } = useMemorization();
  const title = task ? STEP_TITLES[currentScreen] ?? 'جلسة الحفظ' : 'الحفظ';

  return (
    <SafeAreaView className="flex-1 bg-background">
      {(!task || currentScreen !== 'listen') && (
        <NavigationHeader title={title} />
      )}
      {task ? <Steps /> : <TaskSelection />}
    </SafeAreaView>
  );
}
