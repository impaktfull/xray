import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';
import astro from 'eslint-plugin-astro';

export default defineConfig(
  { ignores: ['dist/', '.astro/', 'node_modules/', 'public/'] },
  tseslint.configs.recommended,
  astro.configs.recommended,
  {
    // Google's gtag snippet must push the `arguments` object itself; rest parameters break it.
    files: ['src/layouts/HomeLayout.astro', 'src/layouts/HomeLayout.astro/*'],
    rules: { 'prefer-rest-params': 'off' },
  },
);
