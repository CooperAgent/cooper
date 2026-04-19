import { expandLocalPathShorthand, LocalPathPlatform } from '../../shared/localPathSupport';

export interface LocalPathToken {
  type: 'text' | 'path';
  value: string;
}

const POSIX_SEGMENT = `[^\\s<>"'\`\\[\\]\\{\\}\\(\\)]+`;
const WINDOWS_SEGMENT = `[^\\s<>:"'\`|?*\\\\/]+`;
const WINDOWS_HOST_SEGMENT = `[^\\s<>:"'\`|?*\\\\/]+`;

const POSIX_EXACT_PATH = new RegExp(`^/${POSIX_SEGMENT}(?:/${POSIX_SEGMENT})*/?$`);
const POSIX_HOME_EXACT_PATH = new RegExp(`^~/${POSIX_SEGMENT}(?:/${POSIX_SEGMENT})*/?$`);
const WINDOWS_DRIVE_EXACT_PATH = new RegExp(
  `^[A-Za-z]:[\\\\/](?:${WINDOWS_SEGMENT}(?:[\\\\/]${WINDOWS_SEGMENT})*)?[\\\\/]?$`
);
const WINDOWS_UNC_EXACT_PATH = new RegExp(
  `^\\\\\\\\${WINDOWS_HOST_SEGMENT}[\\\\/]${WINDOWS_HOST_SEGMENT}(?:[\\\\/]${WINDOWS_SEGMENT})*[\\\\/]?$`
);
const WINDOWS_HOME_EXACT_PATH = new RegExp(
  `^~[\\\\/](?:${WINDOWS_SEGMENT}(?:[\\\\/]${WINDOWS_SEGMENT})*)?[\\\\/]?$`
);
const WINDOWS_USERPROFILE_EXACT_PATH = new RegExp(
  `^%USERPROFILE%(?:[\\\\/](?:${WINDOWS_SEGMENT}(?:[\\\\/]${WINDOWS_SEGMENT})*)?)?[\\\\/]?$`,
  'i'
);

const POSIX_MATCHER = new RegExp(
  `(^|[\\s([{"'])((?:${POSIX_EXACT_PATH.source.slice(1, -1)})|(?:${POSIX_HOME_EXACT_PATH.source.slice(1, -1)}))`,
  'g'
);
const WINDOWS_MATCHER = new RegExp(
  `(^|[\\s([{"'])((?:${WINDOWS_DRIVE_EXACT_PATH.source.slice(1, -1)})|(?:${WINDOWS_UNC_EXACT_PATH.source.slice(1, -1)})|(?:${WINDOWS_HOME_EXACT_PATH.source.slice(1, -1)})|(?:${WINDOWS_USERPROFILE_EXACT_PATH.source.slice(1, -1)}))`,
  'g'
);

const TRAILING_PATH_PUNCTUATION = new Set(['.', ',', ':', ';', '!', '?', ')', ']', '}', '"', "'"]);

function getMatcher(platform: LocalPathPlatform): RegExp {
  return platform === 'win32' ? WINDOWS_MATCHER : POSIX_MATCHER;
}

export function isLocalAbsolutePath(path: string, platform: LocalPathPlatform): boolean {
  const candidate = path.trim();

  if (!candidate) {
    return false;
  }

  if (platform === 'win32') {
    return (
      WINDOWS_DRIVE_EXACT_PATH.test(candidate) ||
      WINDOWS_UNC_EXACT_PATH.test(candidate) ||
      WINDOWS_HOME_EXACT_PATH.test(candidate) ||
      WINDOWS_USERPROFILE_EXACT_PATH.test(candidate)
    );
  }

  return POSIX_EXACT_PATH.test(candidate) || POSIX_HOME_EXACT_PATH.test(candidate);
}

export function splitTrailingPathPunctuation(
  value: string,
  platform: LocalPathPlatform
): { path: string; trailing: string } {
  let path = value;
  let trailing = '';

  while (path.length > 0 && TRAILING_PATH_PUNCTUATION.has(path[path.length - 1])) {
    trailing = `${path[path.length - 1]}${trailing}`;
    path = path.slice(0, -1);
  }

  if (!isLocalAbsolutePath(path, platform)) {
    return { path: value, trailing: '' };
  }

  return { path, trailing };
}

export function tokenizeLocalPathText(text: string, platform: LocalPathPlatform): LocalPathToken[] {
  const matcher = getMatcher(platform);
  matcher.lastIndex = 0;

  const tokens: LocalPathToken[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(matcher)) {
    const prefix = match[1] ?? '';
    const candidate = match[2] ?? '';
    const matchIndex = match.index ?? 0;
    const pathStart = matchIndex + prefix.length;
    const { path, trailing } = splitTrailingPathPunctuation(candidate, platform);

    if (!isLocalAbsolutePath(path, platform)) {
      continue;
    }

    if (lastIndex < pathStart) {
      tokens.push({ type: 'text', value: text.slice(lastIndex, pathStart) });
    }

    tokens.push({ type: 'path', value: path });

    if (trailing) {
      tokens.push({ type: 'text', value: trailing });
    }

    lastIndex = pathStart + candidate.length;
  }

  if (lastIndex < text.length) {
    tokens.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return tokens.length > 0 ? mergeAdjacentTextTokens(tokens) : [{ type: 'text', value: text }];
}

export function toFileHref(path: string, platform: LocalPathPlatform, homePath?: string): string {
  const resolvedPath = expandLocalPathShorthand(path, platform, homePath ?? '');

  if (platform === 'win32') {
    if (resolvedPath.startsWith('\\\\')) {
      return encodeURI(`file:${resolvedPath.replace(/\\/g, '/')}`);
    }

    if (WINDOWS_DRIVE_EXACT_PATH.test(resolvedPath)) {
      return encodeURI(`file:///${resolvedPath.replace(/\\/g, '/')}`);
    }

    return '#';
  }

  if (POSIX_EXACT_PATH.test(resolvedPath)) {
    return encodeURI(`file://${resolvedPath}`);
  }

  return '#';
}

function mergeAdjacentTextTokens(tokens: LocalPathToken[]): LocalPathToken[] {
  return tokens.reduce<LocalPathToken[]>((merged, token) => {
    const previous = merged[merged.length - 1];

    if (token.type === 'text' && previous?.type === 'text') {
      previous.value += token.value;
      return merged;
    }

    merged.push({ ...token });
    return merged;
  }, []);
}
