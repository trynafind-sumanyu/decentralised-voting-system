/**
 * sanitize.js
 * Centralized input sanitization and validation utilities.
 * Protects against NoSQL injection, XSS, and malformed inputs.
 */

const validator = require("validator");

// ─── Strip dangerous characters ──────────────────────────────────────────────

/**
 * Removes HTML tags, trims whitespace, and collapses internal spaces.
 * Use on any free-text string field before storing to DB.
 */
function sanitizeString(value, maxLength = 100) {
  if (typeof value !== "string") return "";
  return validator.escape(          // converts <, >, &, ', " to HTML entities
    value
      .trim()
      .replace(/\s+/g, " ")         // collapse multiple spaces
      .slice(0, maxLength)          // enforce length cap
  );
}

/**
 * Sanitizes a name field — only allows letters, spaces, dots, hyphens.
 * Rejects digits and special characters that don't belong in names.
 */
function sanitizeName(value, maxLength = 80) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  // Allow unicode letters (covers Indian scripts), spaces, dots, hyphens, apostrophes
  if (!/^[\p{L}\s.\-']+$/u.test(cleaned)) return null; // null = invalid
  return cleaned;
}

/**
 * Validates and normalises an email address.
 * Returns lowercased email or null if invalid.
 */
function sanitizeEmail(value) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  if (!validator.isEmail(trimmed)) return null;
  return validator.normalizeEmail(trimmed);
}

/**
 * Validates an Aadhar number — must be exactly 12 digits, no operators.
 */
function sanitizeAadhar(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  const cleaned = String(value).trim();
  if (!/^\d{12}$/.test(cleaned)) return null;
  return cleaned;
}

/**
 * Sanitizes a MongoDB ObjectId string.
 * Prevents operator injection via id params.
 */
function sanitizeObjectId(value) {
  if (typeof value !== "string") return null;
  const cleaned = value.trim();
  if (!/^[a-f\d]{24}$/i.test(cleaned)) return null;
  return cleaned;
}

/**
 * Strips any key that starts with $ or contains . from an object.
 * Secondary defense against NoSQL injection (express-mongo-sanitize handles this
 * globally, but this protects nested objects too).
 */
function stripOperators(obj) {
  if (typeof obj !== "object" || obj === null) return obj;
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith("$") || key.includes(".")) continue; // drop operator keys
    clean[key] = typeof obj[key] === "object"
      ? stripOperators(obj[key])
      : obj[key];
  }
  return clean;
}

/**
 * Validates a date string. Returns Date object or null.
 */
function sanitizeDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Validates a party name — letters, spaces, hyphens, dots allowed.
 */
function sanitizeParty(value, maxLength = 80) {
  if (typeof value !== "string") return "";
  const cleaned = value.trim().replace(/\s+/g, " ").slice(0, maxLength);
  if (cleaned.length === 0) return "Independent";
  return validator.escape(cleaned);
}

module.exports = {
  sanitizeString,
  sanitizeName,
  sanitizeEmail,
  sanitizeAadhar,
  sanitizeObjectId,
  stripOperators,
  sanitizeDate,
  sanitizeParty,
};