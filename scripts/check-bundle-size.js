const fs = require('fs');
const path = require('path');

const MB = 1024 * 1024;
const KB = 1024;

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

let hasFailure = false;

console.log('Bundle size guardrail results:');
for (const budget of budgets) {
  const fileName = findBundleFile(budget.directory, budget.prefix, budget.extension);
  const fullPath = path.join(budget.directory, fileName);
  const sizeBytes = fs.statSync(fullPath).size;
  const withinBudget = sizeBytes <= budget.maxBytes;

  console.log(
    `- ${budget.label}: ${formatBytes(sizeBytes)} (budget ${formatBytes(budget.maxBytes)}) [${withinBudget ? 'OK' : 'FAIL'}]`
  );

  if (!withinBudget) {
    hasFailure = true;
  }
}

if (hasFailure) {
  process.exitCode = 1;
  console.error(
    'Bundle size guardrail failed. Reduce bundle growth or adjust budgets intentionally.'
  );
}
