import { copyToClipboard } from '@src/lib/browser/browser-utils';
import {
    FULL_URL_PATTERN,
    getFlagValue,
    HASH_PATTERN,
    IPV4_PATTERN,
    IPV6_PATTERN,
    normaliseUrl,
} from '@src/lib/IOC/ioc-utils';
import type { Flag, Preferences } from '@src/lib/storage/default-preferences';
import Browser from 'webextension-polyfill';

/**
 * Executes actions based on an IOC (Indicator of Compromise) type and user-configured flags.
 *
 * Supports different IOC types (`ip`, `hash`, `url`) and performs actions such as:
 * - Copying IOC to the clipboard (optionally sanitised)
 * - Opening a new tab with a URL formatted using the IOC
 *
 * @param {keyof Preferences} IOCType - The type of IOC (e.g., 'ip', 'hash', 'url').
 * @param {string} normalisedIOC - The normalised IOC value to use.
 * @param {Flag[]} flags - Array of flags form the Preferences that control optional behaviors.
 * @param {string} url - The URL template to open (may contain placeholders like `{ip}`).
 * @param {number} tabIndex - The index at which to open the new browser tab.
 *
 * @returns {void}
 */
export const executeIOCIntel = (
    IOCType: keyof Preferences,
    normalisedIOC: string,
    flags: Flag[],
    url: string,
    tabIndex: number
) => {
    switch (IOCType) {
        case 'ip':
            if (
                !IPV4_PATTERN.test(normalisedIOC) &&
                !IPV6_PATTERN.test(normalisedIOC)
            )
                break;

            if (getFlagValue(flags, ['Copy IP'])) {
                let toCopy = normalisedIOC;

                if (getFlagValue(flags, ['Copy IP', 'Sanitise IP'])) {
                    const lastDot = toCopy.lastIndexOf('.');
                    const lastColon = toCopy.lastIndexOf(':');

                    if (lastDot > lastColon) {
                        toCopy =
                            toCopy.slice(0, lastDot) +
                            '[.]' +
                            toCopy.slice(lastDot + 1);
                    } else if (lastColon > -1) {
                        toCopy =
                            toCopy.slice(0, lastColon) +
                            '[:]' +
                            toCopy.slice(lastColon + 1);
                    }
                }

                copyToClipboard(toCopy);
            }

            Browser.tabs.create({
                url: normaliseUrl(url.replace('{ip}', normalisedIOC)),
                index: tabIndex,
                active: false,
            });

            break;

        case 'hash':
            if (!HASH_PATTERN.test(normalisedIOC)) break;

            if (getFlagValue(flags, ['Copy Hash']))
                copyToClipboard(normalisedIOC);

            Browser.tabs.create({
                url: normaliseUrl(url.replace('{hash}', normalisedIOC)),
                index: tabIndex,
                active: false,
            });

            break;

        case 'url':
            const normalisedUrl = normaliseUrl(normalisedIOC);
            if (!FULL_URL_PATTERN.test(normalisedUrl)) break;

            if (getFlagValue(flags, ['Copy URL'])) {
                let toCopy = normalisedIOC;

                if (getFlagValue(flags, ['Copy URL', 'Sanitise URL'])) {
                    toCopy = toCopy.replace(/\./g, '[.]');
                }
                copyToClipboard(normalisedUrl);
            }

            Browser.tabs.create({
                url: normaliseUrl(
                    url
                        .replace('{url}', normalisedUrl)
                        .replace(
                            '{encodedUrl}',
                            encodeURIComponent(normalisedUrl)
                        )
                        .replace('{domain}', new URL(normalisedUrl).hostname)
                ),
                index: tabIndex,
                active: false,
            });

            break;

        default:
            console.log(`Unknown IOC type: ${IOCType}`);
            break;
    }
};
