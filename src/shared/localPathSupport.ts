export type LocalPathPlatform = 'darwin' | 'linux' | 'win32';

export function normalizeLocalPathPlatform(platform: string): LocalPathPlatform {
  return platform === 'win32' || platform === 'linux' ? platform : 'darwin';
}

export function expandLocalPathShorthand(
  value: string,
  platform: LocalPathPlatform,
  homePath: string
): string {
  if (!homePath) {
    return value;
  }

  if (platform === 'win32') {
    if (/^~[\\/]/.test(value)) {
      return joinWithHome(homePath, value.slice(2), platform);
    }

    if (/^%USERPROFILE%(?:[\\/]|$)/i.test(value)) {
      return joinWithHome(homePath, value.slice('%USERPROFILE%'.length), platform);
    }

    return value;
  }

  if (value.startsWith('~/')) {
    return joinWithHome(homePath, value.slice(2), platform);
  }

  return value;
}

function joinWithHome(homePath: string, remainder: string, platform: LocalPathPlatform): string {
  const separator = platform === 'win32' ? '\\' : '/';
  const normalizedHome = homePath.replace(/[\\/]+$/, '');
  const trimmedRemainder = remainder.replace(/^[\\/]+/, '');

  if (!trimmedRemainder) {
    return normalizedHome;
  }

  return `${normalizedHome}${separator}${trimmedRemainder.replace(/[\\/]+/g, separator)}`;
}
