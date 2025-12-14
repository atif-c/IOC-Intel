import type {
    IOCDefinition,
    Preferences,
} from '@src/lib/storage/default-preferences';
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
export const removeContextMenuItems = async (): Promise<void> => {
    try {
        return Browser.contextMenus.removeAll();
    } catch (err) {
        throw new Error(`Failed to remove context menu items: ${err}`);
    }
};

/**
 * Creates or updates a context menu item for the browser extension.
 *
 * The menu item will appear in the context of a text selection.
 *
 * @param {string} id - The unique identifier for the context menu item.
 * @param {string} title - The display title of the context menu item.
 * @returns {Promise<void>} A promise that resolves once the context menu item has been created or updated.
 *
 * @throws {Error} If the browser API fails to create the context menu item
 */
export const updateContextMenu = async (id: string, title: string) => {
    try {
        await Browser.contextMenus.create({
            id,
            title,
            contexts: ['selection'],
        });
    } catch (err) {
        throw new Error(`Error updating context menu: ${err}`);
    }
};

/**
 * Sets the context menu items for the browser extension based on the provided preferences.
 *
 * First, it removes all existing context menu items. Then, for each active
 * IOCDefinition in the provided preferences, it creates a corresponding
 * context menu item.
 *
 * @param {Preferences} preferences - The user preferences containing IOCDefinitions.
 * @returns {Promise<void>} A promise that resolves once all context menu items have been updated.
 */
export const setContextMenuItems = async (preferences: Preferences) => {
    await removeContextMenuItems();
    for (const [key, IOCDef] of Object.entries(preferences) as [
        string,
        IOCDefinition
    ][]) {
        IOCDef.active && (await updateContextMenu(key, IOCDef.name));
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
