import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./db_storage.js";
import { insertStoreSchema, type StoreEditChanges, type InsertStore } from "../../shared/schema.js";
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
  hashPassword,
  validateNewAdminPassword,
  isProductionEnv,
  sanitizeString,
  sanitizeArray,
  getClientIp
} from "./security.js";
import { broadcast } from "./websocket.js";

const loginSchema = z.object({
  username: z.string().min(1).max(50).optional(),
  password: z.string().min(1, "Password is required").max(100, "Password too long"),
});

const statusSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

const imageSchema = z.object({
  images: z.array(z.string().max(50 * 1024 * 1024, "Image too large")).max(5, "Maximum 5 images allowed"),
});

// Enforces MIN/MAX_ADMIN_PASSWORD_LENGTH from security.ts
const newAdminPasswordField = z.string().superRefine((value, ctx) => {
  const error = validateNewAdminPassword(value);
  if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
});

const createAdminSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(50, "Username too long"),
  password: newAdminPasswordField,
});

const changePasswordSchema = z.object({
  newPassword: newAdminPasswordField,
});

const updateStoreSchema = z.object({
  name: z.string().min(1, "Name is required").max(200, "Name too long").optional(),
  address: z.string().min(1, "Address is required").max(500, "Address too long").optional(),
  website: z.string().max(500, "Website too long").optional().or(z.literal("")),
  category: z.enum(["food", "clothes", "retail", "other"]).optional(),
  products: z.array(z.string().min(1).max(100)).optional(),
  description: z.string().max(2000, "Description too long").optional(),
  city: z.string().min(2, "City is required").max(120, "City too long").optional(),
  province: z.string().min(2, "Province is required").max(120, "Province too long").optional(),
  latitude: z.union([z.string(), z.number()])
    .transform((value) => String(value))
    .refine((value) => !isNaN(parseFloat(value)), "Invalid latitude")
    .refine((value) => {
      const lat = parseFloat(value);
      return lat >= 40 && lat <= 85;
    }, "Location must be within Canada (latitude 40-85)")
    .optional(),
  longitude: z.union([z.string(), z.number()])
    .transform((value) => String(value))
    .refine((value) => !isNaN(parseFloat(value)), "Invalid longitude")
    .refine((value) => {
      const lng = parseFloat(value);
      return lng >= -140 && lng <= -50;
    }, "Location must be within Canada (longitude -140 to -50)")
    .optional(),
});

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Sends the site owner an email about a new pending store submission via Resend.
// Optional by design: without RESEND_API_KEY it logs a warning and skips.
// Never throws — a failed email must not affect the submission response.
async function notifyNewStore(store: {
  name: string;
  address: string;
  city: string;
  province: string;
  category: string;
  products: string[];
  website?: string | null;
  email?: string | null;
}): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("\u26a0\ufe0f [API] RESEND_API_KEY is not set \u2014 skipping new-store notification email.");
      return;
    }
    const to = process.env.NOTIFY_EMAIL || "iryna.herts@gmail.com";
    const subject = `New store pending review: ${store.name} \u2014 ${store.city}, ${store.province}`;
    const text = [
      "A new store was submitted to BuyUkrainian and is waiting for review.",
      "",
      `Name: ${store.name}`,
      `Address: ${store.address}`,
      `City: ${store.city}, ${store.province}`,
      `Category: ${store.category}`,
      `Products: ${store.products.join(", ")}`,
      `Website: ${store.website || "\u2014"}`,
      `Submitted by: ${store.email || "\u2014"}`,
      "",
      "Review it here: https://buyukrainian.ca/admin",
    ].join("\n");
    const html = [
      "<p>A new store was submitted to BuyUkrainian and is waiting for review.</p>",
      `<p>Name: ${escapeHtml(store.name)}<br>`,
      `Address: ${escapeHtml(store.address)}<br>`,
      `City: ${escapeHtml(store.city)}, ${escapeHtml(store.province)}<br>`,
      `Category: ${escapeHtml(store.category)}<br>`,
      `Products: ${escapeHtml(store.products.join(", "))}<br>`,
      `Website: ${escapeHtml(store.website || "\u2014")}<br>`,
      `Submitted by: ${escapeHtml(store.email || "\u2014")}</p>`,
      '<p>Review it here: <a href="https://buyukrainian.ca/admin">buyukrainian.ca/admin</a></p>',
    ].join("\n");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BuyUkrainian <notify@buyukrainian.ca>",
        to: [to],
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error(`\u274c [API] Notification email failed for store: ${store.name} \u2014 Resend responded ${response.status}`);
      return;
    }
    console.log(`\ud83d\udce7 [API] Notification email sent for store: ${store.name}`);
  } catch (err) {
    console.error("\u274c [API] Notification email error:", err);
  }
}

// Generic owner notification via Resend. Same rules as notifyNewStore:
// optional (skips without RESEND_API_KEY) and never throws.
async function sendOwnerEmail(subject: string, text: string, html: string): Promise<void> {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      console.warn("[API] RESEND_API_KEY is not set - skipping notification email.");
      return;
    }
    const to = process.env.NOTIFY_EMAIL || "iryna.herts@gmail.com";
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "BuyUkrainian <notify@buyukrainian.ca>",
        to: [to],
        subject,
        text,
        html,
      }),
    });
    if (!response.ok) {
      console.error(`[API] Notification email failed (${subject}) - Resend responded ${response.status}`);
      return;
    }
    console.log(`[API] Notification email sent: ${subject}`);
  } catch (err) {
    console.error("[API] Notification email error:", err);
  }
}

// Owner notification: a store card was edited in the admin panel.
async function notifyStoreEdited(store: {
  name: string;
  address: string;
  city: string;
  province: string;
  category: string;
  products: string[];
}): Promise<void> {
  const subject = `Store card edited: ${store.name} — ${store.city}, ${store.province}`;
  const text = [
    "A store card was edited in the BuyUkrainian admin panel.",
    "",
    `Name: ${store.name}`,
    `Address: ${store.address}`,
    `City: ${store.city}, ${store.province}`,
    `Category: ${store.category}`,
    `Products: ${store.products.join(", ")}`,
    "",
    "Open admin: https://buyukrainian.ca/admin",
  ].join("\n");
  const html = [
    "<p>A store card was edited in the BuyUkrainian admin panel.</p>",
    `<p>Name: ${escapeHtml(store.name)}<br>`,
    `Address: ${escapeHtml(store.address)}<br>`,
    `City: ${escapeHtml(store.city)}, ${escapeHtml(store.province)}<br>`,
    `Category: ${escapeHtml(store.category)}<br>`,
    `Products: ${escapeHtml(store.products.join(", "))}</p>`,
    '<p>Open admin: <a href="https://buyukrainian.ca/admin">buyukrainian.ca/admin</a></p>',
  ].join("\n");
  await sendOwnerEmail(subject, text, html);
}

// Owner notification: a visitor requested deletion of a store card.
async function notifyDeletionRequested(
  store: { name: string; address: string; city: string; province: string },
  requesterEmail?: string | null
): Promise<void> {
  const subject = `Store deletion requested: ${store.name} — ${store.city}, ${store.province}`;
  const text = [
    "A visitor requested deletion of a store card on BuyUkrainian.",
    "The card is NOT deleted - it is flagged in the admin panel for your review.",
    "",
    `Name: ${store.name}`,
    `Address: ${store.address}`,
    `City: ${store.city}, ${store.province}`,
    `Requested by: ${requesterEmail || "-"}`,
    "",
    "Review it here: https://buyukrainian.ca/admin",
  ].join("\n");
  const html = [
    "<p>A visitor requested deletion of a store card on BuyUkrainian.</p>",
    "<p>The card is NOT deleted - it is flagged in the admin panel for your review.</p>",
    `<p>Name: ${escapeHtml(store.name)}<br>`,
    `Address: ${escapeHtml(store.address)}<br>`,
    `City: ${escapeHtml(store.city)}, ${escapeHtml(store.province)}<br>`,
    `Requested by: ${escapeHtml(requesterEmail || "-")}</p>`,
    '<p>Review it here: <a href="https://buyukrainian.ca/admin">buyukrainian.ca/admin</a></p>',
  ].join("\n");
  await sendOwnerEmail(subject, text, html);
}

interface StoreLike {
  name: string;
  address: string;
  city: string;
  province: string;
  category: string;
  website?: string | null;
  description: string;
  products: string[];
}

function diffStoreChanges(store: StoreLike, changes: StoreEditChanges): Array<{ label: string; from: string; to: string }> {
  const rows: Array<{ label: string; from: string; to: string }> = [];
  const push = (label: string, from: string, to: string) => {
    if (from !== to) rows.push({ label, from, to });
  };
  push("Name", store.name || "", changes.name || "");
  push("Address", store.address || "", changes.address || "");
  push("City", store.city || "", changes.city || "");
  push("Province", store.province || "", changes.province || "");
  push("Category", store.category || "", changes.category || "");
  push("Website", store.website || "", changes.website || "");
  push("Description", store.description || "", changes.description || "");
  push("Products", (store.products || []).join(", "), (changes.products || []).join(", "));
  return rows;
}

async function notifyEditSuggested(store: StoreLike, changes: StoreEditChanges, submitterEmail?: string | null): Promise<void> {
  const subject = `Edit suggested: ${store.name} \u2014 ${store.city}, ${store.province}`;
  const diffs = diffStoreChanges(store, changes);
  const diffText = diffs.length > 0
    ? diffs.map(d => `- ${d.label}: "${d.from}" -> "${d.to}"`).join("\n")
    : "(No field differences detected.)";
  const diffHtml = diffs.length > 0
    ? diffs.map(d => `<li><strong>${escapeHtml(d.label)}:</strong> ${escapeHtml(d.from)} &rarr; ${escapeHtml(d.to)}</li>`).join("")
    : "<li>(No field differences detected.)</li>";
  const text = [
    "A visitor suggested changes to a store card on BuyUkrainian.",
    "",
    `Store: ${store.name} \u2014 ${store.city}, ${store.province}`,
    "",
    "Proposed changes:",
    diffText,
    "",
    "The live card has NOT been changed. Review and apply the suggestion in the admin panel, under Edits.",
    ...(submitterEmail ? [`Submitted by: ${submitterEmail}`] : []),
  ].join("\n");
  const html = [
    "<p>A visitor suggested changes to a store card on BuyUkrainian.</p>",
    `<p><strong>${escapeHtml(store.name)}</strong> \u2014 ${escapeHtml(store.city)}, ${escapeHtml(store.province)}</p>`,
    `<p>Proposed changes:</p>`,
    `<ul>${diffHtml}</ul>`,
    "<p>The live card has NOT been changed. Review and apply the suggestion in the admin panel, under <strong>Edits</strong>.</p>",
    ...(submitterEmail ? [`<p>Submitted by: ${escapeHtml(submitterEmail)}</p>`] : []),
    '<p>Review it here: <a href="https://buyukrainian.ca/admin">buyukrainian.ca/admin</a></p>',
  ].join("\n");
  await sendOwnerEmail(subject, text, html);
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // --- NEW LOCATIONS API (Per Request) ---
  // --- NEW LOCATIONS API (Per Request) ---
  // Mapping /api and /api/index to locations as well to satisfy user request/testing
  // Helper function for location fetching with extra safety
  const getLocationsHelper = async (res: any) => {
    try {


      // Debug check for storage
      if (!storage) {
        console.error("❌ [API] Storage is undefined!");
        return res.status(500).json({
          error: "Storage not initialized",
          debug_env: process.env.NODE_ENV
        });
      }

      // EGRESS OPTIMIZATION: Use lean query — excludes description and email
      // Includes image/images so real store photos display; cached 5 min server + edge
      const stores = await storage.getApprovedStoresLean();

      // HARD SANITIZATION: Force-strip Base64 images to prevent 5MB payloads in case of DB schema mismatch
      // BUG FIX: Filter out stores with coordinates that would pull the map to "nowhere"
      // explicitly allowlist public fields
      const sanitizedStores = stores.filter((s: any) => {
        const lat = parseFloat(s.latitude);
        const lng = parseFloat(s.longitude);
        // Exclude 0,0 or coordinates outside logical Canada bounds (Lat 40-85, Lng -145 to -50)
        return !isNaN(lat) && !isNaN(lng) && lat > 40 && lat < 85 && lng > -145 && lng < -50 && s.status === 'approved';
      }).map((s: any) => {
        return {
          id: s.id,
          name: s.name,
          products: s.products,
          address: s.address,
          city: s.city,
          province: s.province,
          latitude: s.latitude,
          longitude: s.longitude,
          category: s.category,
          createdAt: s.createdAt,
        };
      });

      // EGRESS OPTIMIZATION: Edge caching — 300s fresh, 120s stale-while-revalidate
      // Matches server-side cache TTL of 5 minutes to minimize origin DB hits
      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");
      res.json({ data: sanitizedStores });

    } catch (error: any) {
      console.error("❌ [API] Critical Error:", error);
      res.status(500).json({
        error: "Failed to fetch locations",
        ...(!isProductionEnv() && {
          details: error.message || String(error),
          stack: error.stack,
          env_check: {
            has_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
            has_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY
          }
        })
      });
    }
  };

  app.get("/api/locations", (req, res) => getLocationsHelper(res));
  app.get("/api", (req, res) => getLocationsHelper(res));
  app.get("/api/index", (req, res) => getLocationsHelper(res));

  // EGRESS OPTIMIZATION: Heavy payload fetching specific store's base64 strings only when clicked
  // Client makes this call lazily from <StoreCard />
  app.get("/api/locations/:id/images", async (req, res) => {
    try {
      const { id } = req.params;
      const images = await storage.getStoreImages(id);

      // Also fetch the store to ensure it's approved
      const store = await storage.getStore(id);
      if (!store || store.status !== 'approved') {
        return res.status(404).json({ error: "Store not found or not approved" });
      }

      if (!images) {
        return res.status(404).json({ error: "Store images not found" });
      }

      // Edge caching — 3600s fresh since store images rarely change
      res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=120");
      res.json(images);
    } catch (e: any) {
      console.error(`❌ [API] Error fetching images for store ${req.params.id}:`, e);
      res.status(500).json({ error: "Failed to fetch images" });
    }
  });

  app.post("/api/locations", securityMiddleware.submissionRateLimit, async (req, res) => {
    // Check honeypot
    if (req.body.x_k9m2) {
      console.warn("🍯 Honeypot triggered by", req.ip);
      // Return same success response as a real submission but save nothing
      return res.status(201).json({ id: "honeypot-" + Date.now(), ...req.body, status: "pending" });
    }

    try {
      const validation = insertStoreSchema.safeParse(req.body);
      if (!validation.success) {
        const valErr = fromZodError(validation.error).message;
        console.warn("⚠️ [API] POST /api/locations validation failed:", valErr);
        return res.status(400).json({ error: valErr, fields: validation.error.flatten().fieldErrors });
      }

      // Detect spam
      const combinedText = `${validation.data.name} ${validation.data.description || ""} ${validation.data.address} ${validation.data.products.join(" ")}`;
      if (detectSpam(combinedText)) {
        console.warn("🚫 Spam detected from", req.ip);
        return res.status(400).json({ error: "Your submission was flagged as spam." });
      }

      const storeData = {
        ...validation.data,
        geocodingStatus: (Number(validation.data.latitude) === 56.1304 && Number(validation.data.longitude) === -106.3468)
          ? "unresolved" as const : validation.data.geocodingStatus,
        name: sanitizeString(validation.data.name),
        description: validation.data.description ? sanitizeString(validation.data.description) : "",
        address: sanitizeString(validation.data.address),
        city: sanitizeString(validation.data.city),
        province: sanitizeString(validation.data.province),
        category: validation.data.category, // enum
        website: validation.data.website ? sanitizeString(validation.data.website) : undefined,
        email: validation.data.email ? sanitizeString(validation.data.email) : undefined,
        products: sanitizeArray(validation.data.products),
        status: "pending" as const,
      };

      // Duplicate Check
      let existingStores: Array<{ name: string; address: string; latitude: string; longitude: string }> = [];
      try {
        existingStores = await storage.getAllStores();
      } catch (err) {
        console.warn("⚠️ [API] Failed to fetch all stores for duplicate check, falling back to approved stores:", err);
        try {
          existingStores = await storage.getApprovedStoresLean();
        } catch (fallbackErr) {
          console.warn("⚠️ [API] Fallback getApprovedStoresLean also failed for duplicate check:", fallbackErr);
        }
      }

      if (existingStores.length > 0 && checkDuplicateSubmission(storeData, existingStores)) {
        return res.status(409).json({ error: "This store has already been submitted and is awaiting review." });
      }

      console.log("📝 [API] Attempting to create location:", storeData.name);
      const newStore = await storage.createStore(storeData);
      console.log("✅ [API] Location created successfully with ID:", newStore.id);
      broadcast("store_submitted");
      await notifyNewStore(newStore);
      res.status(201).json(newStore);
    } catch (e: any) {
      console.error("❌ [API] POST /api/locations Error:", e?.message || String(e), e?.stack);
      res.status(500).json({
        error: "Failed to create location",
        ...(!isProductionEnv() && {
          message: e?.message || String(e),
          stack: e?.stack
        })
      });
    }
  });


  // --- EXISTING ROUTES UPDATED FOR STRING ID ---

  app.get("/api/stores", async (req, res) => {
    try {
      // EGRESS OPTIMIZATION: Use lean query + edge caching for public store list
      const stores = await storage.getApprovedStoresLean();
      
      const sanitizedStores = stores.filter(s => s.status === 'approved').map(s => ({
        id: s.id,
        name: s.name,
        products: s.products,
        address: s.address,
        city: s.city,
        province: s.province,
        latitude: s.latitude,
        longitude: s.longitude,
        category: s.category,
        createdAt: s.createdAt,
      }));

      res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=120");
      res.json(sanitizedStores);
    } catch (error) {
      console.error("Error fetching stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // Admin-only endpoint to get ALL stores (including pending)
  app.get("/api/admin/stores", requireAdmin, async (req, res) => {
    try {
      const stores = await storage.getAllStores();
      res.json(stores);
    } catch (error) {
      console.error("Error fetching all stores:", error);
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });

  // --- ADMIN AUTHENTICATION ROUTES ---

  app.post("/api/admin/login", securityMiddleware.adminRateLimit, async (req, res) => {
    try {
      const validation = loginSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: fromZodError(validation.error).message });
      }

      const { password, username } = validation.data;
      const ip = getClientIp(req);
      const actualUsername = username || "admin";

      // Supabase-backed lockout check
      const lockedOut = await storage.checkLoginLockout(ip, actualUsername);
      if (lockedOut) {
        return res.status(429).json({ error: "Too many failed attempts. Please try again later." });
      }

      const verification = await verifyAdminPassword(password, username);

      // Record the attempt
      await storage.recordLoginAttempt(ip, actualUsername, verification.valid);

      if (!verification.valid) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = createAdminSession();
      res.json({ sessionId, success: true });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.get("/api/admin/verify", requireAdmin, async (req, res) => {
    // If requireAdmin middleware passes, session is valid
    res.json({ valid: true });
  });

  app.post("/api/admin/logout", async (req, res) => {
    try {
      const sessionId = req.headers["x-admin-session"] as string | undefined;
      if (sessionId) {
        destroyAdminSession(sessionId);
      }
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Logout failed" });
    }
  });

  // --- ADMIN STORE MANAGEMENT ROUTES ---

  app.patch("/api/admin/stores/:id/status", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id; // String ID

      const validation = statusSchema.safeParse(req.body);
      if (!validation.success) {
        return res.status(400).json({ error: "Invalid status value" });
      }

      const newStatus = validation.data.status.toLowerCase() as "pending" | "approved" | "rejected";
      console.log(`[Status Update] ID: ${id}, New Status: ${newStatus}`);
      const updatedStore = await storage.updateStoreStatus(id, newStatus);

      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }

      broadcast("store_updated");
      res.json(updatedStore);
    } catch (error) {
      console.error("Error updating store status:", error);
      res.status(500).json({ error: "Failed to update store status" });
    }
  });

  app.delete("/api/admin/stores/:id", requireAdmin, async (req, res) => {
    try {
      const id = req.params.id;
      const deleted = await storage.deleteStore(id);
      if (!deleted) return res.status(404).json({ error: "Store not found" });

      res.json({ success: true, message: "Store deleted successfully" });
      broadcast("store_updated");
    } catch (error) {
      res.status(500).json({ error: "Failed to delete store" });
    }
  });

  app.delete("/api/stores/:id/request-deletion", securityMiddleware.deletionRequestRateLimit, async (req, res) => {
    try {
      const id = req.params.id;
      const { email } = req.body;

      const store = await storage.getStore(id);
      
      // Always return 200 OK so we don't leak store existence.
      if (store && store.status === 'approved') {
        // Update store with deletion requested details, don't change status
        await storage.updateStore(id, { 
          deletionRequestedAt: new Date(),
          deletionRequestEmail: email || null
        });
        await notifyDeletionRequested(store, email || null);
      }

      res.json({ message: "Store deletion requested successfully" });
    } catch (error) {
      console.error("Error requesting store deletion:", error);
      res.status(500).json({ error: "Failed to request store deletion" });
    }
  });

  // Public: suggest an edit to an existing (approved) store card. The suggestion
  // is stored separately and only applied after an admin approves it.
  app.post("/api/stores/:id/suggest-edit", securityMiddleware.submissionRateLimit, async (req, res) => {
    // Check honeypot (same field as the add-store form)
    if (req.body.x_k9m2) {
      console.warn("🍯 Honeypot triggered on suggest-edit by", req.ip);
      return res.status(201).json({ ok: true });
    }

    try {
      const store = await storage.getStore(req.params.id);
      if (!store || store.status !== "approved") {
        return res.status(404).json({ error: "Store not found" });
      }

      const validation = insertStoreSchema.safeParse(req.body);
      if (!validation.success) {
        const valErr = fromZodError(validation.error).message;
        console.warn("⚠️ [API] POST suggest-edit validation failed:", valErr);
        return res.status(400).json({ error: valErr, fields: validation.error.flatten().fieldErrors });
      }

      const combinedText = `${validation.data.name} ${validation.data.description || ""} ${validation.data.address} ${validation.data.products.join(" ")}`;
      if (detectSpam(combinedText)) {
        console.warn("🚫 Spam detected in suggest-edit from", req.ip);
        return res.status(400).json({ error: "Your submission was flagged as spam." });
      }

      const changes: StoreEditChanges = {
        name: sanitizeString(validation.data.name),
        description: validation.data.description ? sanitizeString(validation.data.description) : "",
        products: sanitizeArray(validation.data.products),
        address: sanitizeString(validation.data.address),
        city: sanitizeString(validation.data.city),
        province: sanitizeString(validation.data.province),
        latitude: validation.data.latitude,
        longitude: validation.data.longitude,
        category: validation.data.category,
        website: validation.data.website ? sanitizeString(validation.data.website) : null,
        email: validation.data.email ? sanitizeString(validation.data.email) : null,
        geocodingStatus: (Number(validation.data.latitude) === 56.1304 && Number(validation.data.longitude) === -106.3468)
          ? "unresolved" : (validation.data.geocodingStatus ?? null),
      };

      const suggestion = await storage.createEditSuggestion({
        storeId: store.id,
        storeName: store.name,
        changes,
        submitterEmail: changes.email,
      });
      await notifyEditSuggested(store, changes, changes.email);
      res.status(201).json({ ok: true, id: suggestion.id });
    } catch (error) {
      console.error("Error creating edit suggestion:", error);
      res.status(500).json({ error: "Failed to submit the suggested edit" });
    }
  });

  app.patch("/api/admin/stores/:id/images", requireAdmin, async (req, res) => {
    const id = req.params.id;
    const validation = imageSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: "Invalid images" });
    const updated = await storage.updateStoreImages(id, validation.data.images);
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.json(updated);
    broadcast("store_updated");
  });

  app.patch("/api/admin/stores/:id", requireAdmin, async (req, res) => {
    const id = req.params.id;
    const validation = updateStoreSchema.safeParse(req.body);
    if (!validation.success) return res.status(400).json({ error: "Invalid data" });
    const updated = await storage.updateStore(id, validation.data);
    if (!updated) return res.status(404).json({ error: "Not found" });
    await notifyStoreEdited(updated);
    res.json(updated);
    broadcast("store_updated");
  });

  // --- ADMIN EDIT SUGGESTION ROUTES ---

  app.get("/api/admin/edit-suggestions", requireAdmin, async (req, res) => {
    try {
      const suggestions = await storage.getPendingEditSuggestions();
      res.json(suggestions);
    } catch (error) {
      console.error("Error fetching edit suggestions:", error);
      res.status(500).json({ error: "Failed to fetch edit suggestions" });
    }
  });

  app.post("/api/admin/edit-suggestions/:id/approve", requireAdmin, async (req, res) => {
    try {
      const suggestion = await storage.getEditSuggestion(req.params.id);
      if (!suggestion || suggestion.status !== "pending") {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      const c = suggestion.changes;
      const updates: Partial<InsertStore> = {
        name: c.name,
        description: c.description,
        products: c.products,
        address: c.address,
        city: c.city,
        province: c.province,
        latitude: c.latitude,
        longitude: c.longitude,
        category: c.category,
        website: c.website || undefined,
        email: c.email || undefined,
        geocodingStatus: c.geocodingStatus ?? undefined,
      };
      const updated = await storage.updateStore(suggestion.storeId, updates);
      if (!updated) {
        return res.status(404).json({ error: "Store not found" });
      }
      await storage.setEditSuggestionStatus(suggestion.id, "approved");
      res.json(updated);
      broadcast("store_updated");
    } catch (error) {
      console.error("Error approving edit suggestion:", error);
      res.status(500).json({ error: "Failed to approve edit suggestion" });
    }
  });

  app.post("/api/admin/edit-suggestions/:id/reject", requireAdmin, async (req, res) => {
    try {
      const suggestion = await storage.getEditSuggestion(req.params.id);
      if (!suggestion || suggestion.status !== "pending") {
        return res.status(404).json({ error: "Suggestion not found" });
      }
      const updated = await storage.setEditSuggestionStatus(suggestion.id, "rejected");
      res.json(updated);
    } catch (error) {
      console.error("Error rejecting edit suggestion:", error);
      res.status(500).json({ error: "Failed to reject edit suggestion" });
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

  app.post("/api/admin/users", requireAdmin, securityMiddleware.adminRateLimit, async (req, res) => {
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

  app.patch("/api/admin/users/:id/password", requireAdmin, securityMiddleware.adminRateLimit, async (req, res) => {
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
