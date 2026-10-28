import { Rate, UserType } from '@/core/types';

/** Daily mix split percentages by user type: new vs revision */
export const DAILY_MIX_SPLIT = {
  notHafiz: { newShare: 0.7, revisionShare: 0.3 },
  partiallyHafiz: { newShare: 0.4, revisionShare: 0.6 },
  hafiz: { newShare: 0.1, revisionShare: 0.9 },
} as const satisfies Record<UserType, { newShare: number; revisionShare: number }>;

/** Maximum ayat of revision allowed per day, keyed by user type */
export const REVISION_DAILY_CEILING = {
  notHafiz: 30,
  partiallyHafiz: 60,
  hafiz: 100,
} as const satisfies Record<UserType, number>;

/** Maximum consecutive ayat inside one surah assigned to a single revision task */
export const REVISION_TASK_MAX_AYAT = 5;

/** Definition of a revision self-assessment rating option */
export interface RevisionRatingOption {
  key: Rate;
  label: string;
  sublabel: string;
  icon: 'verified' | 'check-circle' | 'highlight-off';
  colorToken: 'strong' | 'primary' | 'danger';
  bgTintToken: 'primary-soft' | 'danger';
}

/** Pre-configured rating options for self-assessment in revision sessions */
export const REVISION_RATING_OPTIONS: RevisionRatingOption[] = [
  {
    key: 'easy',
    label: 'ممتاز (متقن)',
    sublabel: 'تذكرت الآيات بطلاقة كاملة دون أي تردد أو خطأ',
    icon: 'verified',
    colorToken: 'strong',
    bgTintToken: 'primary-soft',
  },
  {
    key: 'good',
    label: 'جيد (مقبول)',
    sublabel: 'تذكرت الآيات مع تردد بسيط أو تصحيح ذاتي',
    icon: 'check-circle',
    colorToken: 'primary',
    bgTintToken: 'primary-soft',
  },
  {
    key: 'hard',
    label: 'يحتاج تثبيت (صعب)',
    sublabel: 'واجهت صعوبة في الاستحضار أو أخطأت في بعض الكلمات',
    icon: 'highlight-off',
    colorToken: 'danger',
    bgTintToken: 'danger',
  },
];
