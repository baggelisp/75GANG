// Regenerates Docs/screenshots from the running app.
//
//   npm run web                 (leave it running on port 8090)
//   node Docs/screenshots/capture.mjs
//
// Requires playwright: npm i -D playwright && npx playwright install chromium
import { chromium } from 'playwright';

const BASE = 'http://localhost:8090';
const OUT = process.env.OUT ?? new URL('.', import.meta.url).pathname;

const now = new Date();
const iso = (d) =>
  `${d.getFullYear()}-${`${d.getMonth() + 1}`.padStart(2, '0')}-${`${d.getDate()}`.padStart(2, '0')}`;
const ago = (n) => new Date(now.getTime() - n * 86400000);
const ts = () => now.toISOString();
const startOfSeed = new Date(`${iso(ago(41))}T12:00:00`);

// A morning that really happened on that day, woken at 07:00 local.
const wokeOn = (date) => {
  const morning = new Date(`${date}T00:00:00`);
  morning.setHours(7, 0, 0, 0);

  return morning.toISOString();
};

/** A weight that actually moves, so the trend card shows a trend and not a flat rule. */
const weightOn = (date) => {
  const elapsed = Math.round((new Date(`${date}T12:00:00`) - startOfSeed) / 86400000);

  return Math.round((90.6 - elapsed * 0.06) * 10) / 10;
};

const perfect = (date) => ({
  'no-alcohol': { completed: true },
  diet: { completed: true },
  water: { completed: false, value: 3 },
  workouts: {
    completed: false,
    sessions: [
      { minutes: 48, outdoor: true, completedAt: ts() },
      { minutes: 52, outdoor: false, completedAt: ts() },
    ],
  },
  skill: { completed: false, value: 45 },
  reading: { completed: false, value: 15 },
  'morning-detox': {
    completed: false,
    wokeUpAt: wokeOn(date),
    phoneFreeMinutes: 60,
    noContentMinutes: 180,
  },
  'no-devices-bed': { completed: true },
  'weigh-in': { completed: false, weightKg: weightOn(date), photo: 'photos/x.jpg' },
  spirituality: { completed: false, value: 15 },
  connection: { completed: false, value: 15 },
});

const day = (habits, done, isPerfect) => ({
  habits,
  completedHabits: done,
  totalHabits: 11,
  completionPercentage: Math.round((done / 11) * 100),
  perfectDay: isPerfect,
  updatedAt: ts(),
});

const history = {};
for (let i = 41; i >= 1; i -= 1) {
  const date = iso(ago(i));

  history[date] =
    i === 34
      ? day({ 'no-alcohol': { completed: true }, water: { completed: false, value: 2 } }, 2, false)
      : day(perfect(date), 11, true);
}

const partialToday = day(
  {
    'no-alcohol': { completed: true },
    diet: { completed: true },
    water: { completed: false, value: 2.5 },
    workouts: { completed: false, sessions: [{ minutes: 48, outdoor: true, completedAt: ts() }] },
    skill: { completed: false, value: 45 },
    reading: { completed: false, value: 12 },
    'morning-detox': {
      completed: false,
      wokeUpAt: new Date(now.getTime() - 95 * 60000).toISOString(),
      phoneFreeMinutes: 60,
      noContentMinutes: 95,
    },
    spirituality: { completed: false, value: 15 },
  },
  4,
  false,
);

const challenge = (mode, startDaysAgo, streak, best) =>
  JSON.stringify({
    startDate: iso(ago(startDaysAgo)),
    mode,
    totalDays: 75,
    currentStreak: streak,
    longestStreak: best,
    status: 'active',
  });

const settings = JSON.stringify({
  darkMode: true,
  notificationsEnabled: true,
  morningReminder: '07:00',
  eveningReminder: '20:00',
});

const journal = JSON.stringify({
  [iso(ago(1))]: {
    content: 'Second workout was brutal but the streak held.',
    whatWentWell: 'Water done before noon.',
    whatWasDifficult: 'Getting outside in the rain.',
    tomorrowGoal: 'Read before bed instead of after dinner.',
    createdAt: ts(),
  },
  [iso(ago(3))]: {
    content: 'Felt strong all day.',
    whatWentWell: 'Everything, honestly.',
    whatWasDifficult: '',
    tomorrowGoal: 'Keep it going.',
    createdAt: ts(),
  },
});

const profile = JSON.stringify({ name: 'Vangelis', createdAt: ts() });

const midChallenge = {
  '@75gang/profile': profile,
  '@75gang/challenge': challenge('hard', 41, 7, 33),
  '@75gang/days': JSON.stringify({ ...history, [iso(now)]: partialToday }),
  '@75gang/journal': journal,
  '@75gang/settings': settings,
};

const perfectDayState = {
  ...midChallenge,
  '@75gang/days': JSON.stringify({ ...history, [iso(now)]: day(perfect(iso(now)), 11, true) }),
};

const dayOneEasy = {
  '@75gang/profile': JSON.stringify({ name: null, createdAt: ts() }),
  '@75gang/challenge': challenge('easy', 0, 0, 0),
  '@75gang/days': JSON.stringify({}),
};

const noChallenge = { '@75gang/profile': profile };

const browser = await chromium.launch();
const errors = [];

const shoot = async (name, path, storage, options = {}) => {
  const context = await browser.newContext({
    viewport: { width: 402, height: 874 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${name}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`${name} [console] ${m.text().slice(0, 200)}`);
  });
  await page.goto(`${BASE}/`, { waitUntil: 'domcontentloaded' });
  await page.evaluate((e) => {
    localStorage.clear();
    Object.entries(e).forEach(([k, v]) => localStorage.setItem(k, v));
  }, storage);
  await page.goto(`${BASE}${path}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2200);

  if (options.act) {
    await options.act(page);
    await page.waitForTimeout(900);
  }

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: options.full ?? false });
  const text = await page.evaluate(() =>
    document.body.innerText.replace(/\n+/g, ' | ').slice(0, 130),
  );
  console.log(`${name.padEnd(28)} ${text}`);
  await context.close();
};

const tap = (label) => async (page) => {
  await page.getByLabel(label, { exact: true }).first().click();
};

const nextSlide = async (page) => {
  await page.getByLabel('Next', { exact: true }).first().click();
  await page.waitForTimeout(1000);
};

await shoot('01-onboarding-welcome', '/onboarding', {});
await shoot('02-onboarding-how', '/onboarding', {}, { act: nextSlide });
await shoot('03-onboarding-easy', '/onboarding', {}, {
  act: async (page) => {
    await nextSlide(page);
    await nextSlide(page);
  },
});
await shoot('04-onboarding-medium', '/onboarding', {}, {
  act: async (page) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
  },
});
await shoot('05-onboarding-hard', '/onboarding', {}, {
  act: async (page) => {
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
    await nextSlide(page);
  },
});
await shoot('06-onboarding-privacy', '/onboarding', {}, {
  act: async (page) => {
    for (let i = 0; i < 5; i += 1) {
      await nextSlide(page);
    }
  },
});
await shoot('07-choose-challenge', '/onboarding/start', {}, { full: true });
await shoot('08-today-easy-day-one', '/today', dayOneEasy, { full: true });
await shoot('09-today-mid', '/today', midChallenge, { full: true });
await shoot('10-today-perfect', '/today', perfectDayState, { full: true });
await shoot('11-progress', '/progress', midChallenge, { full: true });
await shoot('12-journal', '/journal', midChallenge, { full: true });
await shoot('13-profile', '/profile', midChallenge, { full: true });
await shoot('14-profile-no-challenge', '/profile', noChallenge, { full: true });
await shoot('15-settings', '/settings', midChallenge, { full: true });
await shoot('16-settings-confirm-erase', '/settings', midChallenge, {
  act: tap('Erase your challenge'),
});
await shoot('17-settings-confirm-restart', '/settings', midChallenge, {
  act: tap('Restart the challenge'),
});
await shoot('18-water', '/habit/water', midChallenge, { full: true });
await shoot('19-workouts', '/habit/workouts', midChallenge, { full: true });
await shoot('20-skill-timer', '/habit/skill', midChallenge, { full: true });
await shoot('21-morning-detox', '/habit/morning-detox', midChallenge, { full: true });
await shoot('22-weigh-in', '/habit/weigh-in', midChallenge, { full: true });
await shoot('23-day-detail', `/day/${iso(ago(2))}`, midChallenge, { full: true });
await shoot('24-marked-done', '/habit/morning-detox', midChallenge, {
  full: true,
  act: tap('Mark this rule as done'),
});

await browser.close();
console.log(errors.length ? `\nPAGE ERRORS:\n${errors.join('\n')}` : '\nno page errors');
