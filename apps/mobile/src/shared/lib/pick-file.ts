/**
 * @fileoverview Native fallback for the file picker — there is no document picker
 * installed, so native uploads go through the camera/gallery option instead.
 *
 * @module shared/lib/pick-file
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { notify } from './notify';
import type { PickedFile } from './pick-file.types';

export function pickFile(_accept: string): Promise<PickedFile | null> {
  notify('Upload de PDF', 'No celular, use "Tirar foto ou enviar imagem" para enviar o exame.');
  return Promise.resolve(null);
}
