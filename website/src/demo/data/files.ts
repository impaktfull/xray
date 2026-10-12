import type { FileNode } from '../model/types';
import { image, json, text } from './bodies';

const minutesAgo = (now: number, minutes: number) => now - minutes * 60_000;

export const createFiles = (now: number): FileNode => ({
  name: 'impaktfull_dashboard',
  kind: 'folder',
  modifiedAt: minutesAgo(now, 2),
  children: [
    {
      name: 'Documents',
      kind: 'folder',
      modifiedAt: minutesAgo(now, 2),
      children: [
        {
          name: 'exports',
          kind: 'folder',
          modifiedAt: minutesAgo(now, 2),
          children: [
            { name: 'invoice-2026-118.pdf', kind: 'file', bytes: 84_213, modifiedAt: minutesAgo(now, 2) },
            { name: 'invoice-2026-117.pdf', kind: 'file', bytes: 79_870, modifiedAt: minutesAgo(now, 4_320) },
          ],
        },
        {
          name: 'projects.json',
          kind: 'file',
          modifiedAt: minutesAgo(now, 1),
          ...withPreview(
            json({
              cachedAt: '2026-10-10T14:01:52Z',
              items: [
                { id: 42, name: 'Atlas mobile app' },
                { id: 37, name: 'Customer portal' },
              ],
            }),
          ),
        },
        { name: 'drafts.txt', kind: 'file', modifiedAt: minutesAgo(now, 95), ...withPreview(text('Kick-off notes Atlas\n- Beta on 24 Oct\n- Check invoice 118 with finance')) },
      ],
    },
    {
      name: 'Library',
      kind: 'folder',
      modifiedAt: minutesAgo(now, 12),
      children: [
        {
          name: 'Caches',
          kind: 'folder',
          modifiedAt: minutesAgo(now, 12),
          children: [
            {
              name: 'avatars',
              kind: 'folder',
              modifiedAt: minutesAgo(now, 12),
              children: [{ name: 'lena.png', kind: 'file', modifiedAt: minutesAgo(now, 12), ...withPreview(image(18_840)) }],
            },
          ],
        },
      ],
    },
    { name: 'tmp', kind: 'folder', modifiedAt: minutesAgo(now, 30), children: [] },
  ],
});

function withPreview(preview: FileNode['preview'] & {}) {
  return { preview, bytes: preview.bytes };
}
