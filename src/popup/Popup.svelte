<script lang="ts">
    import SelectedIOCPanel from '@src/lib/components/popup/SelectedIOCPanel.svelte';
    import Switch from '@src/lib/components/popup/Switch.svelte';
    import TitleBar from '@src/lib/components/popup/TitleBar.svelte';
    import { TabState } from '@src/lib/components/tabs/tab-state.svelte';
    import TabSelector from '@src/lib/components/tabs/TabSelector.svelte';
    import { defaultPreferences } from '@src/lib/storage/default-preferences';
    import { PreferencesState } from '@src/lib/storage/preferences-state.svelte';

    const preferences = PreferencesState.getInstance();

    preferences.initialiseAutoSave();

    const tabConfigs = $derived(
        Object.entries(defaultPreferences).map(([key, value], index) => ({
            id: key,
            displayName: value.name,
            isSelected: index === 0,
        }))
    );
    const tabState = new TabState(tabConfigs);

    let selectedTabState = $derived(
        preferences.getSelectedTabsIOCState(tabState)
    );
</script>

<div class="header pb-2rem btm-border">
    <TitleBar
        iconSrc="/assets/logo/logo.svg"
        title="IOC Intel"
    />
    <TabSelector {tabState} />
</div>

{#if selectedTabState != undefined}
    <div class="active-switch pb-1rem mt-1rem btm-border">
        <Switch bind:checked={selectedTabState!.active} />
    </div>

    <div
        class="ioc-panel mt-2rem pb-2rem"
        class:disabled={!selectedTabState.active}
    >
        <SelectedIOCPanel
            {preferences}
            {tabState}
        />
    </div>
{/if}

<style>
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .ioc-panel.disabled {
        pointer-events: none;
        opacity: 0.5;
        filter: blur(0.1rem);
    }
</style>
