import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { storage } from "./db_storage.js";

// Session Secret for signing stateless tokens.
// No hardcoded default and never reuses the Supabase service role key.
const MIN_SESSION_SECRET_LENGTH = 32;

export function isProductionEnv(): boolean {
  return process.env.NODE_ENV === "production" || !!process.env.VERCEL_ENV;
}

function resolveSessionSecret(): string {
  const secret = process.env.SESSION_SECRET?.trim();

  if (isProductionEnv()) {
    if (!secret || secret.length < MIN_SESSION_SECRET_LENGTH) {
      // Fail closed: refuse to start rather than sign tokens with a weak/missing key.
      throw new Error(
        `[security] SESSION_SECRET is ${secret ? "too short" : "missing"}. ` +
        `It must be at least ${MIN_SESSION_SECRET_LENGTH} characters in production ` +
        `(generate one with: openssl rand -hex 32).`
      );
    }
    return secret;
  }

  // Local development only.
  if (!secret) {
    console.warn(
      "[security] SESSION_SECRET is not set. Using a random per-process secret for local dev; " +
      "admin sessions will be invalidated on every restart."
    );
    return crypto.randomBytes(32).toString("hex");
  }
  if (secret.length < MIN_SESSION_SECRET_LENGTH) {
    console.warn(
      `[security] SESSION_SECRET is shorter than ${MIN_SESSION_SECRET_LENGTH} characters. ` +
      "This is allowed in local dev but will fail in production."
    );
  }
  return secret;
}

const SESSION_SECRET = resolveSessionSecret();

// Username that the env-var (ADMIN_PASSWORD_HASH) login path is bound to.
const ENV_ADMIN_USERNAME = "admin";
let warnedMissingAdminHash = false;

// Admin password policy (applies to new admin users and password changes).
// Max is 72 because bcrypt silently ignores bytes beyond 72.
export const MIN_ADMIN_PASSWORD_LENGTH = 12;
export const MAX_ADMIN_PASSWORD_LENGTH = 72;

/** Returns an error message if the password violates policy, otherwise null. */
export function validateNewAdminPassword(password: unknown): string | null {
  if (typeof password !== "string" || password.length === 0) return "Password is required";
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_ADMIN_PASSWORD_LENGTH} characters`;
  }
  if (Buffer.byteLength(password, "utf8") > MAX_ADMIN_PASSWORD_LENGTH) {
    return `Password must be at most ${MAX_ADMIN_PASSWORD_LENGTH} bytes`;
  }
  return null;
}

/**
 * Returns the bcrypt hash from ADMIN_PASSWORD_HASH, or null if it is unset.
 * There is intentionally NO default: if the env var is missing, the env-var
 * login path fails closed.
 */
function getAdminPasswordHash(): string | null {
  const hash = process.env.ADMIN_PASSWORD_HASH?.trim();
  if (!hash) {
    if (!warnedMissingAdminHash) {
      console.warn(
        "[security] ADMIN_PASSWORD_HASH is not set. Env-var admin login is DISABLED. " +
        "Only database admin users can log in."
      );
      warnedMissingAdminHash = true;
    }
    return null;
  }
  return hash;
}

export const securityMiddleware = {
  helmet: helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      reportOnly: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://maps.googleapis.com", "https://maps.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: [
            "'self'", 
            "data:", 
            "blob:", 
            "https://*.tile.openstreetmap.org", 
            "https://flagcdn.com", 
            "https://images.unsplash.com",
            process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "https://*.supabase.co"
        ],
        connectSrc: [
          "'self'",
          "https://nominatim.openstreetmap.org",
          "https://*.tile.openstreetmap.org",
          "https://photon.komoot.io",
          "https://maps.googleapis.com",
          "https://maps.gstatic.com",
          process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin : "https://*.supabase.co"
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
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please wait 15 minutes before trying again." },
  }),

  adminRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many failed attempts. Please try again later." },
  }),

  deletionRequestRateLimit: rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many deletion requests. Please try again later." },
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
    .trim()
    .substring(0, 2500);
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
];

export function detectSpam(text: string): boolean {
  return SPAM_PATTERNS.some(pattern => pattern.test(text));
}

export function checkDuplicateSubmission(
  newStore: { name: string; address: string; latitude: string; longitude: string },
  existingStores: Array<{ name: string; address: string; latitude: string; longitude: string }>
): boolean {
  // Use Unicode property escapes (\p{L} for letters, \p{N} for numbers)
  // so Cyrillic and other non-ASCII characters aren't stripped out.
  const normalize = (s: string) => s.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
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

  // Fallback to environment variable for backward compatibility.
  // Only usable with the exact username "admin"; any other (or missing)
  // username can never authenticate via this path.
  if (username?.trim().toLowerCase() === ENV_ADMIN_USERNAME) {
    const hash = getAdminPasswordHash();
    if (hash) {
      try {
        const isValid = await bcrypt.compare(password, hash);
        if (isValid) {
          return { valid: true, username: ENV_ADMIN_USERNAME };
        }
      } catch (error) {
        console.error("[security] ADMIN_PASSWORD_HASH comparison failed (malformed hash?)");
      }
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
