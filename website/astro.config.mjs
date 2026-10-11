import { defineConfig, fontProviders } from 'astro/config';
import preact from '@astrojs/preact';

// The site is in English, so only the Latin subset of each weight is shipped.
// The files come from the @fontsource packages and are served from this site:
// visitors never request fonts from a third party.
function latinFont(name, cssVariable, pkg, weights, fallbacks = ['sans-serif']) {
  return {
    provider: fontProviders.local(),
    name,
    cssVariable,
    fallbacks,
    options: {
      variants: weights.map((weight) => ({
        src: [`@fontsource/${pkg}/files/${pkg}-latin-${weight}-normal.woff2`],
        weight,
        style: 'normal',
      })),
    },
  };
}

export default defineConfig({
  site: 'https://xrayinspector.dev',
  output: 'static',
  // Keeps install.html, license.html and terms-and-conditions.html at their current URLs on GitHub Pages.
  build: { format: 'file' },
  integrations: [preact()],
  fonts: [
    latinFont('Ubuntu', '--font-ubuntu', 'ubuntu', [400, 500, 700]),
    latinFont('Geologica', '--font-geologica', 'geologica', [400, 500, 600]),
    latinFont('Geist Mono', '--font-geist-mono', 'geist-mono', [400], ['monospace']),
  ],
});
