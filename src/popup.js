import { isValidUrl } from './lib/ioc-validator.js';
import { loadPreferences, savePreferences } from './lib/preferences.js';

document.addEventListener('DOMContentLoaded', async () => {
    // Load saved preferences and immediately re-save to trigger internal validation logic
    const prefs = await loadPreferences();
    await savePreferences(prefs);

    // Used to store debounce timers per input element without modifying DOM directly
    const debounceMap = new WeakMap();

    // Configuration describing each settings group (IP, URL, Hash)
    const settingsSections = [
        {
            key: 'ip',
            containerId: 'ip-settings-content',
            activeCheckboxId: 'ip-settings-active-checkbox',
            copyCheckboxId: 'ip-settings-copy-ioc',
            sanitiseCheckboxId: 'ip-settings-sanitise-ioc',
            urlListId: 'ip-settings-url-list',
            addButtonId: 'ip-settings-url-add',
        },
        {
            key: 'url',
            containerId: 'url-settings-content',
            activeCheckboxId: 'url-settings-active-checkbox',
            copyCheckboxId: 'url-settings-copy-ioc',
            sanitiseCheckboxId: 'url-settings-sanitise-ioc',
            urlListId: 'url-settings-url-list',
            addButtonId: 'url-settings-url-add',
        },
        {
            key: 'hash',
            containerId: 'hash-settings-content',
            activeCheckboxId: 'hash-settings-active-checkbox',
            copyCheckboxId: 'hash-settings-copy-ioc',
            sanitiseCheckboxId: null, // hash group does not have sanitise option
            urlListId: 'hash-settings-url-list',
            addButtonId: 'hash-settings-url-add',
        },
    ];

    // Initialize each settings group using shared logic
    settingsSections.forEach((section) => initSettingsSection(section, prefs));

    /**
     * Initialize settings logic for a given section (ip, url, or hash)
     */
    function initSettingsSection(section, prefs) {
        const {
            key,
            containerId,
            activeCheckboxId,
            copyCheckboxId,
            sanitiseCheckboxId,
            urlListId,
            addButtonId,
        } = section;

        const prefsSection = prefs[key];

        // Select relevant DOM elements
        const container = document.getElementById(containerId);
        const activeCheckbox = document.getElementById(activeCheckboxId);
        const copyCheckbox = document.getElementById(copyCheckboxId);
        const sanitiseCheckbox = sanitiseCheckboxId
            ? document.getElementById(sanitiseCheckboxId)
            : null;
        const urlList = document.getElementById(urlListId);
        const addButton = document.getElementById(addButtonId);

        // Exit early if required elements are missing (defensive check)
        if (
            !container ||
            !activeCheckbox ||
            !copyCheckbox ||
            !urlList ||
            !addButton
        )
            return;

        // Set initial UI state from preferences
        activeCheckbox.checked = prefsSection.active;
        copyCheckbox.checked = prefsSection.copyToClipboard;
        if (sanitiseCheckbox) sanitiseCheckbox.checked = prefsSection.sanitise;

        toggleContainer(container, prefsSection.active);

        // Toggle section visibility on checkbox change
        activeCheckbox.addEventListener('change', async (e) => {
            prefsSection.active = e.target.checked;
            toggleContainer(container, prefsSection.active);
            await savePreferences(prefs);
        });

        // Save copy-to-clipboard preference
        copyCheckbox.addEventListener('change', async (e) => {
            prefsSection.copyToClipboard = e.target.checked;
            await savePreferences(prefs);
        });

        // Save sanitise preference if applicable
        if (sanitiseCheckbox) {
            sanitiseCheckbox.addEventListener('change', async (e) => {
                prefsSection.sanitise = e.target.checked;
                await savePreferences(prefs);
            });
        }

        // Populate existing URLs as input fields
        prefsSection.urls.forEach((url) => addUrlInput(url, urlList));

        // Listen for changes on any URL input in this list
        urlList.addEventListener('input', (event) => {
            const input = event.target;
            if (!input.matches('input[type="text"]')) return;

            const isValid =
                isValidUrl(input.value) || input.value.trim() === '';

            // Add or remove visual invalid marker
            input.classList.toggle('invalid-url', !isValid);
            if (!isValid) return;

            // Debounce saving preferences to avoid excessive writes
            if (debounceMap.has(input)) {
                clearTimeout(debounceMap.get(input));
            }

            const timeoutId = setTimeout(() => {
                // Gather updated URL values
                const values = Array.from(
                    urlList.querySelectorAll('input[type="text"]')
                ).map((i) => i.value);

                prefsSection.urls = values;
                savePreferences(prefs);
            }, 500);

            debounceMap.set(input, timeoutId);
        });

        // Handle adding a new blank input field for URLs
        addButton.addEventListener('click', () => addUrlInput('', urlList));
    }

    /**
     * Show/hide the section content based on its "active" state
     */
    function toggleContainer(container, isActive) {
        container.classList.toggle('disabled', !isActive);
    }

    /**
     * Add a new URL input to the specified list container
     */
    function addUrlInput(value = '', targetContainer) {
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'url-input';
        input.value = value;
        input.placeholder = 'Enter a URL';
        targetContainer.appendChild(input);
    }
});
