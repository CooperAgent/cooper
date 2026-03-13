const { spawnSync } = require('child_process');

const RTK_INSTALL_URL = 'https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh';

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    stdio: 'inherit',
    env: process.env,
    ...options,
  });
}

function commandExists(command) {
  const check = spawnSync('sh', ['-c', `command -v ${command}`], {
    stdio: 'ignore',
    env: process.env,
  });
  return check.status === 0;
}

function hasWorkingRtk() {
  const version = spawnSync('rtk', ['--version'], { stdio: 'ignore', env: process.env });
  if (version.status !== 0) return false;
  const gain = spawnSync('rtk', ['gain'], { stdio: 'ignore', env: process.env });
  return gain.status === 0;
}

function main() {
  if (process.env.COOPER_SKIP_RTK_INSTALL === '1') {
    console.log('[rtk] Skipping RTK install (COOPER_SKIP_RTK_INSTALL=1).');
    return;
  }

  if (hasWorkingRtk()) {
    console.log('[rtk] RTK already installed.');
    return;
  }

  if (process.platform === 'win32') {
    console.log('[rtk] Auto-install is not configured for Windows.');
    console.log('[rtk] Install manually: https://github.com/rtk-ai/rtk#installation');
    return;
  }

  console.log('[rtk] RTK not found. Installing...');
  let installResult;
  if (process.platform === 'darwin' && commandExists('brew')) {
    installResult = run('brew', ['install', 'rtk']);
  } else if (commandExists('curl')) {
    installResult = run('sh', ['-c', `curl -fsSL ${RTK_INSTALL_URL} | sh`]);
  } else {
    console.log('[rtk] curl is not available; cannot auto-install RTK.');
    console.log('[rtk] Install manually: https://github.com/rtk-ai/rtk#installation');
    return;
  }

  if (installResult.status !== 0) {
    console.log('[rtk] RTK install command failed. Continuing without blocking npm install.');
    return;
  }

  if (hasWorkingRtk()) {
    console.log('[rtk] RTK installed successfully.');
  } else {
    console.log('[rtk] RTK install completed but verification failed; continuing.');
  }
}

main();
