document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('#tab-selector button');
    const tabPanels = document.querySelectorAll('#tab-panels .tab-panel');

    // Ensure required elements exist
    if (!tabButtons.length || !tabPanels.length) return;

    // Setup click listeners
    tabButtons.forEach((button) => {
        const tabID = button.dataset.tab;
        button.addEventListener('click', () => setActiveTab(tabID));
    });

    // Activate the first tab
    const firstTabID = tabButtons[0].dataset.tab;
    setActiveTab(firstTabID);

    /**
     * Activates the tab and corresponding panel matching the given tab ID.
     * @param {string} tabID - The ID of the tab to activate.
     */
    function setActiveTab(tabID) {
        if (!tabID) return;

        tabButtons.forEach((btn) => {
            btn.classList.toggle('active', btn.dataset.tab === tabID);
        });

        tabPanels.forEach((panel) => {
            panel.classList.toggle('active', panel.dataset.tab === tabID);
        });
    }
});
