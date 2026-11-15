import { describe, expect, test } from 'bun:test';
import { withAITimeout } from './ai-request';

describe('AI request lifecycle', () => {
  test('returns successful results', async () => {
    expect(await withAITimeout(async () => ({ text: 'En saga' }), 50)).toEqual({ text: 'En saga' });
  });
  test('stops waiting and aborts a stalled request', async () => {
    let signal;
    const result = withAITimeout(s => {
      signal = s;
      return new Promise(() => {});
    }, 5);
    await expect(result).rejects.toThrow('AI request timed out');
    expect(signal?.aborted).toBe(true);
  });
  test('preserves failures so the view can offer a retry', async () => {
    await expect(withAITimeout(async () => { throw new Error('unavailable'); }, 50)).rejects.toThrow('unavailable');
  });
});