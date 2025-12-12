import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import { JsonStore } from "../lib/jsonStore";
import type { User } from "../models/user.model";
import { USERS_PATH } from "../config/paths";

export const authRouter = Router();

const usersStore = new JsonStore<User>(USERS_PATH);

/**
 * @swagger
 * /account:
 *   post:
 *     summary: Create a new user account
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, firstname, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               firstname:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Account created
 *       400:
 *         description: Invalid payload
 *       409:
 *         description: Email already exists
 */
authRouter.post("/account", async (req, res) => {
    const { username, firstname, email, password } = req.body ?? {};

    if (!username || !firstname || !email || !password) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    const users = await usersStore.readAll();

    const existing = users.find((u) => u.email === email);
    if (existing) {
        return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser: User = {
        id: crypto.randomUUID(),
        username,
        firstname,
        email,
        passwordHash,
        createdAt: Date.now(),
    };

    users.push(newUser);
    await usersStore.writeAll(users);

    return res.status(201).json({ message: "Account created" });
});

/**
 * @swagger
 * /token:
 *   post:
 *     summary: Login and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Authenticated
 *       401:
 *         description: Invalid credentials
 */
authRouter.post("/token", async (req, res) => {
    const { email, password } = req.body ?? {};

    if (!email || !password) {
        return res.status(400).json({ error: "Missing credentials" });
    }

    const users = await usersStore.readAll();
    const user = users.find((u) => u.email === email);

    if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        return res.status(401).json({ error: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
        return res.status(500).json({ error: "JWT secret not configured" });
    }

    const token = jwt.sign(
        {
            sub: user.id,
            email: user.email,
            username: user.username,
        },
        secret,
        { expiresIn: "1h" }
    );

    return res.json({ token });
});
