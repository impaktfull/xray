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
  // No page renders code blocks, and Shiki's inline styles would need 'unsafe-inline'.
  markdown: { syntaxHighlight: false },
  // GitHub Pages can't send headers, so the policy is a <meta> tag with hashes
  // of the site's own inline scripts and styles. Google Analytics is listed
  // because it is loaded after cookie consent; the API takes the access form.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data: https://*.google-analytics.com https://*.googletagmanager.com",
        "connect-src 'self' https://api.xrayinspector.dev https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com",
        "font-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ],
      scriptDirective: {
        resources: ["'self'", 'https://www.googletagmanager.com'],
      },
      styleDirective: {
        // The site and the demo set a few style attributes; <style> elements stay hashed.
        resources: ["'self'", { resource: "'unsafe-inline'", kind: 'attribute' }],
      },
    },
  },
  fonts: [
    latinFont('Ubuntu', '--font-ubuntu', 'ubuntu', [400, 500, 700]),
    latinFont('Geologica', '--font-geologica', 'geologica', [400, 500, 600]),
    latinFont('Geist Mono', '--font-geist-mono', 'geist-mono', [400], ['monospace']),
  ],
});
