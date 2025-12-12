import request from "supertest";
import { promises as fs } from "fs";
import os from "os";
import path from "path";
import jwt from "jsonwebtoken";
import { createApp } from "../app";

function makeToken(payload: { sub: string; email: string; username?: string }) {
    return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: "1h" });
}

async function writeJson(file: string, data: unknown) {
    await fs.writeFile(file, JSON.stringify(data, null, 2), "utf-8");
}

describe("Cart & Wishlist", () => {
    let tmpDir: string;
    let app: ReturnType<typeof createApp>;
    let token: string;

    beforeAll(async () => {
        process.env.JWT_SECRET = "test_secret";
        tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "alten-api-"));
        process.env.DATA_DIR = tmpDir;

        // seed json files
        await writeJson(path.join(tmpDir, "users.json"), []);
        await writeJson(path.join(tmpDir, "carts.json"), []);
        await writeJson(path.join(tmpDir, "wishlists.json"), []);
        await writeJson(path.join(tmpDir, "products.json"), [
            {
                id: 1,
                code: "P001",
                name: "Test Product",
                description: "desc",
                image: "img",
                category: "cat",
                price: 10,
                quantity: 5,
                internalReference: "IR-1",
                shellId: 1,
                inventoryStatus: "INSTOCK",
                rating: 4,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            },
        ]);

        token = makeToken({ sub: "user-1", email: "user@test.com" });

        app = createApp();
    });

    test("POST /cart/items adds item to cart", async () => {
        const res = await request(app)
            .post("/cart/items")
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: 1, quantity: 2 });

        expect(res.status).toBe(200);
        expect(res.body.userId).toBe("user-1");
        expect(res.body.items).toEqual([{ productId: 1, quantity: 2 }]);
    });

    test("POST /wishlist/items adds product to wishlist", async () => {
        const res = await request(app)
            .post("/wishlist/items")
            .set("Authorization", `Bearer ${token}`)
            .send({ productId: 1 });

        expect(res.status).toBe(200);
        expect(res.body.userId).toBe("user-1");
        expect(res.body.productIds).toEqual([1]);
    });
});
