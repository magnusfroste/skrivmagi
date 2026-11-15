// A timed-out request must never deliver a late result to the writing view.
export async function withAITimeout<T>(
  request: (signal: AbortSignal) => Promise<T>,
  timeoutMs = 120_000,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      controller.abort();
      reject(new Error('AI request timed out'));
    }, timeoutMs);
  });
  try {
    return await Promise.race([request(controller.signal), timeout]);
  } finally {
    clearTimeout(timer);
  }
}