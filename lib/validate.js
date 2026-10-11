// These helpers are a defense-in-depth layer on top of the parameterized
// queries already used everywhere via mysql2 (`?` placeholders passed as a
// separate params array). Parameterized queries are what actually prevents
// SQL injection — user input is never concatenated into SQL strings in this
// codebase. These helpers additionally reject malformed/oversized input
// before it ever reaches a query, which stops other classes of abuse
// (huge payloads, garbage IDs, unexpected types) even though it isn't
// strictly required to stop SQL injection on its own.

export function toPositiveInt(value) {
  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : null;
}

export function isNonEmptyString(value, maxLength = 255) {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength;
}

export function isValidEmail(value) {
  return typeof value === 'string' && value.length <= 190 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function isOneOf(value, allowed) {
  return allowed.includes(value);
}

export function isValidDateString(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

export function isValidTimeString(value) {
  return typeof value === 'string' && /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

export function clampString(value, maxLength = 1000) {
  if (typeof value !== 'string') return null;
  return value.slice(0, maxLength);
}
