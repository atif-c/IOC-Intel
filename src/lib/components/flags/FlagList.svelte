<script lang="ts">
    import FlagCheckbox from '@src/lib/components/flags/FlagCheckbox.svelte';
    import FlagList from '@src/lib/components/flags/FlagList.svelte';
    import type { Flag } from '@src/lib/storage/default-preferences';

    let { flags = $bindable() }: { flags: Flag[] } = $props();
</script>

{#each flags as flag, index}
    <div class="mt-1rem">
        <FlagCheckbox bind:flag={flags[index]} />
    </div>

    {#if flag.subFlags && flag.value}
        <div class="ml-2-5rem">
            <FlagList bind:flags={flag.subFlags} />
        </div>
    {/if}
{/each}
