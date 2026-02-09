// Custom macOS code signing script for CI.
// Bypasses electron-builder's internal @electron/osx-sign which hangs on GitHub Actions.
// Scans the entire .app bundle for Mach-O binaries and signs them inside-out.

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * @param {import('electron-builder').CustomMacSign} context
 */
exports.default = async function sign(context) {
  console.log(`  • Custom sign context keys: ${Object.keys(context).join(', ')}`);

  const { appPath, entitlements, keychain, identity } = getSigningParams(context);

  if (!identity) {
    console.log('  • No signing identity found, skipping code signing');
    return;
  }

  console.log(`  • Custom sign: identity=${identity}`);
  console.log(`  • Custom sign: keychain=${keychain || 'default'}`);
  console.log(`  • Custom sign: entitlements=${entitlements}`);
  console.log(`  • Custom sign: scanning ${appPath} for signable binaries...`);

  // Collect everything that needs signing, categorized
  const plainBinaries = []; // .dylib, .so, .node, extensionless Mach-O
  const frameworkBundles = []; // .framework directories
  const appBundles = []; // .app directories (helpers, NOT the main app)

  walkForSignables(appPath, plainBinaries, frameworkBundles, appBundles);

  // Sort by path depth (deepest first) for inside-out signing
  const byDepthDesc = (a, b) => b.split(path.sep).length - a.split(path.sep).length;
  plainBinaries.sort(byDepthDesc);
  frameworkBundles.sort(byDepthDesc);
  appBundles.sort(byDepthDesc);

  console.log(
    `  • Found: ${plainBinaries.length} binaries, ${frameworkBundles.length} frameworks, ${appBundles.length} helper apps`
  );

  // 1. Sign all plain binaries (no entitlements, but hardened runtime + timestamp)
  for (const bin of plainBinaries) {
    codesign(bin, { identity, keychain, options: 'runtime' });
  }

  // 2. Sign framework bundles
  for (const fw of frameworkBundles) {
    codesign(fw, { identity, keychain, options: 'runtime' });
  }

  // 3. Sign helper .app bundles (with entitlements)
  for (const app of appBundles) {
    codesign(app, { identity, keychain, entitlements, options: 'runtime' });
  }

  // 4. Sign the main app bundle last
  codesign(appPath, { identity, keychain, entitlements, options: 'runtime' });

  console.log('  • Custom sign: complete');
};

/**
 * Recursively walk the .app bundle and collect all signable items.
 * Stops recursing into .app and .framework bundles (they are signed as a unit),
 * but still recurses INTO them to find nested binaries that must be signed first.
 */
function walkForSignables(appPath, plainBinaries, frameworkBundles, appBundles) {
  const walk = (dir) => {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isSymbolicLink()) {
        continue; // Never sign symlinks
      }

      if (entry.isDirectory()) {
        if (entry.name.endsWith('.framework')) {
          // Recurse into framework to sign its contents first, then record the bundle
          walk(fullPath);
          frameworkBundles.push(fullPath);
        } else if (entry.name.endsWith('.app') && fullPath !== appPath) {
          // Helper app — recurse into it, then record the bundle
          walk(fullPath);
          appBundles.push(fullPath);
        } else {
          walk(fullPath);
        }
      } else if (entry.isFile()) {
        if (isSignableBinary(fullPath)) {
          plainBinaries.push(fullPath);
        }
      }
    }
  };

  walk(appPath);
}

/**
 * Determine if a file is a Mach-O binary that needs signing.
 * Checks by extension first (fast path), then falls back to `file` command
 * for extensionless executables like ffmpeg and ShipIt.
 */
function isSignableBinary(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  // Known signable extensions
  if (['.dylib', '.so', '.node'].includes(ext)) {
    return true;
  }

  // Skip known non-binary extensions
  const skipExts = [
    '.js',
    '.json',
    '.ts',
    '.map',
    '.html',
    '.css',
    '.svg',
    '.png',
    '.jpg',
    '.jpeg',
    '.gif',
    '.ico',
    '.icns',
    '.plist',
    '.strings',
    '.nib',
    '.lproj',
    '.md',
    '.txt',
    '.yml',
    '.yaml',
    '.xml',
    '.sh',
    '.pak',
    '.dat',
    '.bin',
    '.asar',
    '.license',
    '.cfg',
    '.conf',
    '.ini',
    '.env',
    '.bak',
  ];
  if (skipExts.includes(ext)) {
    return false;
  }

  // For extensionless files or unknown extensions, check if it's actually Mach-O
  try {
    const output = execSync(`file -b "${filePath}"`, {
      encoding: 'utf-8',
      timeout: 5000,
    }).trim();
    return output.includes('Mach-O');
  } catch {
    return false;
  }
}

function getSigningParams(context) {
  const appPath = context.app || context.path || context.appPath;
  const entitlements = process.env.CSC_ENTITLEMENTS || null;
  const keychain = context.keychain || process.env.CSC_KEYCHAIN || null;

  let identity = null;
  if (typeof context.identity === 'string' && context.identity.length > 0) {
    identity = context.identity;
  } else if (process.env.CSC_NAME) {
    identity = process.env.CSC_NAME;
  }

  return { appPath, entitlements, keychain, identity };
}

function codesign(target, { identity, keychain, entitlements = null, options = null }) {
  const args = ['codesign', '--force', '--sign', identity, '--timestamp'];

  if (keychain) {
    args.push('--keychain', keychain);
  }
  if (entitlements) {
    args.push('--entitlements', entitlements);
  }
  if (options) {
    args.push('--options', options);
  }

  args.push(target);

  // Show relative path from the .app for readability
  const label = target.includes('.app/') ? target.split('.app/').pop() : path.basename(target);
  console.log(`  • codesign: ${label}`);

  try {
    execSync(args.map((a) => `"${a}"`).join(' '), {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120_000,
    });
  } catch (err) {
    const stderr = err.stderr ? err.stderr.toString() : '';
    if (stderr.includes('is already signed')) {
      return;
    }
    console.error(`  ✗ codesign failed for ${label}: ${stderr || err.message}`);
    throw err;
  }
}
