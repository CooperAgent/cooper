const fs = require('fs');
const path = require('path');

const MB = 1024 * 1024;
const KB = 1024;
const BASELINE_PATH = path.join('scripts', 'bundle-size-baseline.json');

const budgets = [
  {
    label: 'main',
    directory: path.join('out', 'main'),
    prefix: 'index',
    extension: '.js',
    maxBytes: 0.95 * MB,
  },
  {
    label: 'preload',
    directory: path.join('out', 'preload'),
    prefix: 'index',
    extension: '.js',
    maxBytes: 30 * KB,
  },
  {
    label: 'renderer-index',
    directory: path.join('out', 'renderer', 'assets'),
    prefix: 'index-',
    extension: '.js',
    maxBytes: 1.35 * MB,
  },
  {
    label: 'renderer-markdown',
    directory: path.join('out', 'renderer', 'assets'),
    prefix: 'markdown-',
    extension: '.js',
    maxBytes: 420 * KB,
  },
];

const baselineGrowthLimits = {
  main: 80 * KB,
  preload: 4 * KB,
  'renderer-index': 120 * KB,
  'renderer-markdown': 40 * KB,
};

function findBundleFile(directory, prefix, extension) {
  const entries = fs.readdirSync(directory, { withFileTypes: true });
  const matches = entries.filter(
    (entry) =>
      entry.isFile() &&
      entry.name.startsWith(prefix) &&
      (!extension || entry.name.endsWith(extension))
  );
  if (matches.length === 0) {
    throw new Error(`No bundle file found for prefix "${prefix}" in "${directory}"`);
  }
  matches.sort((a, b) => a.name.localeCompare(b.name));
  return matches[matches.length - 1].name;
}

function formatBytes(bytes) {
  if (bytes >= MB) return `${(bytes / MB).toFixed(2)} MB`;
  return `${(bytes / KB).toFixed(2)} KB`;
}

function collectCurrentSizes() {
  const sizes = {};
  for (const budget of budgets) {
    const fileName = findBundleFile(budget.directory, budget.prefix, budget.extension);
    const fullPath = path.join(budget.directory, fileName);
    sizes[budget.label] = {
      fileName,
      sizeBytes: fs.statSync(fullPath).size,
    };
  }
  return sizes;
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) return null;
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf-8'));
}

const args = new Set(process.argv.slice(2));
const shouldWriteBaseline = args.has('--write-baseline');
const shouldCompareBaseline = args.has('--compare-baseline') || !shouldWriteBaseline;

const current = collectCurrentSizes();
let hasFailure = false;

console.log('Bundle size guardrail results:');
for (const budget of budgets) {
  const currentEntry = current[budget.label];
  const withinBudget = currentEntry.sizeBytes <= budget.maxBytes;

  console.log(
    `- ${budget.label}: ${formatBytes(currentEntry.sizeBytes)} (budget ${formatBytes(budget.maxBytes)}) [${withinBudget ? 'OK' : 'FAIL'}]`
  );

  if (!withinBudget) hasFailure = true;
}

if (shouldCompareBaseline) {
  const baseline = readBaseline();
  if (!baseline) {
    console.warn(`No baseline file found at ${BASELINE_PATH}; skipping baseline comparison.`);
  } else {
    console.log('Baseline comparison:');
    for (const budget of budgets) {
      const label = budget.label;
      const baselineEntry = baseline[label];
      if (!baselineEntry) continue;

      const delta = current[label].sizeBytes - baselineEntry.sizeBytes;
      const maxGrowth = baselineGrowthLimits[label] ?? 0;
      const withinGrowth = delta <= maxGrowth;

      console.log(
        `- ${label}: ${delta >= 0 ? '+' : ''}${formatBytes(delta)} vs baseline (${formatBytes(maxGrowth)} allowed) [${withinGrowth ? 'OK' : 'FAIL'}]`
      );

      if (!withinGrowth) hasFailure = true;
    }
  }
}

if (shouldWriteBaseline) {
  const baselineDir = path.dirname(BASELINE_PATH);
  if (!fs.existsSync(baselineDir)) {
    fs.mkdirSync(baselineDir, { recursive: true });
  }
  const baselinePayload = {};
  for (const budget of budgets) {
    baselinePayload[budget.label] = current[budget.label];
  }
  fs.writeFileSync(BASELINE_PATH, JSON.stringify(baselinePayload, null, 2) + '\n', 'utf-8');
  console.log(`Wrote bundle baseline to ${BASELINE_PATH}`);
}

if (hasFailure) {
  process.exitCode = 1;
  console.error(
    'Bundle size guardrail failed. Reduce bundle growth or adjust budgets intentionally.'
  );
}
