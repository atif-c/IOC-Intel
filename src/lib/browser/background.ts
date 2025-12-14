import { executeIOCIntel } from '@src/lib/IOC/execute-IOC-Intel';
import { normaliseString } from '@src/lib/IOC/ioc-utils';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';
import Browser from 'webextension-polyfill';

/**
 * Handles runtime messages dispatched to the background script.
 *
 * When a message requests IOC execution, this handler validates the message,
 * normalises the IOC, and runs it through executeIOCIntel.
 *
 * @param {unknown} message - Incoming message
 * @returns {Promise<boolean>} - Promise that resolves to `true` if IOC execution succeeded.
 * Resolves to `false` if the message is not a executeIOCIntelRequest, IOC
 * validation failed or the IOC type is inactive.
 */
const handleRuntimeMessage = (message: unknown): Promise<boolean> => {
    // Check if the message is of type executeIOCIntelRequest
    if (typeof message !== 'object' || message === null)
        return Promise.resolve(false);

    const msg = message as Record<string, unknown>;

    if (msg.action !== 'executeIOCIntel' || typeof msg.IOC !== 'string')
        return Promise.resolve(false);

    // Proceed with the normalisation and execution logic
    const normalisedIOC: string = normaliseString(msg.IOC);

    return executeIOCIntel(normalisedIOC);
};

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

/**
 * Initialises background script event listeners.
 *
 * This function establishes listeners for:
 * - Storage changes: Automatically reloads preferences when browser storage is updated
 * - Runtime messages: Processes IOC Intel execution requests from other extension components
 * - Context menu clicks: Handles user-initiated IOC investigations via context menu
 *
 * @returns {Promise<void>} - Promise that resolves when all event listeners are successfully registered.
 */
const init = async (): Promise<void> => {
    // Listen for storage changes and reload preferences automatically
    Browser.storage.onChanged.addListener((): void => {
        PreferencesState.getInstance().stateManager.load();
    });

    // Listen for runtime messages from other extension components
    Browser.runtime.onMessage.addListener(handleRuntimeMessage);

    // Listen for context menu clicks to trigger IOC Intel investigations
    Browser.contextMenus.onClicked.addListener(handleContextMenuClick);
};

init();
