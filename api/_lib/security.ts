import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./db_storage.js";

// Session Secret for signing stateless tokens
const SESSION_SECRET = process.env.SESSION_SECRET || process.env.Supabase_SERVICE_ROLE_KEY || "default-insecure-secret-please-set-env-var";

function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    return "$2b$10$oQh5MVXm5KgvMCdJXp2/b.5rbX0mAZq9885g4dIQqdnCdyfutv4B6"; // Hash for "admin"
  }
  return hash;
}

export const securityMiddleware = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: [
          "'self'",
          "https://nominatim.openstreetmap.org",
          "https://*.tile.openstreetmap.org",
          "https://photon.komoot.io",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
        ],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [], // Disable for mixed content flexibility if needed, though 'self' implies https on vercel
      },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),

  generalRateLimit: rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests, please try again later." },
    skip: (req) => !req.path.startsWith("/api"),
  }),

  submissionRateLimit: rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please wait a minute before trying again." },
  }),

  adminRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30, // Increased slightly for admin usability
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please try again later." },
  }),
};

export function sanitizeString(input: string): string {
  if (typeof input !== "string") return "";

  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<[^>]*>/g, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "")
    .replace(/data:/gi, "")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .trim();
}

export function sanitizeArray(arr: string[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(sanitizeString).filter(s => s.length > 0);
}

const SPAM_PATTERNS = [
  /\b(buy now|click here|free money|make money fast|winner|congratulations you won)\b/i,
  /\b(viagra|casino|lottery|bitcoin investment|crypto trading)\b/i,
  /(https?:\/\/[^\s]+){3,}/i,
  /(.)\1{10,}/,
  /^[A-Z\s]+$/,
];

export function detectSpam(text: string): boolean {
  return SPAM_PATTERNS.some(pattern => pattern.test(text));
}

export function checkDuplicateSubmission(
  newStore: { name: string; address: string; latitude: string; longitude: string },
  existingStores: Array<{ name: string; address: string; latitude: string; longitude: string }>
): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const newNameNorm = normalize(newStore.name);
  const newAddressNorm = normalize(newStore.address);

  return existingStores.some(store => {
    const nameNorm = normalize(store.name);
    const addressNorm = normalize(store.address);

    if (nameNorm === newNameNorm && addressNorm === newAddressNorm) {
      return true;
    }

    const latDiff = Math.abs(parseFloat(newStore.latitude) - parseFloat(store.latitude));
    const lngDiff = Math.abs(parseFloat(newStore.longitude) - parseFloat(store.longitude));
    if (latDiff < 0.0001 && lngDiff < 0.0001) {
      return true;
    }

    return false;
  });
}

// ------------------------------------------------------------------
// Stateless Authentication (HMAC Token) for Vercel/Serverless Support
// ------------------------------------------------------------------

function signToken(payload: string): string {
  return crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('hex');
}

export async function verifyAdminPassword(password: string, username?: string): Promise<{ valid: boolean; adminId?: number; username?: string }> {
  // If username is provided, check database first
  if (username) {
    try {
      const adminUser = await storage.getAdminUserByUsername(username);
      if (adminUser) {
        const isValid = await bcrypt.compare(password, adminUser.passwordHash);
        if (isValid) {
          return { valid: true, adminId: adminUser.id, username: adminUser.username };
        }
      }
    } catch (error) {
      console.error("Database admin check error:", error);
    }
  }

  // Fallback to environment variable for backward compatibility
  const hash = getAdminPasswordHash();
  if (hash) {
    const isValid = await bcrypt.compare(password, hash);
    if (isValid) {
      return { valid: true, username: "admin" };
    }
  }

  return { valid: false };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function createAdminSession(): string {
  // Create payload
  const sessionData = JSON.stringify({
    id: crypto.randomBytes(16).toString("hex"),
    expires: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
  });

  // Encode
  const base64Payload = Buffer.from(sessionData).toString('base64');

  // Sign
  const signature = signToken(base64Payload);

  // Return Combined Token
  return `${base64Payload}.${signature}`;
}

export function validateAdminSession(token: string | undefined): boolean {
  if (!token) return false;

  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [payloadBase64, signature] = parts;

  // Verify Signature
  const expectedSignature = signToken(payloadBase64);

  // Constant time comparison to prevent timing attacks
  const sigBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (sigBuffer.length !== expectedBuffer.length || !crypto.timingSafeEqual(sigBuffer, expectedBuffer)) {
    return false;
  }

  // Check Expiry
  try {
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
    if (payload.expires < Date.now()) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export function destroyAdminSession(sessionId: string): void {
  // Stateless tokens cannot be destroyed server-side without a DB/Redis blacklist.
  // For this implementation, we rely on client-side removal.
  // Ideally, valid tokens expire after 24h.
  return;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.headers["x-admin-session"] as string | undefined;

  if (!validateAdminSession(sessionId)) {
    res.status(401).json({ error: "Unauthorized. Please log in." });
    return;
  }

  next();
}
