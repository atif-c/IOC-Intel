<script lang="ts">
    import { isValidUrl, normaliseUrl } from '@src/lib/IOC/ioc-utils';

    let { url = $bindable() }: { url: string } = $props();
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
    value={focused ? url : shortUrl(url)}
    {oninput}
    {onfocus}
    {onblur}
    placeholder={url.length === 0 ? 'Enter a URL' : undefined}
    class:invalid={!isValidUrl(url) && url.length > 0}
/>

<style>
    input[type='text'] {
        outline: none;

        color: var(--clr-muted);
        width: 100%;
        background-color: transparent;
        padding: 0.5rem 1rem;
        border: transparent;
        border-radius: 0.25rem;

        box-shadow: var(--shadow-lg), var(--shadow-lg-inset);

        margin-top: 1rem;

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
