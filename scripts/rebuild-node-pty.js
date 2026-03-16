#!/usr/bin/env node
const { spawn, spawnSync } = require('child_process');

function commandExistsOnPath(commandName) {
  const result = spawnSync('where', [commandName], {
    windowsHide: true,
    stdio: 'pipe',
    encoding: 'utf8',
  });
  return result.status === 0 && Boolean(result.stdout.trim());
}

function hasConfirmedWindowsBuildTools() {
  if (process.platform !== 'win32') {
    return true;
  }

  const hasMsvcEnvironment = Boolean(process.env.VCINSTALLDIR || process.env.VisualStudioVersion);
  const hasCompilerOnPath = commandExistsOnPath('cl.exe');
  const hasMsbuildOnPath = commandExistsOnPath('msbuild.exe');
  return hasMsvcEnvironment || hasCompilerOnPath || hasMsbuildOnPath;
}

const couldNotConfirmWindowsBuildTools = !hasConfirmedWindowsBuildTools();
let printedWindowsBuildToolsHint = false;

function printWindowsBuildToolsHint() {
  if (printedWindowsBuildToolsHint || process.platform !== 'win32') {
    return;
  }
  printedWindowsBuildToolsHint = true;

  if (couldNotConfirmWindowsBuildTools) {
    console.warn('\n⚠ Could not confirm Windows C++ build tools from current shell.');
    console.warn('If rebuild fails, run scripts\\setup-windows.ps1 and retry npm install.');
  }
}

const rebuildArgs = ['@electron/rebuild', '-w', 'node-pty', ...process.argv.slice(2)];
const child =
  process.platform === 'win32'
    ? spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npx', ...rebuildArgs], {
        stdio: 'inherit',
      })
    : spawn('npx', rebuildArgs, { stdio: 'inherit' });

const startedAt = Date.now();
let heartbeat = null;
if (process.platform === 'win32') {
  console.log('ℹ Rebuilding node-pty for Electron on Windows (this can take several minutes).');
  heartbeat = setInterval(() => {
    const elapsedSeconds = Math.floor((Date.now() - startedAt) / 1000);
    console.log(`ℹ Still rebuilding node-pty... ${elapsedSeconds}s elapsed`);
  }, 30000);
}

const timeout = setTimeout(
  () => {
    console.error('\n✗ node-pty rebuild timed out after 20 minutes.');
    console.error('If this keeps happening, run scripts\\setup-windows.ps1 and retry.');
    printWindowsBuildToolsHint();
    child.kill();
    process.exit(1);
  },
  20 * 60 * 1000
);

child.on('exit', (code, signal) => {
  clearTimeout(timeout);
  if (heartbeat) {
    clearInterval(heartbeat);
  }

  if (signal) {
    printWindowsBuildToolsHint();
    process.exit(1);
  }
  if (code !== 0) {
    printWindowsBuildToolsHint();
  }
  process.exit(code ?? 1);
});

child.on('error', (error) => {
  clearTimeout(timeout);
  if (heartbeat) {
    clearInterval(heartbeat);
  }
  console.error(`\n✗ Failed to run electron rebuild: ${error.message}`);
  printWindowsBuildToolsHint();
  process.exit(1);
});
