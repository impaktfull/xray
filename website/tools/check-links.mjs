// Fails the build when a page links to a file, anchor or demo tour step that doesn't exist.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const steps = [...readFileSync(new URL('../src/demo/tour/steps.ts', import.meta.url), 'utf8').matchAll(/id: '([\w-]+)'/g)].map((m) => m[1]);
const pages = readdirSync(dist).filter((f) => f.endsWith('.html'));
const problems = [];

for (const page of pages) {
  const html = readFileSync(join(dist, page), 'utf8');
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const [, url] of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|data:)/.test(url)) continue;
    if (url.startsWith('#demo/')) {
      if (!steps.includes(url.slice(6))) problems.push(`${page}: unknown demo step ${url}`);
    } else if (url.startsWith('#')) {
      if (url !== '#' && !ids.has(url.slice(1))) problems.push(`${page}: missing anchor ${url}`);
    } else {
      const path = url.split(/[?#]/)[0].replace(/^\//, '');
      const exists = [path, `${path}.html`, join(path, 'index.html')].some((p) => p && existsSync(join(dist, p)));
      if (!exists) problems.push(`${page}: missing file ${url}`);
    }
  }
}

for (const p of problems) console.log(`✗ ${p}`);
console.log(problems.length ? `\n${problems.length} broken link(s).` : `All links in ${pages.length} pages resolve.`);
process.exit(problems.length ? 1 : 0);
