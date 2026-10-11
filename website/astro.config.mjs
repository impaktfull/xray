import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

export default defineConfig({
  site: 'https://xrayinspector.dev',
  output: 'static',
  // Keeps install.html, license.html and terms-and-conditions.html at their current URLs on GitHub Pages.
  build: { format: 'file' },
  integrations: [preact()],
});
