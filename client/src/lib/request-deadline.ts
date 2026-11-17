export class RequestTimeoutError extends Error {
  constructor() {
    super("Request deadline exceeded");
    this.name = "RequestTimeoutError";
  }
}

// Keep the deadline active through body consumption, not just response headers.
export async function fetchWithDeadline<T>(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  read: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      fetch(url, { ...init, signal: controller.signal }).then(read),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => {
          reject(new RequestTimeoutError());
          controller.abort();
        }, timeoutMs);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}
