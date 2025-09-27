import {
    getStorageArea,
    removeContextMenuItems,
    setContextMenuItems,
} from '@src/lib/browser/browser-utils';
import { TabState } from '@src/lib/components/tabs/tab-state.svelte';
import { forEachUrls, isValidUrl } from '@src/lib/IOC/ioc-utils';
import { cleanObject } from '@src/lib/storage/clean-object';
import {
    defaultPreferences,
    type IOCDefinition,
    type Preferences,
} from '@src/lib/storage/default-preferences';
import { StateManager } from '@src/lib/storage/state-manager.svelte';

export class PreferencesState {
    // The single, and only, eagerly-created instance of PreferencesState

    private static instance: PreferencesState = new PreferencesState();

    stateManager: StateManager<Preferences>;
    storageLoaded = false;
    autoSaveEffectRegistered = false;

    /**
     * Initializes the preferences state manager and attempts to load
     * persisted state from storage.
     *
     * The constructor sets up a `StateManager` with the following options:
     * - `delay`: 500ms debounce for saving
     * - `maxWait`: 1000ms maximum wait before forced save
     *
     * If loading from storage fails, the error is logged, and continues
     * by using the default state.
     * @throws Logs an error if storage cannot be loaded
     */
    private constructor() {
        this.stateManager = new StateManager<Preferences>(
            this.#loadState,
            this.#saveState,
            { delay: 500, maxWait: 1000 }
        );

        try {
            this.stateManager.load();
            this.storageLoaded = true;
        } catch (error) {
            console.error('Failed to load from storage:', error);
        }
    }

    /**
     * Get the global {@link PreferencesState} singleton instance.
     *
     * @returns {PreferencesState} The single, eagerly-created instance.
     */
    static getInstance(): PreferencesState {
        return PreferencesState.instance;
    }

    /**
     * Gets the current preferences state.
     *
     * @returns {Preferences} The current state object managed by `StateManager`.
     */
    get state(): Preferences {
        return this.stateManager.state;
    }

    /**
     * Sets the preferences state.
     *
     * @param {Preferences} newState - The new state to set in the `StateManager`.
     */
    set state(newState: Preferences) {
        this.stateManager.state = newState;
    }

    #loadState = async (): Promise<Preferences> => {
        const raw = await getStorageArea().get();

        // Remove invalid URLs in-place using filter
        forEachUrls(raw, urls => {
            const validUrls = urls.filter(url => isValidUrl(url));
            urls.length = 0;
            urls.push(...validUrls);
        });

        const cleaned = cleanObject(raw, defaultPreferences);

        await removeContextMenuItems();

        await setContextMenuItems(cleaned);

        return cleaned;
    };

    #saveState = async <T>(state: T): Promise<void> => {
        // Remove invalid URLs in-place using filter
        forEachUrls(state, urls => {
            const validUrls = urls.filter(url => isValidUrl(url));
            urls.length = 0;
            urls.push(...validUrls);
        });
        const cleaned = cleanObject(state as {}, defaultPreferences);

        await getStorageArea().set(cleaned);
        await this.#loadState();
    };

    /**
     * Initializes auto-saving for the application state.
     *
     * Call this once in the root component or layout to enable automatic saving.
     * Registers an effect that tracks deep changes in the state and triggers
     * saving whenever the state changes. Subsequent calls have no effect.
     *
     * @returns {void}
     */
    initialiseAutoSave = () => {
        if (this.autoSaveEffectRegistered) return;
        this.autoSaveEffectRegistered = true;

        $effect(() => {
            JSON.stringify(this.stateManager.state);
            if (!this.storageLoaded) return;
            this.stateManager.save();
        });
    };

    /**
     * Retrieves the IOC (Indicator of Compromise) state for the currently
     * selected tab in a given `TabState`.
     *
     * @param {TabState} tabState - The `TabState` containing information about the currently selected tab.
     * @returns {IOCDefinition | undefined} The IOC state associated with the selected tab, or `undefined` if not found.
     *
     */
    getSelectedTabsIOCState = (tabState: TabState) => {
        return this.state[tabState.selectedTab!.id as keyof Preferences] as
            | IOCDefinition
            | undefined;
    };
}
