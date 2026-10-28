import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const runbook = fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url));

export default defineConfig({
  plugins: [
    sveltekit({
      adapter: adapter(),
      extensions: ['.svelte', '.svx'],
      preprocess: [vitePreprocess(), mdsvex({ extensions: ['.svx'], layout: { runbook } })],
      // Prerendered pages carry their CSS inline, so a built page reads on its own.
      inlineStyleThreshold: Infinity,
    }),
  ],
});
