// Regenerates Docs/screenshots from the running app.
//
//   npm run web                 (leave it running on port 8090)
//   node Docs/screenshots/capture.mjs
//
// Requires playwright: npm i -D playwright && npx playwright install chromium
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const OUT = '/Users/langaware/_Code/personal/75GANG/Docs/screenshots';
const now = new Date();
const iso = (d) => `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const ago = (n) => new Date(now.getTime() - n * 86400000);
const ts = () => now.toISOString();

const perfect = () => ({
  'no-alcohol': { completed: true },
  diet: { completed: true },
  water: { completed: false, value: 3 },
  workouts: { completed: false, sessions: [
    { minutes: 48, outdoor: true, completedAt: ts() },
    { minutes: 52, outdoor: false, completedAt: ts() }] },
  skill: { completed: false, value: 45 },
  reading: { completed: false, value: 15 },
  'morning-detox': { completed: false, wokeUpAt: new Date(now.getTime() - 4 * 3600000).toISOString(), phoneFreeMinutes: 60, noContentMinutes: 180 },
  'no-devices-bed': { completed: true },
  'weigh-in': { completed: false, weightKg: 88.4, photo: 'photos/x.jpg' },
  spirituality: { completed: false, value: 15 },
  connection: { completed: false, value: 15 },
});

const day = (habits, done, isPerfect) => ({
  habits, completedHabits: done, totalHabits: 11,
  completionPercentage: Math.round((done / 11) * 100), perfectDay: isPerfect, updatedAt: ts(),
});

const history = {};
for (let i = 11; i >= 1; i -= 1) {
  history[iso(ago(i))] = i === 5
    ? day({ 'no-alcohol': { completed: true }, water: { completed: false, value: 2 } }, 2, false)
    : day(perfect(), 11, true);
}

const partialToday = day({
  'no-alcohol': { completed: true },
  diet: { completed: true },
  water: { completed: false, value: 2.5 },
  workouts: { completed: false, sessions: [{ minutes: 48, outdoor: true, completedAt: ts() }] },
  skill: { completed: false, value: 45 },
  reading: { completed: false, value: 12 },
  'morning-detox': { completed: false, wokeUpAt: new Date(now.getTime() - 95 * 60000).toISOString(), phoneFreeMinutes: 60, noContentMinutes: 95 },
  spirituality: { completed: false, value: 15 },
}, 4, false);

const challenge = (mode, startDaysAgo, streak, best) => JSON.stringify({
  startDate: iso(ago(startDaysAgo)), mode, totalDays: 75,
  currentStreak: streak, longestStreak: best, status: 'active',
});

const profile = JSON.stringify({ name: 'Vangelis', createdAt: ts() });

const midChallenge = {
  '@75gang/profile': profile,
  '@75gang/challenge': challenge('hard', 11, 6, 6),
  '@75gang/days': JSON.stringify({ ...history, [iso(now)]: partialToday }),
};

const perfectDay = {
  '@75gang/profile': profile,
  '@75gang/challenge': challenge('hard', 11, 7, 7),
  '@75gang/days': JSON.stringify({ ...history, [iso(now)]: day(perfect(), 11, true) }),
};

const dayOneEasy = {
  '@75gang/profile': JSON.stringify({ name: null, createdAt: ts() }),
  '@75gang/challenge': challenge('easy', 0, 0, 0),
  '@75gang/days': JSON.stringify({}),
};

const browser = await chromium.launch();
const errors = [];

const shoot = async (name, path, storage, full = false) => {
  const context = await browser.newContext({ viewport: { width: 402, height: 900 }, deviceScaleFactor: 2 });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((e) => { localStorage.clear(); Object.entries(e).forEach(([k, v]) => localStorage.setItem(k, v)); }, storage);
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: full });
  const text = await page.evaluate(() => document.body.innerText.replace(/\n+/g, ' | ').slice(0, 110));
  console.log(`${name.padEnd(26)} ${text}`);
  await context.close();
};

await shoot('01-onboarding-welcome', '/onboarding', {});
await shoot('02-choose-challenge', '/onboarding/start', {});
await shoot('03-today-day-one-easy', '/today', dayOneEasy);
await shoot('04-today-mid-challenge', '/today', midChallenge, true);
await shoot('05-today-perfect-day', '/today', perfectDay, true);
await shoot('06-water-counter', '/habit/water', midChallenge);
await shoot('07-workouts', '/habit/workouts', midChallenge);
await shoot('08-skill-timer', '/habit/skill', midChallenge);
await shoot('09-morning-detox', '/habit/morning-detox', midChallenge);

await browser.close();
console.log(errors.length ? `\nPAGE ERRORS:\n${errors.join('\n')}` : '\nno page errors');
