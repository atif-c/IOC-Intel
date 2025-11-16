<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';

    let { onclick }: { onclick: MouseEventHandler<HTMLButtonElement> } =
        $props();
    let aria = `Add URL`;
</script>

<button
    aria-label={aria}
    class="add-url-button mt-1rem"
    {onclick}
>
    <img
        alt={aria}
        src="/assets/add-url-icon.svg"
        class="add-url-icon"
    />
</button>

<style>
    .add-url-button {
        cursor: pointer;
        width: 2.5rem;
        height: 2rem;
        background-color: transparent;
        padding: 0.5rem 0rem;
        border: none;
        border-radius: 0.25rem;

        box-shadow: var(--shadow-lg);

        &:focus-visible {
            outline: 0.1rem solid var(--clr-selected);
        }
    }

    .add-url-icon {
        height: 100%;
        width: 100%;
    }
</style>
