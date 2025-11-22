<script lang="ts">
    import { isValidUrl, normaliseUrl } from '@src/lib/IOC/ioc-utils';
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        url = $bindable(),
        ...restProps
    }: { url: string } & HTMLAttributes<HTMLInputElement> = $props();
    let focused = $state(false);

    const shortUrl = (URLString: string) => {
        try {
            const URlObject = new URL(normaliseUrl(URLString));
            return URlObject.hostname;
        } catch (e) {
            return URLString;
        }
    };

    const oninput = (event: Event) => {
        const target = event.currentTarget as HTMLInputElement;
        url = target.value;
    };
    const onfocus = (event: FocusEvent) => {
        focused = true;
        const target = event.target as HTMLInputElement;
        const length = target.value.length;
        target.setSelectionRange(length, length);
    };

    const onblur = () => (focused = false);
</script>

<input
    type="text"
    class:invalid={!isValidUrl(url) && url.length > 0}
    value={focused ? url : shortUrl(url)}
    placeholder={url.length === 0 ? 'Enter a URL' : undefined}
    {oninput}
    {onfocus}
    {onblur}
    {...restProps}
/>

<style>
    input[type='text'] {
        width: 100%;
        box-shadow: var(--shadow-lg), var(--shadow-lg-inset);
        outline: none;
        border: transparent;
        border-radius: 0.25rem;
        background-color: transparent;
        padding: 0.5rem 1rem;
        color: var(--clr-muted);

        &:focus {
            color: var(--clr-light);
        }

        &.invalid {
            border: 0.1rem solid var(--clr-negative);
        }

        &:focus-visible {
            outline: 0.1rem solid var(--clr-selected);
        }
    }
</style>
