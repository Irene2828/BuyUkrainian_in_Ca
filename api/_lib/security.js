import rateLimit from "express-rate-limit";
import helmet from "helmet";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage.js";
function getAdminPasswordHash() {
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
        max: 100,
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
export function sanitizeString(input) {
    if (typeof input !== "string")
        return "";
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
        .replace(/<[^>]*>/g, "")
        .replace(/javascript:/gi, "")
        .replace(/on\w+\s*=/gi, "")
        .replace(/data:/gi, "")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
        .trim();
}
export function sanitizeArray(arr) {
    if (!Array.isArray(arr))
        return [];
    return arr.map(sanitizeString).filter(s => s.length > 0);
}
const SPAM_PATTERNS = [
    /\b(buy now|click here|free money|make money fast|winner|congratulations you won)\b/i,
    /\b(viagra|casino|lottery|bitcoin investment|crypto trading)\b/i,
    /(https?:\/\/[^\s]+){3,}/i,
    /(.)\1{10,}/,
    /^[A-Z\s]+$/,
];
export function detectSpam(text) {
    return SPAM_PATTERNS.some(pattern => pattern.test(text));
}
export function checkDuplicateSubmission(newStore, existingStores) {
    const normalize = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
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
const adminSessions = new Map();
function generateSessionId() {
    return crypto.randomBytes(32).toString("hex");
}
setInterval(() => {
    const now = Date.now();
    Array.from(adminSessions.entries()).forEach(([id, session]) => {
        if (session.expires < now) {
            adminSessions.delete(id);
        }
    });
}, 60 * 60 * 1000);
export async function verifyAdminPassword(password, username) {
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
        }
        catch (error) {
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
export async function hashPassword(password) {
    return bcrypt.hash(password, 10);
}
export function createAdminSession() {
    const sessionId = generateSessionId();
    const expires = Date.now() + 24 * 60 * 60 * 1000;
    adminSessions.set(sessionId, { expires });
    return sessionId;
}
export function validateAdminSession(sessionId) {
    if (!sessionId)
        return false;
    const session = adminSessions.get(sessionId);
    if (!session)
        return false;
    if (session.expires < Date.now()) {
        adminSessions.delete(sessionId);
        return false;
    }
    return true;
}
export function destroyAdminSession(sessionId) {
    adminSessions.delete(sessionId);
}
export function requireAdmin(req, res, next) {
    const sessionId = req.headers["x-admin-session"];
    if (!validateAdminSession(sessionId)) {
        res.status(401).json({ error: "Unauthorized. Please log in." });
        return;
    }
    next();
}
