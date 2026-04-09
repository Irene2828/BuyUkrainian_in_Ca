// WebSocket support - Neutralized for Vercel/Serverless
// Vercel Serverless Functions are stateless and cannot maintain WebSocket connections.

export function setupWebSocket(server: any) {
    // No-op in serverless environment
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    if ((global as any).wss || (global as any).__wssInitializing) {
        return (global as any).wss ?? null;
    }

    (global as any).__wssInitializing = true;

    // Use dynamic import for local dev to avoid importing 'ws' in production
    import('ws').then(({ WebSocketServer }) => {
        const wss = new WebSocketServer({ server, path: "/ws" });
        wss.on("connection", (ws) => {
            console.log("New WebSocket connection");
            ws.on("error", console.error);
        });
        (global as any).wss = wss; // Store globally for broadcast to find it
        (global as any).__wssInitializing = false;
    }).catch(e => {
        (global as any).__wssInitializing = false;
        console.warn("WebSocket init failed:", e);
    });

    return null;
}

export function broadcast(type: string, payload?: any) {
    const wss = (global as any).wss;
    if (!wss) return;

    try {
        const message = JSON.stringify({ type, payload });
        wss.clients.forEach((client: any) => {
            if (client.readyState === 1) { // WebSocket.OPEN
                client.send(message);
            }
        });
    } catch (e) {
        console.warn("Broadcast failed:", e);
    }
}
