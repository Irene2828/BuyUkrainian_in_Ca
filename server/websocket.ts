import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

let wss: WebSocketServer;

export function setupWebSocket(server: Server) {
    wss = new WebSocketServer({ server, path: "/ws" });

    wss.on("connection", (ws) => {
        console.log("New WebSocket connection");

        ws.on("error", console.error);

        ws.on("close", () => {
            console.log("WebSocket connection closed");
        });
    });

    return wss;
}

export function broadcast(type: string, payload?: any) {
    if (!wss) {
        console.warn("WebSocket server not initialized, skipping broadcast");
        return;
    }

    const message = JSON.stringify({ type, payload });
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}
