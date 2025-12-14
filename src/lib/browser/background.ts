import { executeIOCIntel } from '@src/lib/IOC/execute-IOC-Intel';
import { normaliseString } from '@src/lib/IOC/ioc-utils';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';
import Browser from 'webextension-polyfill';

/**
 * Handles context menu clicks.
 * Executes IOC Intel investigation on the selected text if the menu item is valid.
 *
 * @param {Browser.Menus.OnClickData} info - Context menu click information including selected text and menu item ID
 * @returns {Promise<void>} - Promise that resolves when the IOC Intel execution is complete or validation fails
 * @throws {Error} - If executeIOCIntel encounters an error during execution
 */
const handleContextMenuClick = async (
    info: Browser.Menus.OnClickData
): Promise<boolean> => {
    if (!info.selectionText) return Promise.resolve(false);
    const normalisedUserSelection: string = normaliseString(info.selectionText);
    return executeIOCIntel(normalisedUserSelection);
};

async function init() {
    // Listen for storage changes and reload preferences automatically
    Browser.storage.onChanged.addListener((): void => {
        PreferencesState.getInstance().stateManager.load();
    });
    // Listen for context menu clicks to trigger IOC Intel investigations
    Browser.contextMenus.onClicked.addListener(handleContextMenuClick);
}

init();
