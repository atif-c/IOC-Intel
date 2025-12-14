import {
    type Flag,
    type Preferences,
} from '@src/lib/storage/default-preferences';

export const IPV4_PATTERN =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

export const IPV6_PATTERN =
    /^(([a-f0-9]{1,4}:){7,7}[a-f0-9]{1,4}|([a-f0-9]{1,4}:){1,7}:|([a-f0-9]{1,4}:){1,6}:[a-f0-9]{1,4}|([a-f0-9]{1,4}:){1,5}(:[a-f0-9]{1,4}){1,2}|([a-f0-9]{1,4}:){1,4}(:[a-f0-9]{1,4}){1,3}|([a-f0-9]{1,4}:){1,3}(:[a-f0-9]{1,4}){1,4}|([a-f0-9]{1,4}:){1,2}(:[a-f0-9]{1,4}){1,5}|[a-f0-9]{1,4}:((:[a-f0-9]{1,4}){1,6})|:((:[a-f0-9]{1,4}){1,7}|:)|fe80:(:[a-f0-9]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([a-f0-9]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/i;
// Hashes (MD5, SHA1, SHA256)
export const HASH_PATTERN = /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i;
export const FULL_URL_PATTERN =
    /^(https?:\/\/)?(([^\s:@\/]+(:[^\s:@\/]*)?@)?((?:[a-z0-9-]+\.)+[a-z]{2,})(:\d{2,5})?(\/[^\s]*)?(\?[^\s#]*)?(#[^\s]*)?)$/i;
export const DOMAIN_ONLY_PATTERN = /^([a-z0-9-]+\.)+[a-z]{2,}$/;

/**
 * Normalises a string by removing square brackets, trimming whitespace,
 * and converting it to lowercase.
 *
 * @param {string} string - String to normalise
 * @returns {string} Normalised string with brackets removed, trimmed, and lowercased
 *
 * @example
 * normaliseString('  1.2.3[.]4  '); // returns '1.2.3.4'
 * normaliseString('[Test]'); // returns 'test'
 * normaliseString('  EXAMPLE[.]COM  '); // returns 'example.com'
 */
export const normaliseString = (string: string): string =>
    string.replaceAll('[', '').replaceAll(']', '').trim().toLowerCase();

/**
 * Ensures that a URL string starts with a valid protocol (`http://` or `https://`).
 * If the input does not start with a protocol (case-insensitive check),
 * it prepends `https://` to the string.
 *
 * @param {string} input - URL string to normalise
 * @returns {string} Normalised URL with a protocol prefix
 *
 * @example
 * normaliseUrl('example.com'); // returns 'https://example.com'
 * normaliseUrl('http://example.com'); // returns 'http://example.com'
 */
export const normaliseUrl = (input: string): string => {
    if (!/^https?:\/\//i.test(input)) {
        return `https://${input}`;
    }
    return input;
};

/**
 * Recursively traverses an object and executes a callback for every array found
 * under a key named "urls" (case-insensitive).
 *
 * @param {any} obj - The object to traverse.
 * @param {(arr: string[], parent: any, key: string) => void} callback -
 *   Function to call for each "urls" array found. Receives the array, the
 *   parent object containing the array, and the key name.
 *
 * @example
 * const data = {
 *   ip: { urls: ['example.com', 'test.com'] },
 *   nested: { urls: ['nested.com'] }
 * };
 *
 * forEachUrls(data, (urls, parent, key) => {
 *   console.log(urls); // Logs each array of URLs
 * });
 */
export const forEachUrls = (
    obj: any,
    callback: (arr: string[], parent: any, key: string) => void
) => {
    function traverse(value: any) {
        if (Array.isArray(value)) {
            value.forEach(item => traverse(item));
        } else if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                if (key.toLowerCase() === 'urls' && Array.isArray(val)) {
                    callback(val, value, key);
                }
                traverse(val);
            }
        }
    }
    traverse(obj);
};

/**
 * Validates whether a given string is a well-formed HTTP/HTTPS URL.
 * The string is normalised before validation.
 * Note: This validation allows URLs with or without protocols due to
 * the FULL_URL_PATTERN implementation.
 *
 * @param {string} input - String to validate as a URL
 * @returns {boolean} True if the input matches the URL pattern, false otherwise
 *
 * @example
 * isValidUrl('https://example.com'); // true
 * isValidUrl('http://localhost:8080/path'); // true
 * isValidUrl('example.com'); // true (protocol optional in pattern)
 * isValidUrl(''); // false (empty string)
 * isValidUrl('  https://test[.]com  '); // true (normalised and validated)
 * isValidUrl('not a url'); // false
 */
export const isValidUrl = (input: string): boolean => {
    const normalised: string = normaliseString(input);

    if (normalised.length === 0) return false;

    // Protocol is optional in the pattern
    return FULL_URL_PATTERN.test(normalised);
};

/**
 * Detects the IOC type of a given string.
 * The input text is normalised before pattern checks.
 *
 * Supported IOC types:
 * - 'ip': IPv4 or IPv6 addresses
 * - 'hash': MD5, SHA-1, or SHA-256 hashes
 * - 'url': Full HTTP/HTTPS URLs
 *
 * @param {string} string - String to analyse for IOC type
 * @returns {keyof Preferences | null} Detected IOC type key from Preferences, or null if no match
 *
 * @example
 * detectIOCType('192.168.1.1'); // returns 'ip'
 * detectIOCType('44d88612fea8a8f36de82e1278abb02f'); // returns 'hash'
 * detectIOCType('https://example.com'); // returns 'url'
 * detectIOCType('random text'); // returns null
 *
 * TODO: make less static
 *
 */
export const detectIOCType = (string: string): keyof Preferences | null => {
    const normalised: string = normaliseString(string);

    if (normalised.length === 0) return null;

    if (IPV4_PATTERN.test(normalised) || IPV6_PATTERN.test(normalised)) {
        return 'ip';
    }

    if (HASH_PATTERN.test(normalised)) {
        return 'hash';
    }

    if (FULL_URL_PATTERN.test(normalised)) {
        return 'url';
    }

    return null;
};

/**
 * Get the value of a flag by path.
 * @param flags - array of flags
 * @param path - array of names leading to the target flag
 * @returns the value of the flag or undefined if not found
 */
export const getFlagValue = (
    flags: Flag[],
    path: string[]
): boolean | undefined => {
    let currentLevel: Flag[] | undefined = flags;

    for (const name of path) {
        const found: Flag | undefined = currentLevel?.find(
            f => f.name === name
        );
        if (!found) return undefined;
        if (name === path[path.length - 1]) return found.value;
        currentLevel = found.subFlags;
    }

    return undefined;
};
