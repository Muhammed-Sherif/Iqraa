import * as SQLite from 'expo-sqlite';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import { sql } from 'drizzle-orm';
import { relations } from './relations';

const expo = SQLite.openDatabaseSync('iqraa_v5.db');
export const db = drizzle(expo, { relations });

/**
 * Executes async operations inside a SQLite transaction atomically.
 * Runs `BEGIN IMMEDIATE`, commits on success, and rolls back on error.
 *
 * @param action - Async function containing database operations
 * @returns Result of the action
 */
export async function withTransaction<T>(action: () => Promise<T>): Promise<T> {
  await db.run(sql`BEGIN IMMEDIATE`);
  try {
    const result = await action();
    await db.run(sql`COMMIT`);
    return result;
  } catch (err) {
    await db.run(sql`ROLLBACK`);
    throw err;
  }
}
