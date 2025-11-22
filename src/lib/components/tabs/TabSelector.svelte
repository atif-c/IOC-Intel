<script lang="ts">
    import type { TabState } from '@src/lib/components/tabs/tab-state.svelte';
    import TabButton from '@src/lib/components/tabs/TabButton.svelte';

    let { tabState }: { tabState: TabState } = $props();
</script>

<div class="tab-selector">
    {#each tabState.tabs as tab}
        <TabButton
            {tab}
            class={tab.isSelected ? 'selected' : ''}
            onclick={() => tabState.onclick(tab)}
        />
    {/each}
</div>

<style>
    .tab-selector {
        --tab-spacing: 0.25rem;
        display: flex;
        gap: var(--tab-spacing);
        box-shadow: var(--shadow-lg);
        border-radius: 0.25rem;
        padding: var(--tab-spacing);
    }
</style>
