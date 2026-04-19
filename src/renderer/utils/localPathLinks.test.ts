import { describe, expect, it } from 'vitest';
import {
  isLocalAbsolutePath,
  splitTrailingPathPunctuation,
  toFileHref,
  tokenizeLocalPathText,
} from './localPathLinks';

describe('localPathLinks', () => {
  it('tokenizes POSIX absolute paths and preserves trailing punctuation', () => {
    expect(
      tokenizeLocalPathText('Created /Users/idofrizler/project/src/MessageItem.tsx.', 'darwin')
    ).toEqual([
      { type: 'text', value: 'Created ' },
      { type: 'path', value: '/Users/idofrizler/project/src/MessageItem.tsx' },
      { type: 'text', value: '.' },
    ]);
  });

  it('tokenizes Windows drive-letter paths', () => {
    expect(
      tokenizeLocalPathText('Updated C:\\Users\\ido\\project\\src\\MessageItem.tsx', 'win32')
    ).toEqual([
      { type: 'text', value: 'Updated ' },
      { type: 'path', value: 'C:\\Users\\ido\\project\\src\\MessageItem.tsx' },
    ]);
  });

  it('tokenizes Windows UNC paths', () => {
    expect(tokenizeLocalPathText('Shared \\\\server\\repo\\src\\MessageItem.tsx', 'win32')).toEqual(
      [
        { type: 'text', value: 'Shared ' },
        { type: 'path', value: '\\\\server\\repo\\src\\MessageItem.tsx' },
      ]
    );
  });

  it('does not linkify a Windows path on POSIX', () => {
    expect(
      tokenizeLocalPathText('Updated C:\\Users\\ido\\project\\src\\MessageItem.tsx', 'linux')
    ).toEqual([{ type: 'text', value: 'Updated C:\\Users\\ido\\project\\src\\MessageItem.tsx' }]);
  });

  it('tokenizes ~/ home-relative paths on POSIX', () => {
    expect(tokenizeLocalPathText('Saved ~/temp/folder-contents.docx', 'darwin')).toEqual([
      { type: 'text', value: 'Saved ' },
      { type: 'path', value: '~/temp/folder-contents.docx' },
    ]);
  });

  it('tokenizes %USERPROFILE% paths on Windows', () => {
    expect(
      tokenizeLocalPathText('Saved %USERPROFILE%\\Documents\\folder-contents.docx', 'win32')
    ).toEqual([
      { type: 'text', value: 'Saved ' },
      { type: 'path', value: '%USERPROFILE%\\Documents\\folder-contents.docx' },
    ]);
  });

  it('does not linkify URLs as local paths', () => {
    expect(tokenizeLocalPathText('See https://github.com/CooperAgent/cooper', 'darwin')).toEqual([
      { type: 'text', value: 'See https://github.com/CooperAgent/cooper' },
    ]);
  });

  it('detects exact absolute paths for inline code handling', () => {
    expect(isLocalAbsolutePath('/Users/idofrizler/project/src/MessageItem.tsx', 'darwin')).toBe(
      true
    );
    expect(isLocalAbsolutePath('~/temp/folder-contents.docx', 'darwin')).toBe(true);
    expect(isLocalAbsolutePath('%USERPROFILE%\\Documents\\notes.txt', 'win32')).toBe(true);
    expect(isLocalAbsolutePath('src/renderer/components/MessageItem.tsx', 'darwin')).toBe(false);
  });

  it('trims trailing punctuation only when the remaining value is still a valid path', () => {
    expect(splitTrailingPathPunctuation('/Users/idofrizler/project/file.ts)', 'darwin')).toEqual({
      path: '/Users/idofrizler/project/file.ts',
      trailing: ')',
    });
    expect(splitTrailingPathPunctuation('/not-a-path)', 'darwin')).toEqual({
      path: '/not-a-path',
      trailing: ')',
    });
  });

  it('builds file hrefs for each supported platform', () => {
    expect(toFileHref('/Users/idofrizler/project/file.ts', 'darwin')).toBe(
      'file:///Users/idofrizler/project/file.ts'
    );
    expect(toFileHref('~/temp/folder-contents.docx', 'darwin', '/Users/idofrizler')).toBe(
      'file:///Users/idofrizler/temp/folder-contents.docx'
    );
    expect(toFileHref('C:\\Users\\ido\\project\\file.ts', 'win32')).toBe(
      'file:///C:/Users/ido/project/file.ts'
    );
    expect(toFileHref('%USERPROFILE%\\Documents\\notes.txt', 'win32', 'C:\\Users\\ido')).toBe(
      'file:///C:/Users/ido/Documents/notes.txt'
    );
    expect(toFileHref('\\\\server\\repo\\file.ts', 'win32')).toBe('file://server/repo/file.ts');
  });
});
