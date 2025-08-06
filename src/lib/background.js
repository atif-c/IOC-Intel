import './browser-polyfill.min.js';
import {
    isValidHash,
    isValidIPv4,
    isValidIPv6,
    isValidUrl,
} from './ioc-validator.js';
import { loadPreferences, useLocalStorage } from './preferences.js';

const labels = {
    ip: 'IP',
    hash: 'Hash',
    url: 'URL',
};

function getStorage() {
    return useLocalStorage ? browser.storage.local : browser.storage.sync;
}

async function updateContextMenu(id, title, isActive) {
    try {
        await browser.contextMenus.remove(id).catch(() => {});
        if (isActive) {
            await browser.contextMenus.create({
                id,
                title,
                contexts: ['selection'],
            });
        }
    } catch (err) {
        console.error('Error updating context menu:', err);
    }
}

function normaliseUrl(input) {
    if (!/^https?:\/\//i.test(input)) {
        return 'https://' + input;
    }
    return input;
}

async function copyToClipboard(text) {
    const [tab] = await browser.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (!tab?.id) throw new Error('No active tab found');

    await browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (t) => navigator.clipboard.writeText(t),
        args: [text],
    });
}

// Initial setup
(async () => {
    const storage = getStorage();
    const stored = await storage.get(Object.keys(labels));

    for (const [key, value] of Object.entries(stored)) {
        await updateContextMenu(
            `soc-intel-${key}`,
            `${labels[key] ?? key}`,
            value?.active ?? false
        );
    }
})();

// Listen for changes
browser.storage.onChanged.addListener(async (changes, area) => {
    const expectedArea = useLocalStorage ? 'local' : 'sync';
    if (area !== expectedArea) return;

    for (const key of Object.keys(labels)) {
        if (changes[key]) {
            await updateContextMenu(
                `soc-intel-${key}`,
                `${labels[key]}`,
                changes[key].newValue?.active
            );
        }
    }
});

browser.contextMenus.onClicked.addListener(async (info, tab) => {
    const { menuItemId, selectionText } = info;

    // return if no selection or not one of our items
    if (!selectionText || !menuItemId.startsWith('soc-intel-')) return;

    const type = menuItemId.replace('soc-intel-', '');

    switch (type) {
        case 'ip': {
            const trimmed = selectionText.trim().toLowerCase();
            if (isValidIPv4(trimmed) || isValidIPv6(trimmed)) {
                const prefs = await loadPreferences();
                const urls = prefs.ip.urls;

                const [activeTab] = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });

                let index = activeTab.index + 1;

                for (const url of urls) {
                    const finalUrl = normaliseUrl(url.replace('{ip}', trimmed));
                    await browser.tabs.create({
                        url: finalUrl,
                        index,
                        active: false,
                    });
                    index++;
                }

                if (prefs.ip.copyToClipboard) {
                    let toCopy = trimmed;

                    if (prefs.ip.sanitise) {
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

                    try {
                        await copyToClipboard(toCopy);
                    } catch (err) {
                        console.error('Clipboard write failed:', err);
                    }
                }
            } else {
                console.log('Invalid IP:', selectionText);
            }
            break;
        }

        case 'hash': {
            const trimmed = selectionText.trim().toLowerCase();
            if (isValidHash(trimmed)) {
                const prefs = await loadPreferences();
                const urls = prefs.hash.urls;

                const [activeTab] = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });

                let index = activeTab.index + 1;

                for (const url of urls) {
                    const finalUrl = normaliseUrl(
                        url.replace('{hash}', trimmed)
                    );
                    await browser.tabs.create({
                        url: finalUrl,
                        index,
                        active: false,
                    });
                    index++;
                }

                if (prefs.hash.copyToClipboard) {
                    try {
                        await copyToClipboard(trimmed);
                    } catch (err) {
                        console.error('Clipboard write failed:', err);
                    }
                }
            } else {
                console.log('Invalid hash:', selectionText);
            }
            break;
        }

        case 'url': {
            let input = selectionText.trim().toLowerCase();

            if (!/^https?:\/\//i.test(input)) {
                input = 'https://' + input;
            }

            if (isValidUrl(input)) {
                const prefs = await loadPreferences();
                const urls = prefs.url.urls;

                const [activeTab] = await browser.tabs.query({
                    active: true,
                    currentWindow: true,
                });

                let index = activeTab.index + 1;
                const encodedUrl = encodeURIComponent(input);

                let domain = '';

                try {
                    const urlObj = new URL(input);

                    domain = urlObj.hostname;
                } catch (e) {}

                for (const url of urls) {
                    const finalUrl = normaliseUrl(
                        url
                            .replace('{url}', input)
                            .replace('{encodedUrl}', encodedUrl)
                            .replace('{domain}', domain)
                    );

                    await browser.tabs.create({
                        url: finalUrl,
                        index,
                        active: false,
                    });
                    index++;
                }

                if (prefs.url.copyToClipboard) {
                    let toCopy = input;
                    if (prefs.url.sanitise) {
                        toCopy = toCopy.replace(/\./g, '[.]');
                    }
                    try {
                        await copyToClipboard(toCopy);
                    } catch (err) {
                        console.error('Clipboard write failed:', err);
                    }
                }
            }
            break;
        }

        default:
            console.log(`Unknown menu item: ${menuItemId}`);
    }
});
