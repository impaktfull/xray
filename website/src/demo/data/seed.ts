/** Small deterministic PRNG, so the build-time first frame and the browser render the same data. */
export type Rng = () => number;

export function createRng(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const between = (rng: Rng, min: number, max: number) => Math.round(min + rng() * (max - min));

export const pick = <T>(rng: Rng, items: readonly T[]): T => items[Math.floor(rng() * items.length)];
