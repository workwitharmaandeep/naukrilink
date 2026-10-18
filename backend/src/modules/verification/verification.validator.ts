/**
 * Statutory Verification Format & Checksum Validators for Indian Regulatory Identifiers (GSTIN & CIN)
 */

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

const GST_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';

/**
 * Validates GSTIN format and MOD-36 Checksum as defined by the Goods and Services Tax Network (GSTN).
 */
export function validateGstin(gstin: string): { isValid: boolean; reason?: string } {
  if (!gstin) {
    return { isValid: false, reason: 'GSTIN is required' };
  }

  const cleaned = gstin.trim().toUpperCase();

  if (cleaned.length !== 15) {
    return { isValid: false, reason: 'GSTIN must be exactly 15 characters in length' };
  }

  if (!GSTIN_REGEX.test(cleaned)) {
    return { isValid: false, reason: 'GSTIN does not match standard statutory pattern (e.g. 22AAAAA0000A1Z5)' };
  }

  // Mod-36 Checksum verification
  const checkDigitChar = cleaned[14];
  let factor = 1;
  let sum = 0;

  for (let i = 0; i < 14; i++) {
    const char = cleaned[i];
    const codePoint = GST_CHARS.indexOf(char);
    let digit = codePoint * factor;
    factor = factor === 1 ? 2 : 1;
    digit = Math.floor(digit / 36) + (digit % 36);
    sum += digit;
  }

  const remainder = sum % 36;
  const computedCheckDigit = (36 - remainder) % 36;
  const computedChar = GST_CHARS[computedCheckDigit];

  // If checksum character matches, it is authentic
  if (computedChar !== checkDigitChar) {
    // Flag warning: checksum mismatch
    return { isValid: false, reason: `Invalid GSTIN checksum digit. Expected '${computedChar}', found '${checkDigitChar}'` };
  }

  return { isValid: true };
}

/**
 * Validates Corporate Identification Number (CIN) format as mandated by Ministry of Corporate Affairs (MCA).
 */
export function validateCin(cin: string): { isValid: boolean; reason?: string } {
  if (!cin) {
    return { isValid: false, reason: 'CIN is required' };
  }

  const cleaned = cin.trim().toUpperCase();

  if (cleaned.length !== 21) {
    return { isValid: false, reason: 'CIN must be exactly 21 characters in length' };
  }

  if (!CIN_REGEX.test(cleaned)) {
    return { isValid: false, reason: 'CIN does not match MCA statutory format (e.g. U72200MH2020PTC123456)' };
  }

  const yearStr = cleaned.substring(8, 12);
  const year = parseInt(yearStr, 10);
  const currentYear = new Date().getFullYear();

  if (year < 1850 || year > currentYear + 1) {
    return { isValid: false, reason: `Invalid incorporation year '${year}' in CIN` };
  }

  return { isValid: true };
}

/**
 * Verifies domain match between company email and website domain.
 */
export function validateEmailDomainMatch(email: string, websiteUrl: string): boolean {
  try {
    const emailDomain = email.split('@')[1]?.toLowerCase();
    const url = new URL(websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`);
    const webHostname = url.hostname.toLowerCase().replace(/^www\./, '');

    if (!emailDomain || !webHostname) return false;

    return emailDomain === webHostname || emailDomain.endsWith(`.${webHostname}`);
  } catch {
    return false;
  }
}
