import { Router } from "express";
import { JsonStore } from "../lib/jsonStore";
import { requireAuth } from "../middlewares/auth.middleware";
import { requireAdmin } from "../middlewares/admin.middleware";
import type { Product } from "../models/product.model";
import path from "path";
import { dataPath } from "../lib/dataPath";

export const productsRouter = Router();

const productsStore = new JsonStore<Product>(dataPath("products.json"));

/**
 * @swagger
 * /products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: List of products
 *       500:
 *         description: Internal server error
 */
productsRouter.get("/", requireAuth, async (_req, res) => {
    try {
        const products = await productsStore.readAll();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch products" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productsRouter.get("/:id", requireAuth, async (req, res) => {
    const { id } = req.params;
    try {
        const products = await productsStore.readAll();
        const product = products.find((p) => p.id === Number(id));

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch product" });
    }
});

/**
 * @swagger
 * /products:
 *   post:
 *     summary: Add a new product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - category
 *               - quantity
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Internal server error
 */
productsRouter.post("/", requireAuth, requireAdmin, async (req, res) => {
    const { name, description, image, category, price, quantity } = req.body;

    if (!name || !price || !category || quantity === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        const products = await productsStore.readAll();
        const newProduct: Product = {
            id: products.length + 1,  // simple auto-increment logic
            code: `PROD-${Date.now()}`, // simple unique code
            name,
            description,
            image,
            category,
            price,
            quantity,
            internalReference: `REF-${Math.random().toString(36).substr(2, 9)}`, // random internal reference
            shellId: Math.floor(Math.random() * 1000), // random shell ID (you can improve this)
            inventoryStatus: quantity > 0 ? "INSTOCK" : "OUTOFSTOCK",
            rating: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };

        products.push(newProduct);
        await productsStore.writeAll(products);

        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: "Failed to create product" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   put:
 *     summary: Update a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               image:
 *                 type: string
 *               category:
 *                 type: string
 *               price:
 *                 type: number
 *               quantity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product updated
 *       400:
 *         description: Invalid data
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productsRouter.put("/:id", requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;
    const { name, description, image, category, price, quantity } = req.body;

    try {
        const products = await productsStore.readAll();
        const product = products.find((p) => p.id === Number(id));

        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        // Update product
        product.name = name ?? product.name;
        product.description = description ?? product.description;
        product.image = image ?? product.image;
        product.category = category ?? product.category;
        product.price = price ?? product.price;
        product.quantity = quantity ?? product.quantity;
        product.inventoryStatus = quantity > 0 ? "INSTOCK" : "OUTOFSTOCK";
        product.updatedAt = Date.now();

        await productsStore.writeAll(products);

        res.json(product);
    } catch (err) {
        res.status(500).json({ error: "Failed to update product" });
    }
});

/**
 * @swagger
 * /products/{id}:
 *   delete:
 *     summary: Delete a product (admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       204:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
productsRouter.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const products = await productsStore.readAll();
        const productIndex = products.findIndex((p) => p.id === Number(id));

        if (productIndex === -1) {
            return res.status(404).json({ error: "Product not found" });
        }

        products.splice(productIndex, 1); // Remove product
        await productsStore.writeAll(products);

        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: "Failed to delete product" });
    }
});
