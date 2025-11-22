<script lang="ts">
    import FlagList from '@src/lib/components/flags/FlagList.svelte';
    import type { TabState } from '@src/lib/components/tabs/tab-state.svelte';
    import AddUrlButton from '@src/lib/components/urls/AddUrlButton.svelte';
    import Url from '@src/lib/components/urls/Url.svelte';
    import type { PreferencesState } from '@src/lib/storage/preferences-state.svelte';

    let {
        preferences,
        tabState,
    }: { preferences: PreferencesState; tabState: TabState } = $props();

    let selectedTabIOCState = $derived(
        preferences.getSelectedTabsIOCState(tabState)
    );
</script>

<div class="flag-list pb-2rem btm-border">
    <h2>General</h2>
    <FlagList bind:flags={selectedTabIOCState!.flags} />
</div>

<div class="url-list mt-2rem">
    <h2>URLs</h2>
    {#each selectedTabIOCState!.urls as _url, index}
        <Url
            class="mt-1rem"
            bind:url={selectedTabIOCState!.urls[index]}
        />
    {/each}

    <AddUrlButton
        class="mt-1rem"
        onclick={() => {
            selectedTabIOCState!.urls.push('');
        }}
    />
</div>
