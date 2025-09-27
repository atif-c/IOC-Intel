<script lang="ts">
    let { iconSrc, title }: { iconSrc: string; title: string } = $props();
</script>

<div class="title-bar">
    <img
        class="icon"
        alt="icon"
        src={iconSrc}
    />
    <h1>{title}</h1>
</div>

<style>
    .title-bar {
        display: flex;
        align-items: center;

        .icon {
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>
