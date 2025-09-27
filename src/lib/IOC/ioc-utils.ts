import { type Flag } from '@src/lib/storage/default-preferences';

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
 * Normalises a string by trimming whitespace from both ends
 * and converting it to lowercase.
 *
 * @param {string} input - The string to normalise.
 * @returns {string} The trimmed and lowercased string.
 *
 * @example
 * normalise('  Hello World  '); // returns 'hello world'
 */
export const normaliseString = (input: string) => input.trim().toLowerCase();

/**
 * Ensures that a URL string starts with a valid protocol (`http://` or `https://`).
 *
 * If the input does not start with `http://` or `https://` (case-insensitive),
 * it prepends `https://` to the string.
 *
 * @param {string} input - The URL string to normalise.
 * @returns {string} The normalised URL with a protocol.
 *
 * @example
 * normaliseUrl('example.com'); // returns 'https://example.com'
 * normaliseUrl('http://example.com'); // returns 'http://example.com'
 */
export const normaliseUrl = (input: string) => {
    if (!/^https?:\/\//i.test(input)) {
        return 'https://' + input;
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
 * Validates whether a given string is a domain or a well-formed HTTP/HTTPS URL.
 * @param {string} input
 * @returns {boolean}
 */
export const isValidUrl = (input: string) => {
    const normalised = normaliseString(input);
    if (normalised.length == 0) return false;

    if (FULL_URL_PATTERN.test(normalised)) return true;
    return false;
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
