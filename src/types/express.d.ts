import "express";

/**
 * Extend Express Request interface to include user payload
 */
declare global {
    namespace Express {
        interface UserPayload {
            sub: string; // user id
            email: string;
            username?: string;
        }

        interface Request {
            user?: UserPayload;
        }
    }
}

export { };
