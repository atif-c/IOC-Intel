import type { Flag, Preferences } from '@src/lib/storage/default-preferences';

import {
    createTab,
    getTabInsertionIndex,
} from '@src/lib/browser/browser-utils';
import {
    detectIOCType,
    handleCopyToClipboard,
    isValidAndActiveIOCType,
    processUrlTemplate,
} from '@src/lib/IOC/ioc-utils';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';

/**
 * Opens browser tabs for all configured URLs for the given IOC type.
 *
 * @param {string[]} urls - Array of URL templates to open
 * @param {string} ioc - IOC value to insert into templates
 * @param {number} startIndex - Tab index where the first tab should be inserted
 * @returns {void}
 * @throws {Error} If tab creation fails
 */

/**
 * Executes IOC (Indicator of Compromise) investigation actions based on the IOC type and user-configured preferences.
 *
 * This function processes a single normalised IOC by:
 * 1. Auto-detecting the IOC type by validating against type-specific patterns (IPv4/IPv6, hash, or URL)
 * 2. Loading preferences if not already loaded
 * 3. Validating that the IOC type is active and configured in preferences
 * 4. Optionally copying the IOC to the clipboard (with optional sanitisation to prevent accidental clicks)
 *    - IP addresses: Replaces the last dot/colon with `[.]` or `[:]` if sanitisation is enabled
 *    - URLs: Replaces all dots with `[.]` if sanitisation is enabled
 * 5. Opening browser tabs in the background with the IOC inserted into URL template placeholders
 *    - IP: `{ip}` placeholder
 *    - Hash: `{hash}` placeholder
 *    - URL: `{url}`, `{encodedUrl}`, and `{domain}` placeholders
 *
 * Tabs are opened sequentially in the background (not activated) starting at the index after the current active tab.
 *
 * @param {string} normalisedIOC - Normalised (unsanitised, trimmed, lowercased) IOC value to investigate
 * @returns {Promise<boolean>} `true` if the IOC was successfully processed; `false` if validation failed,
 *                             the IOC type is inactive, or an error occurred
 * @throws {Error} If browser tabs API query fails
 * @throws {Error} If preferences loading fails
 * @throws {Error} If tab creation fails
 * @throws {TypeError} If URL parsing fails for URL-type IOCs
 *
 * @example
 * // Process an IP address
 * const result = await executeIOCIntel('192.168.1.1');
 * // Opens investigation tabs and optionally copies sanitised IP to clipboard
 *
 * @example
 * // Process a hash
 * const result = await executeIOCIntel('abc123def456...');
 * // Opens investigation tabs and optionally copies hash to clipboard
 *
 * @example
 * // Process a URL
 * const result = await executeIOCIntel('https://malicious-site.com');
 * // Opens investigation tabs with URL, encoded URL, and domain placeholders replaced
 */
export const executeIOCIntel = async (
    normalisedIOC: string
): Promise<boolean> => {
    try {
        // Detect the IOC type using pattern matching
        const iocType: keyof Preferences =
            (detectIOCType(normalisedIOC) as keyof Preferences) || 'unknown';

        // Validate IOC type is active and configured
        if (!(await isValidAndActiveIOCType(iocType))) {
            return false;
        }

        const prefsState = await PreferencesState.getInstance().getState();
        const typePrefs = prefsState[iocType];

        const flags: Flag[] = typePrefs.flags ?? [];
        const urls: string[] = typePrefs.urls ?? [];

        handleCopyToClipboard(normalisedIOC, flags);
        let tabIndex: number = await getTabInsertionIndex();

        urls.forEach((url: string) => {
            const processedUrl: string = processUrlTemplate(url, normalisedIOC);
            createTab(processedUrl, tabIndex);
            tabIndex++;
        });

        return true;
    } catch (error) {
        console.error('Error executing IOC intel:', error);
        return false;
    }
};

/**
 * Request type for executing IOC intel  operations.
 * Used for message passing between different parts of the extension.
 */
export type executeIOCIntelRequest = {
    /** The action identifier for this request type */
    action: 'executeIOCIntel';
    /** The IOC value to investigate */
    IOC: string;
};
