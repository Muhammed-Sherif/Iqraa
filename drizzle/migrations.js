// This file is required for Expo/React Native SQLite migrations - https://orm.drizzle.team/quick-sqlite/expo

import m0000 from './20261023140341_regular_dracula/migration.sql';
import m0001 from './20261023174719_uneven_epoch/migration.sql';
import m0002 from './20261024182704_motionless_radioactive_man/migration.sql';
import m0003 from './20261025183455_flashy_zuras/migration.sql';

export default {
  journal: {
    entries: [
      { idx: 0, when: 1729692221000, tag: '20261023140341_regular_dracula', breakpoints: true },
      { idx: 1, when: 1729705639000, tag: '20261023174719_uneven_epoch', breakpoints: true },
      { idx: 2, when: 1729794424000, tag: '20261024182704_motionless_radioactive_man', breakpoints: true },
      { idx: 3, when: 1729881295000, tag: '20261025183455_flashy_zuras', breakpoints: true },
    ],
  },
  migrations: {
    '20261023140341_regular_dracula': m0000,
    '20261023174719_uneven_epoch': m0001,
    '20261024182704_motionless_radioactive_man': m0002,
    '20261025183455_flashy_zuras': m0003,
  },
};