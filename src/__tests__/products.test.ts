import request from "supertest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import jwt from "jsonwebtoken";
import { createApp } from "../app";

async function writeJson(file: string, data: unknown) {
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

function makeToken(payload: { sub: string; email: string }) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

describe("Products", () => {
    let tmpDir: string;
    let app: ReturnType<typeof createApp>;
    let adminToken: string;
    let userToken: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = "test_secret";
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "alten-products-"));
        process.env.DATA_DIR = tmpDir;

        await writeJson(path.join(tmpDir, "users.json"), []);
        await writeJson(path.join(tmpDir, "carts.json"), []);
        await writeJson(path.join(tmpDir, "wishlists.json"), []);
        await writeJson(path.join(tmpDir, "products.json"), []);

        adminToken = makeToken({ sub: "admin-1", email: "admin@admin.com" });
        userToken = makeToken({ sub: "user-1", email: "user@test.com" });

        app = createApp();
    });

    test("Admin can create a product", async () => {
        const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${adminToken}`)
            .send({
                code: "P001",
                name: "Product 1",
                description: "desc",
                image: "img",
                category: "cat",
                price: 10,
                quantity: 5,
                internalReference: "IR-1",
                shellId: 1,
                inventoryStatus: "INSTOCK",
                rating: 4,
            });

        expect(res.status).toBe(201);
        expect(res.body.name).toBe("Product 1");
    });

    test("User cannot create a product", async () => {
        const res = await request(app)
            .post("/products")
            .set("Authorization", `Bearer ${userToken}`)
            .send({
                name: "Forbidden",
                price: 10,
                category: "cat",
                quantity: 1,
            });

        expect(res.status).toBe(403);
    });

    test("User can list products", async () => {
        const res = await request(app)
            .get("/products")
            .set("Authorization", `Bearer ${userToken}`);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
    });
});
