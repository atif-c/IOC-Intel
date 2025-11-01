<script lang="ts">
    import { isValidUrl } from '@src/lib/IOC/ioc-utils';

    let { url = $bindable() }: { url: string } = $props();
</script>

<input
    type="text"
    bind:value={url}
    placeholder={url.length === 0 ? 'Enter a URL' : undefined}
    class:invalid={!isValidUrl(url) && url.length > 0}
/>

<style>
    input[type='text'] {
        outline: none;

        width: 100%;
        background-color: transparent;
        padding: 0.5rem 1rem;
        border: 1px solid transparent;
        border-radius: 0.25rem;

        box-shadow: var(--shadow-lg), var(--shadow-lg-inset);

        margin-top: 1rem;

        &.invalid {
            border: 0.1rem solid var(--clr-negative);
        }

        &:focus-visible {
            outline: 0.1rem solid var(--clr-selected);
        }
    }
</style>
