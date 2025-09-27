<script lang="ts">
    import type { Flag } from '@src/lib/storage/default-preferences';

    let { flag = $bindable() }: { flag: Flag } = $props();
</script>

<label>
    <input
        type="checkbox"
        bind:checked={flag.value}
    />
    <span class="box"></span>
    {flag.name}
</label>

<style>
    label {
        display: flex;
        position: relative;
        align-items: center;
        cursor: pointer;
        gap: 1rem;

        input[type='checkbox'] {
            position: absolute;
            opacity: 0;
            width: 0;
            height: 0;

            &:checked + .box {
                box-shadow: var(--shadow-md-inset), var(--shadow-lg);

                &::after {
                    opacity: 0.75;
                }
            }
        }

        .box {
            position: relative;
            width: 1.5rem;
            height: 1.5rem;
            border-radius: 0.25rem;
            box-shadow: var(--shadow-lg);

            &::after {
                position: absolute;
                background-color: var(--clr-positive);
                content: '';
                height: 60%;
                width: 60%;
                top: 50%;
                left: 50%;
                border-radius: 0.1rem;
                transform: translate(-50%, -50%);
                opacity: 0;
                transition:
                    opacity 0.1s,
                    transform 0.1s;
            }
        }
    }
</style>
