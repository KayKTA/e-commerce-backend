import { Router } from "express";
import { JsonStore } from "../lib/jsonStore";
import { requireAuth } from "../middlewares/auth.middleware";
import type { Wishlist } from "../models/wishlist.model";
import type { Product } from "../models/product.model";
import { PRODUCTS_PATH, WISHLISTS_PATH } from "../config/paths";

export const wishlistRouter = Router();

const wishlistsStore = new JsonStore<Wishlist>(WISHLISTS_PATH);
const productsStore = new JsonStore<Product>(PRODUCTS_PATH);

/**
 * @swagger
 * /wishlist:
 *   get:
 *     summary: Get current user's wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Wishlist returned }
 */
wishlistRouter.get("/", requireAuth, async (req, res) => {
    const userId = req.user!.sub;

    const lists = await wishlistsStore.readAll();
    const wishlist = lists.find((w) => w.userId === userId) ?? {
        userId,
        productIds: [],
        updatedAt: Date.now(),
    };

    return res.json(wishlist);
});

/**
 * @swagger
 * /wishlist/items:
 *   post:
 *     summary: Add a product to wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer }
 *     responses:
 *       200: { description: Wishlist updated }
 *       400: { description: Invalid payload }
 *       404: { description: Product not found }
 */
wishlistRouter.post("/items", requireAuth, async (req, res) => {
    const userId = req.user!.sub;
    const pid = Number(req.body?.productId);

    if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({ error: "Invalid productId" });
    }

    const products = await productsStore.readAll();
    const productExists = products.some((p) => p.id === pid);
    if (!productExists) {
        return res.status(404).json({ error: "Product not found" });
    }

    const lists = await wishlistsStore.readAll();
    let wishlist = lists.find((w) => w.userId === userId);

    if (!wishlist) {
        wishlist = { userId, productIds: [], updatedAt: Date.now() };
        lists.push(wishlist);
    }

    if (!wishlist.productIds.includes(pid)) wishlist.productIds.push(pid);

    wishlist.updatedAt = Date.now();
    await wishlistsStore.writeAll(lists);

    return res.json(wishlist);
});

/**
 * @swagger
 * /wishlist/items/{productId}:
 *   delete:
 *     summary: Remove a product from wishlist
 *     tags: [Wishlist]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Wishlist updated }
 */
wishlistRouter.delete("/items/:productId", requireAuth, async (req, res) => {
    const userId = req.user!.sub;
    const pid = Number(req.params.productId);

    if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({ error: "Invalid productId" });
    }

    const lists = await wishlistsStore.readAll();
    const wishlist = lists.find((w) => w.userId === userId);

    if (!wishlist) {
        return res.json({ userId, productIds: [], updatedAt: Date.now() });
    }

    wishlist.productIds = wishlist.productIds.filter((id) => id !== pid);
    wishlist.updatedAt = Date.now();

    await wishlistsStore.writeAll(lists);
    return res.json(wishlist);
});
