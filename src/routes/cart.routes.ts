import { Router } from "express";
import { JsonStore } from "../lib/jsonStore";
import { requireAuth } from "../middlewares/auth.middleware";
import type { Cart } from "../models/cart.model";
import type { Product } from "../models/product.model";
import { CARTS_PATH, PRODUCTS_PATH } from "../config/paths";

export const cartRouter = Router();

const cartsStore = new JsonStore<Cart>(CARTS_PATH);
const productsStore = new JsonStore<Product>(PRODUCTS_PATH);

function assertPositiveInt(n: unknown): n is number {
    return typeof n === "number" && Number.isInteger(n) && n > 0;
}

/**
 * @swagger
 * /cart:
 *   get:
 *     summary: Get current user's cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200: { description: Cart returned }
 */
cartRouter.get("/", requireAuth, async (req, res) => {
    const userId = req.user!.sub;

    const carts = await cartsStore.readAll();
    const cart = carts.find((c) => c.userId === userId) ?? {
        userId,
        items: [],
        updatedAt: Date.now(),
    };

    return res.json(cart);
});

/**
 * @swagger
 * /cart/items:
 *   post:
 *     summary: Add product to cart (or increase quantity)
 *     tags: [Cart]
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
 *               quantity: { type: integer, default: 1 }
 *     responses:
 *       200: { description: Cart updated }
 *       400: { description: Invalid payload }
 *       404: { description: Product not found }
 */
cartRouter.post("/items", requireAuth, async (req, res) => {
    const userId = req.user!.sub;
    const { productId, quantity } = req.body ?? {};

    const pid = Number(productId);
    const qty = quantity === undefined ? 1 : Number(quantity);

    if (!Number.isInteger(pid) || pid <= 0 || !assertPositiveInt(qty)) {
        return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    const products = await productsStore.readAll();
    const productExists = products.some((p) => p.id === pid);
    if (!productExists) {
        console.log('====================================');
        console.log(pid);
        console.log('====================================');
        return res.status(404).json({ error: "Product not found" });
    }

    const carts = await cartsStore.readAll();
    let cart = carts.find((c) => c.userId === userId);

    if (!cart) {
        cart = { userId, items: [], updatedAt: Date.now() };
        carts.push(cart);
    }

    const item = cart.items.find((i) => i.productId === pid);
    if (item) item.quantity += qty;
    else cart.items.push({ productId: pid, quantity: qty });

    cart.updatedAt = Date.now();
    await cartsStore.writeAll(carts);

    return res.json(cart);
});

/**
 * @swagger
 * /cart/items/{productId}:
 *   patch:
 *     summary: Set quantity for a product in cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer }
 *     responses:
 *       200: { description: Cart updated }
 *       400: { description: Invalid payload }
 */
cartRouter.patch("/items/:productId", requireAuth, async (req, res) => {
    const userId = req.user!.sub;
    const pid = Number(req.params.productId);
    const qty = Number(req.body?.quantity);

    if (!Number.isInteger(pid) || pid <= 0 || !assertPositiveInt(qty)) {
        return res.status(400).json({ error: "Invalid productId or quantity" });
    }

    const carts = await cartsStore.readAll();
    const cart = carts.find((c) => c.userId === userId) ?? {
        userId,
        items: [],
        updatedAt: Date.now(),
    };

    const item = cart.items.find((i) => i.productId === pid);
    if (item) item.quantity = qty;
    else cart.items.push({ productId: pid, quantity: qty });

    // ensure cart is in list
    if (!carts.some((c) => c.userId === userId)) carts.push(cart);

    cart.updatedAt = Date.now();
    await cartsStore.writeAll(carts);

    return res.json(cart);
});

/**
 * @swagger
 * /cart/items/{productId}:
 *   delete:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: Cart updated }
 */
cartRouter.delete("/items/:productId", requireAuth, async (req, res) => {
    const userId = req.user!.sub;
    const pid = Number(req.params.productId);

    if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({ error: "Invalid productId" });
    }

    const carts = await cartsStore.readAll();
    const cart = carts.find((c) => c.userId === userId);

    if (!cart) {
        return res.json({ userId, items: [], updatedAt: Date.now() });
    }

    cart.items = cart.items.filter((i) => i.productId !== pid);
    cart.updatedAt = Date.now();

    await cartsStore.writeAll(carts);
    return res.json(cart);
});
