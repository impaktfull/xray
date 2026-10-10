import { describe, expect, it } from 'vitest';
import { parseJsonObject, parseValue } from './values';

describe('parseValue', () => {
  it('validates numbers like the app', () => {
    expect(parseValue('int', '42')).toEqual({ value: 42 });
    expect(parseValue('int', '4.2').error).toBe('Enter a whole number');
    expect(parseValue('double', '4.2')).toEqual({ value: 4.2 });
    expect(parseValue('double', 'abc').error).toBe('Enter a number');
  });

  it('drops empty list items', () => {
    expect(parseValue('List<String>', ['a', ' ', 'b'])).toEqual({ value: ['a', 'b'] });
  });
});

describe('parseJsonObject', () => {
  it('only treats JSON objects and lists as structured', () => {
    expect(parseJsonObject('{"a":1}')).toEqual({ a: 1 });
    expect(parseJsonObject('dark')).toBeUndefined();
    expect(parseJsonObject('{broken')).toBeUndefined();
  });
});
