<script lang="ts">
    import type { HTMLAttributes } from 'svelte/elements';

    let {
        checked = $bindable(),
        ...restProps
    }: {
        checked: boolean;
    } & HTMLAttributes<HTMLInputElement> = $props();
</script>

<label class="switch">
    <input
        type="checkbox"
        bind:checked
        {...restProps}
    />
    <span class="slider"></span>
</label>

<style>
    .switch {
        /* Base dimensions */
        --switch-height: 1.5rem;
        --switch-width: 3rem;
        --switch-shadow: var(--shadow-lg), var(--shadow-lg-inset);
        --switch-radius: 0.25rem;
        --slider-transition: transform 0.25s;

        /* Slider positioning */
        --slider-off-position: 0.2;
        --slider-on-position: 0.8;

        /* Slider sizing */
        --slider-height: calc(var(--switch-height) * 0.5);
        --slider-width: 0.2rem;
        --slider-radius: 0.1rem;

        /* Slider derived position */
        --slider-left: calc(
            var(--switch-width) * var(--slider-off-position) -
                var(--slider-width) / 2
        );
        --slider-top: calc((var(--switch-height) - var(--slider-height)) / 2);
        --slider-translate-x: calc(
            var(--switch-width) *
                (var(--slider-on-position) - var(--slider-off-position))
        );

        cursor: pointer;
        position: relative;
        display: inline-block;
        height: var(--switch-height);
        width: var(--switch-width);

        input[type='checkbox'] {
            opacity: 0;
            height: 0;
            width: 0;

            &:checked + .slider::before {
                transform: translateX(var(--slider-translate-x));
                background-color: var(--clr-positive);
            }

            &:focus-visible + .slider {
                outline: 0.1rem solid var(--clr-selected);
            }
        }

        .slider {
            position: absolute;
            inset: 0;
            box-shadow: var(--switch-shadow);
            border-radius: var(--switch-radius);
            background-color: transparent;

            &::before {
                position: absolute;
                top: var(--slider-top);
                left: var(--slider-left);
                height: var(--slider-height);
                width: var(--slider-width);
                border-radius: var(--slider-radius);
                background-color: var(--clr-negative);
                content: '';
                transition: var(--slider-transition);
            }
        }
    }
</style>
