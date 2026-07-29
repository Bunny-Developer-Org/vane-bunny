#!/usr/bin/env node
/*
 * `npm run help` — prints every npm script grouped by topic, with a one-line
 * description and the underlying shell command.
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
const scripts = pkg.scripts || {};

// One-line description per script.
const DESCRIPTIONS = {
  // ─── Help ──────────────────────────────────────────────────────────────
  help: 'Show this help screen',

  // ─── App lifecycle ─────────────────────────────────────────────────────
  start: 'Start the Expo development server',
  android: 'Run on Android emulator/device',
  ios: 'Run on iOS simulator/device',
  web: 'Start Expo web server',
  'web:watch': 'Start Expo web server in watch mode',

  // ─── Build & EAS ───────────────────────────────────────────────────────
  'build:dev': 'EAS build for Android (development profile)',
  'build:preview': 'EAS build for Android (preview profile)',
  'build:production': 'EAS build for Android (production profile)',
  'submit:android': 'EAS submit to Google Play Store',

  // ─── Quality & Testing ─────────────────────────────────────────────────
  'quality:check': 'Run quality check pipeline (stops on first error)',
  'quality:no-bail': 'Run quality pipeline without stopping on errors',
  'quality:json': 'Run quality pipeline in no-bail mode and write JSON report to tmp/',
  'type-check': 'TypeScript type check (tsc --noEmit)',
  lint: 'Run ESLint across project',
  format: 'Format files using Prettier',
  'format:check': 'Check formatting using Prettier',
  test: 'Run Jest test suite',
  'test:silent': 'Run Jest test suite in quiet mode',
  'deps:audit': 'Run dependency-cruiser architecture check',
  'fallow:dead-code': 'Run fallow dead-code analysis',
  'fallow:dupes': 'Run fallow duplicate code analysis',
};

const SECTIONS = [
  ['Help', ['help']],
  ['App lifecycle', ['start', 'android', 'ios', 'web', 'web:watch']],
  ['Build & EAS', ['build:dev', 'build:preview', 'build:production', 'submit:android']],
  ['Quality & Testing', [
    'quality:check',
    'quality:no-bail',
    'quality:json',
    'type-check',
    'lint',
    'format',
    'format:check',
    'test',
    'test:silent',
    'deps:audit',
    'fallow:dead-code',
    'fallow:dupes'
  ]],
];

const NAME_WIDTH = 30;

function pad(s, n) {
  return s.length >= n ? s : s + ' '.repeat(n - s.length);
}

// Simple ANSI color helpers (no external dependency needed)
const cyan = (s) => `\x1b[36m\x1b[1m${s}\x1b[0m`;
const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const bold = (s) => `\x1b[1m${s}\x1b[0m`;
const magenta = (s) => `\x1b[35m\x1b[1m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;

function printScript(name) {
  if (!(name in scripts)) return;
  const desc = DESCRIPTIONS[name] || yellow('TODO: add description');
  const cmd = scripts[name];
  if (name.length > NAME_WIDTH) {
    console.log(`  ${cyan(name)}`);
    console.log(`  ${pad('', NAME_WIDTH)}${desc}`);
  } else {
    console.log(`  ${cyan(pad(name, NAME_WIDTH))}${desc}`);
  }
  console.log(`  ${dim(pad('', NAME_WIDTH) + '$ ' + cmd)}`);
}

console.log('');
console.log(bold('npm scripts — vane-bunny'));
console.log(dim('  Invoke any of these with:  npm run <name>'));

const listedNames = new Set();
for (const [title, names] of SECTIONS) {
  console.log('');
  console.log(magenta(`▸ ${title}`));
  for (const name of names) {
    printScript(name);
    listedNames.add(name);
  }
}

const orphans = Object.keys(scripts).filter((n) => !listedNames.has(n));
if (orphans.length > 0) {
  console.log('');
  console.log(magenta('▸ Other'));
  for (const name of orphans.sort()) printScript(name);
}

console.log('');
console.log(bold('See also:'));
console.log(`  ${cyan('cmd /c quality-check.bat --no-bail --json-output')}  runs quality check and writes report`);
console.log('');
