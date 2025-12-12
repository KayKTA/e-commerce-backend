/// <reference path="./types/express.d.ts" />

import "dotenv/config";
import { createApp } from "./app";

const app = createApp();

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`[api] listening on http://localhost:${port}`);
});
