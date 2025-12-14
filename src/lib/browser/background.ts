import { executeIOCIntel } from '@src/lib/IOC/execute-IOC-Intel';
import { normaliseString } from '@src/lib/IOC/ioc-utils';
import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';
import Browser from 'webextension-polyfill';

async function init() {
    // Listen for storage changes and reload preferences automatically
    Browser.storage.onChanged.addListener((): void => {
        PreferencesState.getInstance().stateManager.load();
    });

    // Handle context menu clicks
    Browser.contextMenus.onClicked.addListener(async info => {
        if (!preferences.state || Object.keys(preferences.state).length === 0) {
            await preferences.stateManager.load();
        }

        if (!preferences.state || !(info.menuItemId in preferences.state)) {
            return;
        }

        if (!(info.menuItemId in preferences.state)) return;

        const normalisedUserSelection = normaliseString(info.selectionText!);

        const [activeTab] = await Browser.tabs.query({
            active: true,
            currentWindow: true,
        });
        let tabIndex = activeTab.index + 1;

        preferences.state[info.menuItemId].urls.forEach(url => {
            executeIOCIntel(
                info.menuItemId,
                normalisedUserSelection,
                preferences.state[info.menuItemId].flags,
                url,
                tabIndex
            );
            tabIndex++;
        });
    });
}

init();
