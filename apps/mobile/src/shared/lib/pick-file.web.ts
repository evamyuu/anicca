/**
 * @fileoverview Browser file picker (PDF uploads in Docs). Native uses `pick-file.ts`.
 *
 * @module shared/lib/pick-file
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import type { PickedFile } from './pick-file.types';

/* The mobile tsconfig has no DOM lib, so only the bits used here are typed. */
interface BrowserFile { name: string; type: string }
interface FileInput {
  type: string;
  accept: string;
  files: BrowserFile[] | null;
  onchange: (() => void) | null;
  click: () => void;
}
interface BrowserGlobals {
  document: { createElement: (tag: 'input') => FileInput };
  URL: { createObjectURL: (file: BrowserFile) => string };
}

export function pickFile(accept: string): Promise<PickedFile | null> {
  const { document, URL } = globalThis as unknown as BrowserGlobals;
  return new Promise(resolve => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.onchange = () => {
      const file = input.files?.[0];
      resolve(file ? { uri: URL.createObjectURL(file), name: file.name, type: file.type || 'application/octet-stream' } : null);
    };
    input.click();
  });
}
