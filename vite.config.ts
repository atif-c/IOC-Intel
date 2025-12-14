import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
    plugins: [
        svelte(),
        viteStaticCopy({
            targets: [
                {
                    src: 'src/assets',
                    dest: '',
                },
            ],
        }),
    ],
    resolve: {
        alias: { '@src': '/src' },
    },
    build: {
        outDir: './dist/vite-output',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: 'src/popup/popup.html',
                background: 'src/lib/browser/background.ts',
                prompt: 'src/lib/browser/prompt.ts',
            },
            output: {
                assetFileNames: 'assets/[name][extname]',
                chunkFileNames: 'chunks/[name].js',
                entryFileNames: 'entries/[name].js',
            },
        },
        assetsInlineLimit: 0,
    },
});
