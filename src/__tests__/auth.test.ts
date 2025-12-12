import request from "supertest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { createApp } from "../app";

/**
 * Helper to write JSON data to a file
 */
async function writeJson(file: string, data: unknown) {
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

describe("Auth", () => {
    let tmpDir: string;
    let app: ReturnType<typeof createApp>;

    beforeAll(async () => {
        process.env.JWT_SECRET = "test_secret";
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "alten-auth-"));
        process.env.DATA_DIR = tmpDir;

        await writeJson(path.join(tmpDir, "users.json"), []);
        await writeJson(path.join(tmpDir, "products.json"), []);
        await writeJson(path.join(tmpDir, "carts.json"), []);
        await writeJson(path.join(tmpDir, "wishlists.json"), []);

        app = createApp();
    });

    test("POST /account creates a user", async () => {
        const res = await request(app)
            .post("/account")
            .send({
                username: "kay",
                firstname: "Kay",
                email: "kay@test.com",
                password: "password123",
            });

        expect(res.status).toBe(201);
    });

    test("POST /token returns a JWT", async () => {
        const res = await request(app)
            .post("/token")
            .send({
                email: "kay@test.com",
                password: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
        expect(typeof res.body.token).toBe("string");
    });

    test("POST /token fails with wrong password", async () => {
        const res = await request(app)
            .post("/token")
            .send({
                email: "kay@test.com",
                password: "wrong",
            });

        expect(res.status).toBe(401);
    });
});
