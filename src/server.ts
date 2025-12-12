/// <reference path="./types/express.d.ts" />

import "dotenv/config";
import { createApp } from "./app";

const app = createApp();

const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? "0.0.0.0";

app.listen(port, host, () => {
    console.log(`[api] listening on ${host}:${port} (env=${process.env.NODE_ENV ?? "dev"})`);
});
