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
        class="checkbox"
        type="checkbox"
        bind:checked
        {...restProps}
    />
    <span class="slider"></span>
</label>

<style>
    .switch {
        /* Base dimensions */
        --switch-width: 3rem;
        --switch-height: 1.5rem;
        --switch-radius: 0.25rem;
        --switch-shadow: var(--shadow-lg), var(--shadow-lg-inset);
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
        width: var(--switch-width);
        height: var(--switch-height);

        .checkbox {
            opacity: 0;
            width: 0;
            height: 0;

            &:checked + .slider::before {
                transform: translateX(var(--slider-translate-x));
                background-color: var(--clr-positive);
            }
        }

        .slider {
            position: absolute;
            inset: 0;
            background-color: transparent;
            border-radius: var(--switch-radius);
            box-shadow: var(--switch-shadow);

            &::before {
                position: absolute;
                content: '';
                background-color: var(--clr-negative);
                border-radius: var(--slider-radius);
                width: var(--slider-width);
                height: var(--slider-height);
                left: var(--slider-left);
                top: var(--slider-top);
                transition: var(--slider-transition);
            }
        }
    }
</style>
