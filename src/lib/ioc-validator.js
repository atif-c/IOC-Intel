/**
 * IOC Validator Utility
 * Validates common indicators of compromise:
 * - IPv4
 * - IPv6
 * - Hashes (MD5, SHA1, SHA256)
 * - URL (HTTP/HTTPS only)
 */

// Regex patterns extracted as constants for clarity, reuse, and performance
const IPV4_PATTERN =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){2}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

const IPV6_PATTERN =
    /^(([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}|(([0-9a-f]{1,4}:){1,7}:)|(([0-9a-f]{1,4}:){1,6}:[0-9a-f]{1,4})|(([0-9a-f]{1,4}:){1,5}(:[0-9a-f]{1,4}){1,2})|(([0-9a-f]{1,4}:){1,4}(:[0-9a-f]{1,4}){1,3})|(([0-9a-f]{1,4}:){1,3}(:[0-9a-f]{1,4}){1,4})|(([0-9a-f]{1,4}:){1,2}(:[0-9a-f]{1,4}){1,5})|([0-9a-f]{1,4}:)((:[0-9a-f]{1,4}){1,6})|:((:[0-9a-f]{1,4}){1,7}|:)|fe80:(:[0-9a-f]{0,4}){0,4}%[0-9a-z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9])|([0-9a-f]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1?[0-9])?[0-9])\.){3}(25[0-5]|(2[0-4]|1?[0-9])?[0-9]))$/i;

const HASH_PATTERN = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/;

const FULL_URL_PATTERN =
    /^(https?):\/\/(([^\s:@\/]+(:[^\s:@\/]*)?@)?((?:[a-z0-9-]+\.)+[a-z]{2,})(:\d{2,5})?(\/[^\s]*)?(\?[^\s#]*)?(#[^\s]*)?)$/;

const DOMAIN_ONLY_PATTERN = /^([a-z0-9-]+\.)+[a-z]{2,}$/;

/**
 * Normalize input by trimming and lowercasing.
 * @param {string} input
 * @returns {string}
 */
function normalize(input) {
    if (typeof input !== 'string') return '';
    return input.trim().toLowerCase();
}

/**
 * Validates an IPv4 address.
 * @param {string} input
 * @returns {boolean}
 */
export function isValidIPv4(input) {
    const normalized = normalize(input);
    if (!normalized) return false;

    return IPV4_PATTERN.test(normalized);
}

/**
 * Validates an IPv6 address.
 * @param {string} input
 * @returns {boolean}
 */
export function isValidIPv6(input) {
    const normalized = normalize(input);
    if (!normalized) return false;

    return IPV6_PATTERN.test(normalized);
}

/**
 * Validates a hash string (MD5, SHA1, SHA256).
 * @param {string} input
 * @returns {boolean}
 */
export function isValidHash(input) {
    const normalized = normalize(input);
    if (!normalized) return false;

    return HASH_PATTERN.test(normalized);
}

/**
 * Validates whether a given string is a domain or a well-formed HTTP/HTTPS URL.
 * @param {string} input
 * @returns {boolean}
 */
export function isValidUrl(input) {
    const normalized = normalize(input);
    if (!normalized) return false;

    if (FULL_URL_PATTERN.test(normalized)) return true;
    if (DOMAIN_ONLY_PATTERN.test(normalized)) return true;
    return false;
}

/**
 * Validator metadata and functions in a scalable array.
 */
const validators = [
    { type: 'ipv4', validate: isValidIPv4 },
    { type: 'ipv6', validate: isValidIPv6 },
    { type: 'url', validate: isValidUrl },
    { type: 'hash', validate: isValidHash },
];

/**
 * Detects the type of IOC based on its format.
 * @param {string} input
 * @returns {"ipv4" | "ipv6" | "url" | "hash" | "unknown"}
 */
export function detectIOCType(input) {
    if (typeof input !== 'string') return 'unknown';

    for (const validator of validators) {
        if (validator.validate(input)) {
            return validator.type;
        }
    }
    return 'unknown';
}
