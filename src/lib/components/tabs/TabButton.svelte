<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';
    import type { Tab } from '@src/lib/components/tabs/tab.type';

    let {
        tab,
        ...restProps
    }: {
        tab: Tab;
    } & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<button {...restProps}>{tab.displayName}</button>

<style>
    button {
        cursor: pointer;
        font-size: 0.75rem;
        background-color: transparent;
        padding: 0.25rem 0.75rem;
        border: 0px;
        border-radius: 0.25rem;
        transition: box-shadow 0.1s;

        &.selected {
            box-shadow: var(--shadow-md-inset);
        }

        &:focus-visible {
            outline: 0.1rem solid var(--clr-selected);
        }
    }
</style>
