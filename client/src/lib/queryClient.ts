import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
    async ({ queryKey }) => {
      const res = await fetch(queryKey.join("/") as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: true,
      staleTime: 0,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

// WebSocket setup for real-time updates
export function setupWebSocketListener() {
  // Vercel Serverless does not support WebSockets. Disable in production to prevent errors.
  if (window.location.hostname !== "localhost" && window.location.hostname !== "127.0.0.1") {
    console.log("WebSockets disabled in production environment");
    return;
  }

  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("Connected to WebSocket for real-time updates");
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type === "store_updated" || data.type === "store_submitted") {
        console.log("Received store update event, refreshing data...");
        // Invalidate all store-related queries
        queryClient.invalidateQueries({ queryKey: ["/api/stores"] }); // Public stores
        queryClient.invalidateQueries({ queryKey: ["/api/admin/stores"] }); // Admin stores
      }
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
    }
  };

  ws.onclose = () => {
    console.log("WebSocket connection closed, attempting to reconnect in 5s...");
    setTimeout(setupWebSocketListener, 5000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
  };
}
