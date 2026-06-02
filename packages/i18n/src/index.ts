// ─────────────────────────────────────────────────────────────────────────────
// @anicca/i18n — Main export
// ─────────────────────────────────────────────────────────────────────────────

import common from './locales/pt-BR/common.json';
import onboarding from './locales/pt-BR/onboarding.json';
import hub from './locales/pt-BR/hub.json';
import bodyMap from './locales/pt-BR/body-map.json';
import ctcae from './locales/pt-BR/ctcae.json';
import routine from './locales/pt-BR/routine.json';
import rights from './locales/pt-BR/rights.json';
import lgpd from './locales/pt-BR/lgpd.json';

export const ptBR = {
  common,
  onboarding,
  hub,
  bodyMap,
  ctcae,
  routine,
  rights,
  lgpd,
};

/** Simple translation helper — use with nested keys */
export function t(
  keyPath: string,
  vars?: Record<string, string | number>
): string {
  const keys = keyPath.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let result: any = ptBR;

  for (const key of keys) {
    result = result?.[key];
    if (result === undefined) {
      console.warn(`[i18n] Missing key: ${keyPath}`);
      return keyPath;
    }
  }

  if (typeof result !== 'string') {
    console.warn(`[i18n] Key is not a string: ${keyPath}`);
    return keyPath;
  }

  if (vars) {
    return result.replace(/\{\{(\w+)\}\}/g, (_, key: string) =>
      String(vars[key] ?? `{{${key}}}`)
    );
  }

  return result;
}

export type I18nNamespace = keyof typeof ptBR;
