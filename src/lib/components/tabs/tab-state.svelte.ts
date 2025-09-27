import type { Tab } from '@src/lib/components/tabs/tab.type';

export class TabState {
    #tabs = $state<Tab[]>([]);

    constructor(initialTabs: Tab[]) {
        let firstSelectedIndex = initialTabs.findIndex(tab => tab.isSelected);
        if (firstSelectedIndex === -1) {
            firstSelectedIndex = 0;
        }
        this.#tabs = initialTabs.map((tab, index) => ({
            ...tab,
            isSelected: index === firstSelectedIndex,
        }));
    }

    get tabs(): Tab[] {
        return this.#tabs;
    }

    get selectedTab(): Tab | null {
        return this.#tabs.find(tab => tab.isSelected) ?? null;
    }

    set selectedTab(id: string) {
        this.#tabs = this.#tabs.map(tab => ({
            ...tab,
            isSelected: tab.id === id,
        }));
    }

    onclick = (clickedTab: Tab): void => {
        this.selectedTab = clickedTab.id;
    };
}
