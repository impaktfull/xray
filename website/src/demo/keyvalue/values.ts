import type { KvType, KvValue } from '../model/types';

export const types: KvType[] = ['String', 'int', 'double', 'bool', 'List<String>'];

export const typeTone: Record<KvType, string> = {
  String: 'tone-success',
  int: 'tone-warning',
  double: 'tone-warning',
  bool: 'tone-info',
  'List<String>': 'is-list',
};

export function displayValue(value: KvValue): string {
  return Array.isArray(value) ? JSON.stringify(value) : String(value);
}

/** Strings that hold a JSON object or list get the tree editor. */
export function parseJsonObject(value: KvValue): unknown | undefined {
  if (typeof value !== 'string' || !/^\s*[[{]/.test(value)) return undefined;
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

/** Turns what was typed into a value of the given type, or an error message. */
export function parseValue(type: KvType, input: string | boolean | string[]): { value?: KvValue; error?: string } {
  switch (type) {
    case 'bool':
      return { value: Boolean(input) };
    case 'int':
      return /^-?\d+$/.test(String(input).trim()) ? { value: Number(input) } : { error: 'Enter a whole number' };
    case 'double':
      return String(input).trim() !== '' && !Number.isNaN(Number(input)) ? { value: Number(input) } : { error: 'Enter a number' };
    case 'List<String>':
      return { value: (input as string[]).filter((item) => item.trim() !== '') };
    default:
      return { value: String(input) };
  }
}
