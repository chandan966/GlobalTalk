/**
 * Sanitizes user-provided text by normalizing Unicode, removing ASCII control characters,
 * and stripping Unicode bidirectional override characters that can be used for text-spoofing attacks.
 *
 * @param {string} value The raw string to sanitize.
 * @param {number} [maxLength=500] Maximum length of the returned string.
 * @returns {string} Sanitized string.
 */
export function sanitizeText(value, maxLength = 500) {
  if (typeof value !== 'string') return '';

  return (
    value
      .normalize('NFC')
      // Remove null bytes, control codes, and directional override characters
      .replace(/[\u0000-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/g, '')
      .trim()
      .slice(0, maxLength)
  );
}

export default sanitizeText;
