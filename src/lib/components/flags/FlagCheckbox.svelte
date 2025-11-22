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
            height: 0;
            width: 0;

            &:checked + .box {
                box-shadow: var(--shadow-md-inset), var(--shadow-lg);

                &::after {
                    opacity: 0.75;
                }
            }

            &:focus-visible + .box {
                outline: 0.1rem solid var(--clr-selected);
            }
        }

        .box {
            position: relative;
            height: 1.5rem;
            width: 1.5rem;
            box-shadow: var(--shadow-lg);
            border-radius: 0.25rem;

            &::after {
                position: absolute;
                transform: translate(-50%, -50%);
                top: 50%;
                left: 50%;
                opacity: 0;
                height: 60%;
                width: 60%;
                border-radius: 0.1rem;
                background-color: var(--clr-positive);
                content: '';
                
                transition:
                    opacity 0.1s,
                    transform 0.1s;
            }
        }
    }
</style>
