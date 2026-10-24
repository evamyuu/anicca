/**
 * @fileoverview Shape returned by the platform file pickers.
 *
 * @module shared/lib/pick-file.types
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

export interface PickedFile {
  uri: string;
  name: string;
  type: string;
}
