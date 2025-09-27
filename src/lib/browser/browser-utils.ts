import Browser from 'webextension-polyfill';
import type {
    IOCDefinition,
    Preferences,
} from '@src/lib/storage/default-preferences';

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
 * @returns {Promise<void>} A promise that resolves once all context menu items have been removed.
 */
export const removeContextMenuItems = async () => {
    await Browser.contextMenus.removeAll();
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
 * Copies the provided text to the clipboard in the context of the active browser tab.
 *
 * Uses the browser's scripting API to execute a script that writes the text
 * to the clipboard. Throws an error if no active tab is found.
 *
 * @param {string} text - The text to copy to the clipboard.
 * @returns {Promise<void>} A promise that resolves once the text has been copied.
 *
 * @throws {Error} If there is no active tab available to execute the script
 */
export const copyToClipboard = async (text: string) => {
    const [tab] = await Browser.tabs.query({
        active: true,
        currentWindow: true,
    });
    if (!tab?.id) throw new Error('No active tab found');

    await Browser.scripting.executeScript({
        target: { tabId: tab.id },
        func: (t: string) => {
            navigator.clipboard.writeText(t).catch(console.error);
        },
        args: [text],
    });
};
