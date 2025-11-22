<script lang="ts">
    let { iconSrc, title }: { iconSrc: string; title: string } = $props();
    const alt: string = 'IOC Intel Icon';
</script>

<div class="title-bar">
    <img
        src={iconSrc}
        {alt}
    />
    <h1>{title}</h1>
</div>

<style>
    .title-bar {
        display: flex;
        align-items: center;

        img {
            height: 1.5rem;
            width: 1.5rem;
            margin-right: 0.5rem;
        }
    }
</style>
