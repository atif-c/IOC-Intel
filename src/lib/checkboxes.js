/**
 * Initializes checkbox visibility logic after DOM is fully loaded.
 * Attaches debounced event listeners and applies initial visibility state.
 */
document.addEventListener('DOMContentLoaded', () => {
    const checkboxes = getCheckboxes();

    // Initial visibility setup
    // updateVisibility();

    setTimeout(updateVisibility, 50);


    // Attach change listeners with debouncing to minimize layout recalculation
    checkboxes.forEach((checkbox) => {
        checkbox.addEventListener('change', updateVisibility);
    });
});

/**
 * Retrieves all checkbox inputs inside elements with the class `.checkbox-text`.
 *
 * @returns {HTMLInputElement[]} Array of checkbox input elements.
 */
function getCheckboxes() {
    return Array.from(
        document.querySelectorAll('.checkbox-text input[type="checkbox"]')
    );
}

/**
 * Retrieves all elements with the class `.checkbox-text`, which serve as labeled containers
 * for checkboxes and related hierarchy data.
 *
 * @returns {HTMLElement[]} Array of label wrapper elements.
 */
function getCheckboxContainers() {
    return Array.from(document.querySelectorAll('.checkbox-text'));
}

/**
 * Updates the visibility of `.checkbox-text` blocks based on the hierarchy defined by `data-level`.
 * Only shows children of checked checkboxes, and hides all levels deeper than 1 by default.
 *
 * Expected HTML structure:
 * - Each `.checkbox-text` has a `data-level` attribute (integer).
 * - Children are listed sequentially in the DOM after their parent.
 */
function updateVisibility() {
    const allLabels = getCheckboxContainers();

    // Hide all levels > 1 by default
    allLabels.forEach((label) => {
        const level = parseInt(label.dataset.level, 10);
        if (!isNaN(level) && level > 1) {
            label.style.display = 'none';
        }
    });

    // Show children of checked checkboxes
    allLabels.forEach((label, index) => {
        const checkbox = label.querySelector('input[type="checkbox"]');
        const currentLevel = parseInt(label.dataset.level, 10);
        if (!checkbox || isNaN(currentLevel)) return;

        if (checkbox.checked) {
            for (let i = index + 1; i < allLabels.length; i++) {
                const childLabel = allLabels[i];
                const childLevel = parseInt(childLabel.dataset.level, 10);
                if (isNaN(childLevel)) continue;

                if (childLevel <= currentLevel) break;

                if (childLevel === currentLevel + 1) {
                    childLabel.style.display = 'flex';
                }
            }
        }
    });
}
