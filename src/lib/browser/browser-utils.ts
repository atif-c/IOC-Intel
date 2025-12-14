import type { Preferences } from '@src/lib/storage/default-preferences';
import Browser from 'webextension-polyfill';

export const useLocalStorage = false;

/**
 * Returns the storage area based on the current `useLocalStorage` flag.
 *
 * @returns {Browser.Storage.StorageArea} The selected browser storage area.
 */
export const getStorageArea = (): Browser.Storage.StorageArea => {
    return useLocalStorage ? Browser.storage.local : Browser.storage.sync;
};

/**
 * Removes any previously added context menu items from the browser extension.
 *
 * @returns {Promise<void>} Promise that resolves once all context menu items have been removed
 * @throws {Error} If the browser API fails to remove context menu items
 */
const removeContextMenuItems = async (): Promise<void> => {
    try {
        return Browser.contextMenus.removeAll();
    } catch (err) {
        throw new Error(`Failed to remove context menu items: ${err}`);
    }
};

/**
 * Updates the  context menu based on configured user preferences.
 *
 * Removes all existing extension-owned context menu items, then conditionally
 * creates the top-level "IOC Intel" menu entry if at least one IOC definition
 * in the preferences is marked as active.
 *
 * The menu is only shown for text selections. No menu items are created when
 * there are zero active IOC definitions.
 *
 * @param preferences - User preferences containing IOC definitions
 * @returns Promise that resolves once context menu items have been updated
 *
 * @remarks
 * Errors are silently ignored to account for environments where the
 * `contextMenus` API is unavailable.
 */
export const setContextMenuItem = async (
    preferences: Preferences
): Promise<void> => {
    try {
        await removeContextMenuItems();

        const activeCount = Object.values(preferences).filter(
            value => value.active
        ).length;

        if (activeCount > 0) {
            Browser.contextMenus.create({
                id: 'IOCIntel',
                title: 'IOC Intel',
                contexts: ['selection'],
            });
        }
    } catch {
        // ignore errors where the contextmenu api is not available
    }
};

/**
 * Gets the tab index where new tabs should be inserted (after the current active tab).
 *
 * @returns {Promise<number>} Index position for new tabs, or 0 if no active tab is found
 * @throws {Error} If browser tabs API query fails
 *
 * @example
 * const tabIndex = await getTabInsertionIndex(); // Returns: 3 (if active tab is at index 2)
 */
export const getTabInsertionIndex = async (): Promise<number> => {
    const [activeTab] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    return activeTab?.index !== undefined ? activeTab.index + 1 : 0;
};

/**
 * Creates a new browser tab in the background at the specified index position.
 *
 * The tab is created but not activated, allowing it to load without switching focus.
 *
 * @param {string} url - URL to load in the new tab
 * @param {number} index - Index position where the tab should be inserted
 * @returns {Promise<Browser.Tabs.Tab>} Promise that resolves with the created tab object
 * @throws {Error} If the browser API fails to create the tab
 */
export const createTab = async (
    url: string,
    index: number
): Promise<Browser.Tabs.Tab> => {
    try {
        return Browser.tabs.create({ url, index, active: false });
    } catch (err) {
        throw new Error(`Failed to create tab with URL "${url}": ${err}`);
    }
};

/**
 * Copies text to the clipboard by injecting a script into the active tab.
 *
 * Uses the browser's scripting API to inject a script that writes to the clipboard
 * using the Clipboard API. This approach is necessary because browser extensions
 * require a user interaction context to access the clipboard directly.
 *
 * @param {string} text - Text to copy to the clipboard
 * @returns {Promise<Browser.Scripting.InjectionResult[]>} Promise that resolves with the script execution results
 * @throws {Error} If no active tab is found, if the browser API fails to execute the script
 *                 if the clipboard write operation fails, or if the tab doesn't support script injection
 */
export const copyToClipboard = async (
    text: string
): Promise<Browser.Scripting.InjectionResult[]> => {
    const [tab]: Browser.Tabs.Tab[] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
    });

    if (!tab?.id) throw new Error('No active tab found');

    return Browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: async (t: string): Promise<void> => {
            await navigator.clipboard.writeText(t);
        },
        args: [text],
    });
};
