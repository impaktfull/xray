// Compares the built site in dist/ with the static site on `main`, so the Astro migration
// can be proven to change nothing a visitor or crawler sees.
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pages = ['index', 'install', 'license', 'terms-and-conditions'];

const oldPage = (name) =>
  execFileSync('git', ['show', `main:website/${name}.html`], { encoding: 'utf8' });
const newPage = (name) => readFileSync(new URL(`../dist/${name}.html`, import.meta.url), 'utf8');

const withoutComments = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const visibleText = (html) =>
  withoutComments(html)
    .replace(/<(script|style)[\s\S]*?<\/\1>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const all = (html, re) => [...withoutComments(html).matchAll(re)].map((m) => m[1]).sort();
// Astro bundles the stylesheet and the navbar/alpha-form scripts and fingerprints them; their
// behaviour is checked by hand in the browser instead.
const isAstroAsset = (url) => url.startsWith('/_astro/') || url.startsWith('styles/styles.css');
const isBundledScript = (source) => /navbar|alpha-form/.test(source);

const checks = {
  text: (html) => [visibleText(html)],
  links: (html) => all(html, /\s(?:href|src)="([^"]*)"/g).filter((u) => !isAstroAsset(u)),
  ids: (html) => all(html, /\sid="([^"]*)"/g),
  meta: (html) => all(html, /(<meta[^>]*>)/g).map((m) => m.replace(/\s*\/?>$/, '>').replace(/\s+/g, ' ')),
  inlineScripts: (html) =>
    all(html, /<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)
      .map((s) => s.replace(/\s+/g, ' ').trim())
      .filter((s) => !isBundledScript(s)),
};

let failed = false;
for (const page of pages) {
  const before = oldPage(page);
  const after = newPage(page);
  for (const [name, check] of Object.entries(checks)) {
    const a = check(before);
    const b = check(after);
    const missing = a.filter((x) => !b.includes(x));
    const added = b.filter((x) => !a.includes(x));
    if (missing.length || added.length) {
      failed = true;
      console.log(`✗ ${page}: ${name}`);
      for (const x of missing) console.log(`  - ${x.slice(0, 200)}`);
      for (const x of added) console.log(`  + ${x.slice(0, 200)}`);
    }
  }
}
console.log(failed ? '\nDifferences found.' : 'No differences.');
process.exit(failed ? 1 : 0);
