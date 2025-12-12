import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

/**
 * Middleware to require authentication via JWT
 * Attaches user payload to req.user
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
    const header = req.headers.authorization;

    if (!header?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Missing or invalid Authorization header" });
    }

    const token = header.slice("Bearer ".length).trim();
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        console.error("JWT_SECRET is not set");
        return res.status(500).json({ error: "Server misconfigured" });
    }

    try {
        const payload = jwt.verify(token, secret);

        // Basic validation of payload structure
        if (typeof payload !== "object" || payload === null) {
            return res.status(401).json({ error: "Invalid token payload" });
        }

        // Minimal fields expected
        const email = (payload as any).email;
        const sub = (payload as any).sub;

        if (typeof email !== "string" || typeof sub !== "string") {
            return res.status(401).json({ error: "Invalid token payload" });
        }

        req.user = {
            sub,
            email,
            username: typeof (payload as any).username === "string" ? (payload as any).username : undefined,
        };

        return next();
    } catch {
        return res.status(401).json({ error: "Invalid or expired token" });
    }
}
