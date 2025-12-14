import { copyToClipboard } from '@src/lib/browser/browser-utils';
import {
    type Flag,
    type Preferences,
} from '@src/lib/storage/default-preferences';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';

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
 * Validates that the IOC type exists in preferences and is active.
 *
 * @param {keyof Preferences} iocType - IOC type to validate
 * @returns {boolean} True if the IOC type is valid and active, false otherwise
 */
export const isValidAndActiveIOCType = async (
    iocType: keyof Preferences
): Promise<boolean> => {
    const prefsState = await PreferencesState.getInstance().getState();
    const ioc = prefsState[iocType];

    return Boolean(ioc?.active);
};

/**
 * Processes URL templates by replacing placeholders with the actual IOC value.
 *
 * @param {string} templateUrl - URL template containing placeholders
 * @returns {string} Processed URL with placeholders replaced
 * @throws {TypeError} If URL parsing fails for URL-type IOCs
 *
 * @example
 * processUrlTemplate('https://lookup.com?ip={ip}', '192.168.1.1', 'ip');
 * // Returns: 'https://lookup.com?ip=192.168.1.1'
 */
export const processUrlTemplate = (
    templateUrl: string,
    ioc: string
): string => {
    const iocType: keyof Preferences | null = detectIOCType(ioc);
    let processedUrl: string = templateUrl;

    switch (iocType) {
        case 'ip':
            processedUrl = processedUrl.replace('{ip}', ioc);
            break;
        case 'hash':
            processedUrl = processedUrl.replace('{hash}', ioc);
            break;
        case 'url': {
            const normalisedUrl: string = normaliseUrl(ioc);
            const urlObject: URL = new URL(normalisedUrl);

            processedUrl = processedUrl
                .replace('{url}', normalisedUrl)
                .replace('{encodedUrl}', encodeURIComponent(normalisedUrl))
                .replace('{domain}', urlObject.hostname);
            break;
        }
    }

    return normaliseUrl(processedUrl);
};

/**
 * Sanitises an IP address by replacing the last dot or colon with bracket notation
 * to prevent accidental clicks in security contexts.
 *
 * IPv4 example: "192.168.1.1" becomes "192.168.1[.]1"
 * IPv6 example: "2001:db8::1" becomes "2001:db8:[:]1"
 *
 * @param {string} ip - IP address to sanitise
 * @returns {string} Sanitised IP address with bracket notation
 *
 * @example
 * sanitiseIP('192.168.1.1'); // Returns: '192.168.1[.]1'
 * sanitiseIP('2001:db8::1'); // Returns: '2001:db8:[:]1'
 */
export const sanitiseIP = (ip: string): string => {
    const lastDot: number = ip.lastIndexOf('.');
    const lastColon: number = ip.lastIndexOf(':');

    if (lastDot > lastColon) {
        return ip.slice(0, lastDot) + '[.]' + ip.slice(lastDot + 1);
    } else if (lastColon > -1) {
        return ip.slice(0, lastColon) + '[:]' + ip.slice(lastColon + 1);
    }

    return ip;
};

/**
 * Sanitises a URL by replacing all dots with bracket notation
 * to prevent accidental clicks in security contexts.
 *
 * @param {string} url - URL to sanitise
 * @returns {string} Sanitised URL with all dots replaced by '[.]'
 *
 * @example
 * sanitiseURL('example.com'); // Returns: 'example[.]com'
 * sanitiseURL('https://malicious.site.com'); // Returns: 'https://malicious[.]site[.]com'
 */
export const sanitiseURL = (url: string): string => url.replace(/\./g, '[.]');

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

/**
 * Handles copying an IOC to the clipboard with optional sanitisation.
 *
 * @param {string} ioc - IOC value to copy
 * @param {Flag[]} flags - Array of user preference flags
 * @returns {void}
 *
 * @example
 * handleCopyToClipboard('192.168.1.1', flags, 'ip');
 */
export const handleCopyToClipboard = (ioc: string, flags: Flag[]): void => {
    const iocType: keyof Preferences | null = detectIOCType(ioc);
    let shouldCopy: boolean = false;
    let shouldSanitise: boolean = false;

    switch (iocType) {
        case 'ip':
            shouldCopy = getFlagValue(flags, ['Copy IP']) ?? shouldCopy;
            shouldSanitise =
                getFlagValue(flags, ['Copy IP', 'Sanitise IP']) ??
                shouldSanitise;
            break;
        case 'hash':
            shouldCopy = getFlagValue(flags, ['Copy Hash']) ?? shouldCopy;
            break;
        case 'url':
            shouldCopy = getFlagValue(flags, ['Copy URL']) ?? shouldCopy;
            shouldSanitise =
                getFlagValue(flags, ['Copy URL', 'Sanitise URL']) ??
                shouldSanitise;
            break;
        default:
            return;
    }

    if (!shouldCopy) return;

    let toCopy: string = ioc;
    if (shouldSanitise) {
        toCopy = iocType === 'ip' ? sanitiseIP(ioc) : sanitiseURL(ioc);
    }

    copyToClipboard(toCopy);
};

/**
 * Recursively traverses an object and executes a callback function for
 * every array found under a key named "urls" (case-insensitive). This
 * is useful for processing nested IOC data structures where URLs may be
 * stored at various levels.
 *
 * @param {any} obj - The object to traverse recursively
 * @param {(arr: string[], parent: any, key: string) => void} callback -
 *   Function to execute for each "urls" array found. Receives:
 *   - arr: The array of URL strings
 *   - parent: The parent object containing the array
 *   - key: The key name (will be some variation of "urls")
 * @returns {void}
 *
 * @example
 * const data = {
 *   ip: { urls: ['example.com', 'test.com'] },
 *   nested: {
 *     deeper: { urls: ['nested.com'] }
 *   }
 * };
 *
 * forEachUrls(data, (urls, parent, key) => {
 *   console.log(`Found ${urls.length} URLs in ${key}`);
 *   urls.forEach(url => console.log(url));
 * });
 */
export const forEachUrls = (
    obj: any,
    callback: (arr: string[], parent: any, key: string) => void
): void => {
    /**
     * Internal recursive function to traverse the object tree.
     * Handles arrays, objects, and primitive values appropriately.
     *
     * @param {any} value - The current value being traversed
     * @returns {void}
     */
    const traverse = (value: any): void => {
        // Handle arrays by traversing each element
        if (Array.isArray(value)) {
            value.forEach((item: any) => traverse(item));
        }
        // Handle objects by checking keys and traversing nested values
        else if (typeof value === 'object' && value !== null) {
            for (const [key, val] of Object.entries(value)) {
                // Check if this key is "urls" (case-insensitive) and contains an array
                if (key.toLowerCase() === 'urls' && Array.isArray(val)) {
                    callback(val, value, key);
                }
                // Continue traversing nested structures
                traverse(val);
            }
        }
        // Primitive values (string, number, boolean, etc.) are ignored
    };

    traverse(obj);
};
