<script lang="ts">
    import type { HTMLAttributes, MouseEventHandler } from 'svelte/elements';

    let {
        onclick,
        ...restProps
    }: {
        onclick: MouseEventHandler<HTMLButtonElement>;
    } & HTMLAttributes<HTMLButtonElement> = $props();
    const ariaLabel = `Add URL`;
</script>

<button
    aria-label={ariaLabel}
    {onclick}
    {...restProps}
>
    <img
        src="/assets/add-url-icon.svg"
        alt={ariaLabel}
    />
</button>

<style>
    button {
        cursor: pointer;
        height: 2rem;
        width: 2.5rem;
        box-shadow: var(--shadow-lg);
        border: none;
        border-radius: 0.25rem;
        background-color: transparent;
        padding: 0.5rem 0rem;

        &:focus-visible {
            outline: 0.1rem solid var(--clr-selected);
        }
    }

    img {
        height: 100%;
        width: 100%;
    }
</style>
