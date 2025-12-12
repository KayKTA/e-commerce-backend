import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./swagger";

import { authRouter } from "./routes/auth.routes";
import { productsRouter } from "./routes/products.routes";
import { cartRouter } from "./routes/cart.routes";
import { wishlistRouter } from "./routes/wishlist.route";

export function createApp() {
    const app = express();

    app.use(cors());
    app.use(express.json());

    // Health check endpoint
    app.get("/health", (_req, res) => res.json({ status: "ok" }));

    // Swagger documentation endpoint
    app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

    // API routes
    app.use("/auth", authRouter);
    app.use("/products", productsRouter);
    app.use("/cart", cartRouter);
    app.use("/wishlist", wishlistRouter);

    // 404 handler
    app.use((_req, res) => res.status(404).json({ error: "Not found" }));

    // Global error handler
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });

    return app;
}
