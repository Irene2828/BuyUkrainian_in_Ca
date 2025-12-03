import rateLimit from "express-rate-limit";
import helmet from "helmet";
import type { Express, Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";

function getAdminPasswordHash(): string {
  const hash = process.env.ADMIN_PASSWORD_HASH;
  if (!hash) {
    console.warn("WARNING: ADMIN_PASSWORD_HASH not set. Admin login is disabled.");
    return "";
  }
  return hash;
}

export const securityMiddleware = {
  helmet: helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "blob:", "https:", "http:"],
        connectSrc: ["'self'", "https://nominatim.openstreetmap.org", "https://*.tile.openstreetmap.org"],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
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
    max: 3,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many submissions. Please wait a minute before trying again." },
  }),

  adminRateLimit: rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
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

let adminSessions: Map<string, { expires: number }> = new Map();

function generateSessionId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const hash = getAdminPasswordHash();
  if (!hash) return false;
  return bcrypt.compare(password, hash);
}

export function createAdminSession(): string {
  const sessionId = generateSessionId();
  const expires = Date.now() + 24 * 60 * 60 * 1000;
  adminSessions.set(sessionId, { expires });
  
  setInterval(() => {
    const now = Date.now();
    Array.from(adminSessions.entries()).forEach(([id, session]) => {
      if (session.expires < now) {
        adminSessions.delete(id);
      }
    });
  }, 60 * 60 * 1000);
  
  return sessionId;
}

export function validateAdminSession(sessionId: string | undefined): boolean {
  if (!sessionId) return false;
  const session = adminSessions.get(sessionId);
  if (!session) return false;
  if (session.expires < Date.now()) {
    adminSessions.delete(sessionId);
    return false;
  }
  return true;
}

export function destroyAdminSession(sessionId: string): void {
  adminSessions.delete(sessionId);
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.headers["x-admin-session"] as string | undefined;
  
  if (!validateAdminSession(sessionId)) {
    res.status(401).json({ error: "Unauthorized. Please log in." });
    return;
  }
  
  next();
}
