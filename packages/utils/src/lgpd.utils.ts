// ─────────────────────────────────────────────────────────────────────────────
// LGPD Utilities
// Pseudonymization, hashing — NEVER stores raw PII
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Hash a string using SHA-256 with a salt.
 * Used for pseudonymizing CPF, CNS, and names.
 *
 * NOTE: This is a browser/Node compatible implementation.
 * For React Native, use the crypto module or a library like crypto-js.
 */
export async function hashWithSalt(value: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${salt}:${value}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Generate a consistent anonymous ID from a phone number.
 * Used to create pseudonymized user IDs for WhatsApp users.
 */
export async function phoneToAnonymousId(
  phone: string,
  appSalt: string
): Promise<string> {
  // Normalize phone: remove all non-digits
  const normalized = phone.replace(/\D/g, '');
  return hashWithSalt(normalized, appSalt);
}

/**
 * Validate a Brazilian CPF number.
 * This is for validation ONLY — never store the raw CPF.
 * @returns true if CPF is valid
 */
export function validateCpf(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false; // All same digits

  const calcDigit = (str: string, weights: number[]): number => {
    const sum = str
      .split('')
      .reduce((acc, digit, i) => acc + parseInt(digit, 10) * (weights[i] ?? 0), 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calcDigit(cleaned.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calcDigit(cleaned.slice(0, 10), [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);

  return parseInt(cleaned[9]!, 10) === digit1 && parseInt(cleaned[10]!, 10) === digit2;
}

/**
 * Format CPF for display only: 000.000.000-00
 * NEVER store or transmit formatted CPF — only use for display.
 */
export function formatCpfForDisplay(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Mask CPF for display (shows only last 2 digits): ***.***.***.XX
 * Use this when showing CPF confirmation to user.
 */
export function maskCpf(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return `***.***.***.${cleaned.slice(-2)}`;
}
