/**
 * @fileoverview Cross-platform dialogs (react-native-web has no Alert, so buttons never fire there).
 *
 * @module shared/lib/notify
 * @author Evelin Brandão Cordeiro
 * @copyright 2026 Anicca. All rights reserved.
 * @license MIT
 */

import { Alert, Platform } from 'react-native';

type BrowserDialogs = { alert?: (text: string) => void; confirm?: (text: string) => boolean };
const browser = globalThis as BrowserDialogs;

export function notify(title: string, message: string): void {
  if (Platform.OS === 'web') {
    browser.alert?.(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message, [{ text: 'OK' }]);
  }
}

/** Asks for confirmation before a destructive action. Resolves `true` when confirmed. */
export function confirmAction(title: string, message: string, confirmText = 'Confirmar'): Promise<boolean> {
  if (Platform.OS === 'web') {
    return Promise.resolve(browser.confirm?.(`${title}\n\n${message}`) ?? true);
  }
  return new Promise(resolve => {
    Alert.alert(title, message, [
      { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
      { text: confirmText, style: 'destructive', onPress: () => resolve(true) },
    ]);
  });
}
