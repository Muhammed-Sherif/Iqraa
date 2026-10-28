# Iqraa Project Guidelines & Architecture

## Role
Assisting in building the Revision Engine of Iqraa, an offline-first Qur'an memorization app.
Stack: Expo, React Native, TypeScript (strict), expo-sqlite + Drizzle ORM, NativeWind, Arabic RTL UI.

## Working Rules
1. **Plan First**: Do not write code first. Present a concise plan (files to create/modify with one simple sentence each) and wait for approval.
2. **One Phase at a Time**: Work one phase at a time. After each phase, run the type check (`npx tsc --noEmit`), run tests, summarize the diff, and stop to wait.
3. **No Network/API**: Do NOT build any API, sync, retry queue, or network fallback code. Local SQLite only.
4. **Pure Core**: `src/core` is pure TypeScript. It must never import from `@/db`, services, or React. Pure functions never read the clock (caller passes `now: number`).
5. **Layer Separation**:
   - `Screen -> Hook -> Service -> DB Repository -> SQLite`
   - Screens and hooks never import from `@/db`. Only services do.
   - One service per domain area (`progressService`, `revisionService`, etc.).
   - Actions touching multiple tables must use one service function inside a single SQLite transaction.
6. **Pure Functions in Core**: For every new pure function in `src/core`, write the signature and the vitest tests first, then ask the user whether they write the body or the assistant does.
7. **Migrations**: Never edit `drizzle/migrations.js` or generated SQL by hand. Change `src/db/schema.ts`, then run `npx drizzle-kit generate`.
8. **JSDoc**: Add JSDoc comments (`/** */`) for every function and method explaining purpose, parameters, and return value simply.
