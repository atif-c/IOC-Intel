<script lang="ts">
    import type { MouseEventHandler } from 'svelte/elements';

    let { onclick }: { onclick: MouseEventHandler<HTMLButtonElement> } =
        $props();
    let aria = `Add link`;
</script>

<button
    aria-label={aria}
    class="add-link-button mt-1rem"
    {onclick}
>
    <img
        alt={aria}
        src="/assets/add-link-icon.svg"
        class="add-link-icon"
    />
</button>

<style>
    .add-link-button {
        cursor: pointer;
        height: 2rem;
        width: 2.5rem;
        background-color: transparent;
        padding: 0.5rem 0rem;
        border: none;
        border-radius: 0.35rem;

        box-shadow: var(--shadow-lg);
    }

    .add-link-icon {
        height: 100%;
        width: 100%;
    }
</style>
