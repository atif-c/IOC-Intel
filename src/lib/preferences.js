import './browser-polyfill.min.js';
import { isValidUrl } from './ioc-validator.js';

export const useLocalStorage = false;

/**
 * The default structure and values for user preferences.
 * Used as a schema/template to validate and reset malformed or missing values.
 */
const defaultPreferences = {
    ip: {
        active: true,
        copyToClipboard: true,
        sanitise: true,
        urls: [
            'abuseipdb.com/check/{ip}',
            'threatfox.abuse.ch/browse.php?search=ioc%3A{ip}',
            'shodan.io/host/{ip}',
        ],
    },

    hash: {
        active: true,
        copyToClipboard: true,
        urls: [
            'virustotal.com/gui/file/{hash}',
            'urlhaus.abuse.ch/browse.php?search={hash}',
        ],
    },
    url: {
        active: true,
        copyToClipboard: true,
        sanitise: true,
        urls: [
            'urlhaus.abuse.ch/browse.php?search={encodedUrl}',
            'mxtoolbox.com/SuperTool.aspx?action=whois%3a{domain}',
            'virustotal.com/gui/domain/{domain}',
        ],
    },
};

/**
 * Recursively cleans a user preferences object against a template.
 * Removes extra keys, restores missing or invalid keys from defaults.
 *
 * @param {object} user - User preferences input (partial or malformed)
 * @param {object} template - Reference template
 * @param {string} [sectionKey=''] - Internal debugging key
 * @returns {object} Cleaned preferences
 */
function cleanPreferences(user = {}, template, sectionKey = '') {
    const result = {};

    for (const key in template) {
        const defaultVal = template[key];
        const inputVal = user[key];

        if (
            typeof defaultVal === 'object' &&
            !Array.isArray(defaultVal) &&
            defaultVal !== null
        ) {
            if (
                typeof inputVal === 'object' &&
                inputVal !== null &&
                !Array.isArray(inputVal)
            ) {
                result[key] = cleanPreferences(
                    inputVal,
                    defaultVal,
                    sectionKey || key
                );
            } else {
                result[key] = defaultVal;
            }
            continue;
        }

        if (Array.isArray(defaultVal)) {
            if (Array.isArray(inputVal)) {
                const valid = inputVal.filter(isValidUrl);
                result[key] = valid.length ? valid : defaultVal;
            } else {
                result[key] = defaultVal;
            }
            continue;
        }

        if (typeof defaultVal === typeof inputVal) {
            result[key] = inputVal;
        } else {
            result[key] = defaultVal;
        }
    }

    return result;
}

/**
 * Helper function to select browser storage backend.
 * @returns {browser.storage.StorageArea}
 */
function getStorage() {
    return useLocalStorage ? browser.storage.local : browser.storage.sync;
}

/**
 * Loads preferences from storage, validates, and returns them.
 *
 * @returns {Promise<object>} Cleaned user preferences
 */
export async function loadPreferences() {
    try {
        const storage = getStorage();
        const raw = await storage.get();
        const cleaned = cleanPreferences(raw, defaultPreferences);
        return cleaned;
    } catch (err) {
        console.error('Failed to load preferences:', err);
        return defaultPreferences;
    }
}

/**
 * Validates and saves preferences to storage.
 *
 * @param {object} prefs - Preferences to save
 * @returns {Promise<void>}
 */
export async function savePreferences(prefs) {
    try {
        const validated = cleanPreferences(prefs, defaultPreferences);
        const storage = getStorage();
        await storage.set(validated);
    } catch (err) {
        console.error('Failed to save preferences:', err);
    }
}
