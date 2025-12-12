import express from "express";
import cors from "cors";

export function createApp() {
    const app = express();

    // Middlewares
    app.use(cors());
    app.use(express.json());

    // Healthcheck
    app.get("/health", (_req, res) => {
        res.status(200).json({ status: "ok" });
    });

    // TODO: future routes
    // app.use("/products", productsRouter);
    // app.use("/cart", cartRouter);
    // app.use("/wishlist", wishlistRouter);

    // 404
    app.use((_req, res) => {
        res.status(404).json({ error: "Not found" });
    });

    // Error handling
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    });

    return app;
}
