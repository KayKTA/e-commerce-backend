import type { Request, Response, NextFunction } from "express";

/**
 * Middleware to require admin user
 * Here, we consider a user as admin if their email is "admin@admin.com"
 */
const ADMIN_EMAIL = "admin@admin.com";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    if (req.user.email !== ADMIN_EMAIL) {
        return res.status(403).json({ error: "Forbidden" });
    }

    return next();
}
