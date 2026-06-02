// ─────────────────────────────────────────────────────────────────────────────
// Phone Utilities — Brazilian phone number formatting
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Format a Brazilian phone number for display.
 * Handles both mobile (9 digits) and landline (8 digits).
 * @example "+5511999999999" → "(11) 99999-9999"
 */
export function formatPhonePtBr(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  // Remove country code 55 if present
  const local = digits.startsWith('55') ? digits.slice(2) : digits;

  if (local.length === 11) {
    // Mobile: DDD (2) + 9 digits
    return `(${local.slice(0, 2)}) ${local.slice(2, 7)}-${local.slice(7)}`;
  }
  if (local.length === 10) {
    // Landline: DDD (2) + 8 digits
    return `(${local.slice(0, 2)}) ${local.slice(2, 6)}-${local.slice(6)}`;
  }

  return phone; // Return as-is if can't format
}

/**
 * Convert a Brazilian phone number to WhatsApp E.164 format.
 * @example "(11) 99999-9999" → "+5511999999999"
 */
export function phoneToWhatsappE164(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('55')) return `+${digits}`;
  return `+55${digits}`;
}

/**
 * Validate a Brazilian mobile phone number.
 * Mobile numbers have 11 digits locally (DDD + 9-digit number starting with 9).
 */
export function validateBrazilianMobile(phone: string): boolean {
  const digits = phone.replace(/\D/g, '');
  const local = digits.startsWith('55') ? digits.slice(2) : digits;
  return local.length === 11 && local[2] === '9';
}
