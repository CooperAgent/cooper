import { describe, expect, it } from 'vitest';
import { expandLocalPathShorthand, normalizeLocalPathPlatform } from './localPathSupport';

describe('localPathSupport', () => {
  it('normalizes unknown platforms to darwin-safe behavior', () => {
    expect(normalizeLocalPathPlatform('darwin')).toBe('darwin');
    expect(normalizeLocalPathPlatform('linux')).toBe('linux');
    expect(normalizeLocalPathPlatform('win32')).toBe('win32');
    expect(normalizeLocalPathPlatform('freebsd')).toBe('darwin');
  });

  it('expands ~/ paths on POSIX platforms', () => {
    expect(
      expandLocalPathShorthand('~/temp/folder-contents.docx', 'darwin', '/Users/idofrizler')
    ).toBe('/Users/idofrizler/temp/folder-contents.docx');
  });

  it('expands Windows home shorthand variants', () => {
    expect(expandLocalPathShorthand('~\\Documents\\notes.txt', 'win32', 'C:\\Users\\ido')).toBe(
      'C:\\Users\\ido\\Documents\\notes.txt'
    );
    expect(
      expandLocalPathShorthand('%USERPROFILE%\\Documents\\notes.txt', 'win32', 'C:\\Users\\ido')
    ).toBe('C:\\Users\\ido\\Documents\\notes.txt');
  });

  it('leaves unrelated paths unchanged', () => {
    expect(
      expandLocalPathShorthand('/Users/idofrizler/temp/file.txt', 'darwin', '/Users/idofrizler')
    ).toBe('/Users/idofrizler/temp/file.txt');
    expect(expandLocalPathShorthand('C:\\repo\\file.txt', 'win32', 'C:\\Users\\ido')).toBe(
      'C:\\repo\\file.txt'
    );
  });
});
