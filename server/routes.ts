import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStoreSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Get all approved stores (public map)
  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getApprovedStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Get all stores (admin only - for simplicity, no auth in this demo)
  app.get("/api/admin/stores", async (req, res) => {
    try {
      const stores = await storage.getAllStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching all stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Create new store submission
  app.post("/api/stores", async (req, res) => {
    try {
      const validation = insertStoreSchema.safeParse(req.body);
      
      if (!validation.success) {
        const readableError = fromZodError(validation.error);
        return res.status(400).json({ error: readableError.message });
      }

      const newStore = await storage.createStore(validation.data);
      res.status(201).json(newStore);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ error: "Failed to create store" });
    }
  });

  // Update store status (approve/reject)
  app.patch("/api/admin/stores/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const updatedStore = await storage.updateStoreStatus(id, status);
      
      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store status:", error);
      res.status(500).json({ error: "Failed to update store status" });
    }
  });

  return httpServer;
}
