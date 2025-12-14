import { copyToClipboard } from '@src/lib/browser/browser-utils';
import {
    type Flag,
    type Preferences,
} from '@src/lib/storage/default-preferences';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';

/**
 * Regular expression pattern for matching IPv4 addresses.
 * Matches standard dotted-decimal notation (e.g., 192.168.1.1).
 * Each octet must be between 0-255.
 *
 * @type {RegExp}
 * @constant
 * @example
 * IPV4_PATTERN.test('192.168.1.1'); // true
 * IPV4_PATTERN.test('255.255.255.0'); // true
 * IPV4_PATTERN.test('256.1.1.1'); // false (invalid octet > 255)
 * IPV4_PATTERN.test('10.0.0'); // false (missing octet)
 */
export const IPV4_PATTERN: RegExp =
    /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/;

/**
 * Regular expression pattern for matching IPv6 addresses.
 * Supports multiple IPv6 formats:
 * - Full format: 2001:0db8:85a3:0000:0000:8a2e:0370:7334
 * - Compressed format: 2001:db8::1
 * - Link-local with zone ID: fe80::1%eth0
 * - IPv4-mapped IPv6: ::ffff:192.0.2.1
 * - Mixed notation: ::ffff:192.0.2.1
 *
 * @type {RegExp}
 * @constant
 * @example
 * IPV6_PATTERN.test('2001:0db8:85a3:0000:0000:8a2e:0370:7334'); // true (full)
 * IPV6_PATTERN.test('::1'); // true (loopback compressed)
 * IPV6_PATTERN.test('fe80::1%eth0'); // true (link-local with zone)
 * IPV6_PATTERN.test('::ffff:192.0.2.1'); // true (IPv4-mapped)
 */
export const IPV6_PATTERN: RegExp =
    /^(([a-f0-9]{1,4}:){7,7}[a-f0-9]{1,4}|([a-f0-9]{1,4}:){1,7}:|([a-f0-9]{1,4}:){1,6}:[a-f0-9]{1,4}|([a-f0-9]{1,4}:){1,5}(:[a-f0-9]{1,4}){1,2}|([a-f0-9]{1,4}:){1,4}(:[a-f0-9]{1,4}){1,3}|([a-f0-9]{1,4}:){1,3}(:[a-f0-9]{1,4}){1,4}|([a-f0-9]{1,4}:){1,2}(:[a-f0-9]{1,4}){1,5}|[a-f0-9]{1,4}:((:[a-f0-9]{1,4}){1,6})|:((:[a-f0-9]{1,4}){1,7}|:)|fe80:(:[a-f0-9]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([a-f0-9]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/i;

/**
 * Regular expression pattern for matching common cryptographic hash values.
 * Supports MD5 (32 hex), SHA-1 (40 hex), and SHA-256 (64 hex).
 *
 * Case-insensitive matching (both uppercase and lowercase hex digits accepted).
 *
 * @type {RegExp}
 * @constant
 * @example
 * HASH_PATTERN.test('5d41402abc4b2a76b9719d911017c592'); // true (MD5, 32 chars)
 * HASH_PATTERN.test('356a192b7913b04c54574d18c28d46e6395428ab'); // true (SHA-1, 40 chars)
 * HASH_PATTERN.test('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'); // true (SHA-256, 64 chars)
 * HASH_PATTERN.test('invalid'); // false (not a valid hash)
 */
export const HASH_PATTERN: RegExp =
    /^[a-f0-9]{32}$|^[a-f0-9]{40}$|^[a-f0-9]{64}$/i;

/**
 * Regular expression pattern for matching HTTP/HTTPS URLs.
 * Supports:
 * - Optional protocol (http:// or https://) - if missing, handled by normaliseUrl
 * - Optional authentication (username:password@)
 * - Domain with TLD (e.g., example.com, sub.domain.co.uk)
 * - Optional port (e.g., :8080, :3000)
 * - Optional path (e.g., /path/to/resource)
 * - Optional query string (e.g., ?key=value&foo=bar)
 * - Optional fragment/hash (e.g., #section)
 *
 * Case-insensitive matching for protocol and domain.
 *
 * @type {RegExp}
 * @constant
 * @example
 * FULL_URL_PATTERN.test('https://example.com/path'); // true
 * FULL_URL_PATTERN.test('http://user:pass@localhost:8080/api?key=value#top'); // true
 * FULL_URL_PATTERN.test('example.com'); // true (protocol optional)
 * FULL_URL_PATTERN.test('ftp://example.com'); // false (only http/https supported)
 */
export const FULL_URL_PATTERN: RegExp =
    /^(https?:\/\/)?(([^\s:@\/]+(:[^\s:@\/]*)?@)?((?:[a-z0-9-]+\.)+[a-z]{2,})(:\d{2,5})?(\/[^\s]*)?(\?[^\s#]*)?(#[^\s]*)?)$/i;

/**
 * Regular expression pattern for matching domain names without protocol.
 * Validates domain structure:
 * - One or more subdomains/labels (alphanumeric with hyphens)
 * - Separated by dots
 * - Ending with a TLD of at least 2 characters
 *
 * Does NOT match URLs with protocols, paths, or query strings.
 *
 * @type {RegExp}
 * @constant
 * @example
 * DOMAIN_ONLY_PATTERN.test('example.com'); // true
 * DOMAIN_ONLY_PATTERN.test('subdomain.example.co.uk'); // true
 * DOMAIN_ONLY_PATTERN.test('my-domain.com'); // true
 * DOMAIN_ONLY_PATTERN.test('https://example.com'); // false (has protocol)
 * DOMAIN_ONLY_PATTERN.test('example'); // false (no TLD)
 */
export const DOMAIN_ONLY_PATTERN: RegExp = /^([a-z0-9-]+\.)+[a-z]{2,}$/;

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
 * Retrieves the value of a flag by traversing a nested flag structure
 * using a path array. This allows for accessing deeply nested flag
 * configurations in a type-safe manner.
 *
 * @param {Flag[]} flags - Array of top-level flags to search
 * @param {string[]} path - Array of flag names representing the path to the target flag.
 *                          The last element is the target flag name.
 * @returns {boolean | undefined} The boolean value of the flag if found, undefined if not found
 *
 * @example
 * const flags = [
 *   {
 *
 *     name: 'security',
 *     value: true,
 *     subFlags: [
 *       { name: 'strict', value: false, subFlags: [] }
 *     ]
 *   }
 * ];
 *
 * getFlagValue(flags, ['security']); // returns true
 * getFlagValue(flags, ['security', 'strict']); // returns false
 * getFlagValue(flags, ['nonexistent']); // returns undefined
 */
export const getFlagValue = (
    flags: Flag[],
    path: string[]
): boolean | undefined => {
    let currentLevel: Flag[] | undefined = flags;

    // Traverse the path step by step
    for (const name of path) {
        // Find the flag at the current level with matching name
        const found: Flag | undefined = currentLevel?.find(
            (f: Flag) => f.name === name
        );

        // If flag not found at this level, return undefined
        if (!found) return undefined;

        // If this is the target flag (last in path), return its value
        if (name === path[path.length - 1]) return found.value;

        // Otherwise, move to the next level (subFlags)
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
