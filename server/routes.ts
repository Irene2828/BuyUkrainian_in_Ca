import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStoreSchema } from "@shared/schema";
import { fromZodError } from "zod-validation-error";
import { z } from "zod";
import {
  securityMiddleware,
  detectSpam,
  checkDuplicateSubmission,
  verifyAdminPassword,
  createAdminSession,
  destroyAdminSession,
  requireAdmin,
  hashPassword
} from "./security";
import { broadcast } from "./websocket";

const loginSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

const imageSchema = z.object({
  images: z.array(z.string().url("Invalid image URL").max(500, "URL too long")).max(5, "Maximum 5 images allowed"),
});

const createAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
});

const changePasswordSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters").max(100, "Password too long"),
});

const updateStoreSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  address: z.string().min(1, "Address is required").max(500, "Address too long").optional(),
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.get("/api/stores", async (req, res) => {
    try {
      const stores = await storage.getApprovedStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.post("/api/admin/login", securityMiddleware.adminRateLimit, async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid request" });
      }

      const result = await verifyAdminPassword(validation.data.password, validation.data.username);
      if (!result.valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = createAdminSession();
      res.json({ success: true, sessionId, username: result.username });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", (req, res) => {
    const sessionId = req.headers["x-admin-session"] as string | undefined;
    if (sessionId) {
      destroyAdminSession(sessionId);
    }
    res.json({ success: true });
  });

  app.get("/api/admin/verify", requireAdmin, (req, res) => {
    res.json({ authenticated: true });
  });

  app.get("/api/admin/stores", requireAdmin, async (req, res) => {
    try {
      const stores = await storage.getAllStores();
      console.log(`[Admin] Fetching all stores. Count: ${stores.length}`);
      res.json(stores);
    } catch (error) {
      console.error("Error fetching all stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  app.post("/api/stores", securityMiddleware.submissionRateLimit, async (req, res) => {
    try {
      // Website check moved to zod schema validation if needed, 
      // but let's allow it as per requirements.
      // Removed restrictive return.

      const validation = insertStoreSchema.safeParse(req.body);

      if (!validation.success) {
        const readableError = fromZodError(validation.error);
        return res.status(400).json({ error: readableError.message });
      }

      const storeData = validation.data;

      const combinedText = `${storeData.name} ${storeData.description} ${storeData.products.join(" ")}`;
      if (detectSpam(combinedText)) {
        return res.status(400).json({
          error: "Your submission was flagged as potential spam. Please revise and try again."
        });
      }

      // Only check for duplicates against APPROVED stores, not pending ones
      // This allows users to submit new stores even if similar ones are pending review
      const approvedStores = await storage.getApprovedStores();
      const isDuplicate = checkDuplicateSubmission(
        {
          name: storeData.name,
          address: storeData.address,
          latitude: storeData.latitude,
          longitude: storeData.longitude,
        },
        approvedStores.map(s => ({
          name: s.name,
          address: s.address,
          latitude: String(s.latitude),
          longitude: String(s.longitude),
        }))
      );

      if (isDuplicate) {
        return res.status(400).json({
          error: "A store with this name or location is already live on our map."
        });
      }

      console.log(`[Store Submission] Name: ${storeData.name}, City: ${storeData.city}, Prov: ${storeData.province}, Lat: ${storeData.latitude}, Lng: ${storeData.longitude}`);
      const newStore = await storage.createStore(storeData);
      console.log(`[Store Created] ID: ${newStore.id}, Name: ${newStore.name}, Status: ${newStore.status}`);
      broadcast("store_submitted");
      res.status(201).json(newStore);
    } catch (error) {
      console.error("Error creating store:", error);
      res.status(500).json({ error: "Failed to create store" });
    }
  });

  app.patch("/api/admin/stores/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const validation = statusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const newStatus = validation.data.status.toLowerCase() as "pending" | "approved" | "rejected";
      console.log(`[Status Update] ID: ${id}, New Status: ${newStatus}`);
      const updatedStore = await storage.updateStoreStatus(id, newStatus);

      if (!updatedStore) {
        console.warn(`[Status Update] Store with ID ${id} not found`);
        return res.status(404).json({ error: "Store not found" });
      }

      console.log(`[Status Update] Successfully updated ID: ${id} to ${updatedStore.status}`);
      broadcast("store_updated");
      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store status:", error);
      res.status(500).json({ error: "Failed to update store status" });
    }
  });

  app.delete("/api/admin/stores/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const deleted = await storage.deleteStore(id);

      if (!deleted) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json({ success: true, message: "Store deleted successfully" });
      broadcast("store_updated");
    } catch (error) {
      console.error("Error deleting store:", error);
      res.status(500).json({ error: "Failed to delete store" });
    }
  });

  app.delete("/api/stores/:id/request-deletion", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { email } = req.body;

      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const store = await storage.getStore(id);
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }

      if (!store.email || store.email !== email) {
        return res.status(403).json({
          error: "Email does not match the one used during submission. Please contact support."
        });
      }

      const deleted = await storage.deleteStore(id);
      if (!deleted) {
        return res.status(500).json({ error: "Failed to delete store" });
      }

      res.json({ success: true, message: "Your store listing has been deleted." });
    } catch (error) {
      console.error("Error processing deletion request:", error);
      res.status(500).json({ error: "Failed to process deletion request" });
    }
  });

  // Update store images
  app.patch("/api/admin/stores/:id/images", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const validation = imageSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid image URLs" });
      }

      const updatedStore = await storage.updateStoreImages(id, validation.data.images);

      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json(updatedStore);
      broadcast("store_updated");
    } catch (error) {
      console.error("Error updating store images:", error);
      res.status(500).json({ error: "Failed to update store images" });
    }
  });

  // Update store details (name, address)
  app.patch("/api/admin/stores/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid store ID" });
      }

      const validation = updateStoreSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid update data" });
      }

      const updatedStore = await storage.updateStore(id, validation.data);

      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      res.json(updatedStore);
      broadcast("store_updated");
    } catch (error) {
      console.error("Error updating store:", error);
      res.status(500).json({ error: "Failed to update store" });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const admins = await storage.getAllAdminUsers();
      // Don't expose password hashes
      const safeAdmins = admins.map(({ passwordHash, ...rest }) => rest);
      res.json(safeAdmins);
    } catch (error) {
      console.error("Error fetching admin users:", error);
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const validation = createAdminSchema.safeParse(req.body);
      if (!validation.success) {
        const readableError = fromZodError(validation.error);
        return res.status(400).json({ error: readableError.message });
      }

      // Check if username already exists
      const existing = await storage.getAdminUserByUsername(validation.data.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const passwordHash = await hashPassword(validation.data.password);
      const newAdmin = await storage.createAdminUser({
        username: validation.data.username,
        passwordHash,
      });

      // Don't expose password hash
      const { passwordHash: _, ...safeAdmin } = newAdmin;
      res.status(201).json(safeAdmin);
    } catch (error) {
      console.error("Error creating admin user:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });

  app.patch("/api/admin/users/:id/password", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      const validation = changePasswordSchema.safeParse(req.body);
      if (!validation.success) {
        const readableError = fromZodError(validation.error);
        return res.status(400).json({ error: readableError.message });
      }

      const passwordHash = await hashPassword(validation.data.newPassword);
      const updated = await storage.updateAdminPassword(id, passwordHash);

      if (!updated) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      res.json({ success: true, message: "Password updated successfully" });
    } catch (error) {
      console.error("Error updating password:", error);
      res.status(500).json({ error: "Failed to update password" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({ error: "Invalid user ID" });
      }

      // Prevent deleting the last admin
      const admins = await storage.getAllAdminUsers();
      if (admins.length <= 1) {
        return res.status(400).json({ error: "Cannot delete the last admin user" });
      }

      const deleted = await storage.deleteAdminUser(id);
      if (!deleted) {
        return res.status(404).json({ error: "Admin user not found" });
      }

      res.json({ success: true, message: "Admin user deleted successfully" });
    } catch (error) {
      console.error("Error deleting admin user:", error);
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  });

  return httpServer;
}
