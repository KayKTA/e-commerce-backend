import path from "path";

export const DATA_DIR = path.resolve(process.cwd(), "src/data");

export const USERS_PATH = path.join(DATA_DIR, "users.json");
export const PRODUCTS_PATH = path.join(DATA_DIR, "products.json");
export const CARTS_PATH = path.join(DATA_DIR, "carts.json");
export const WISHLISTS_PATH = path.join(DATA_DIR, "wishlists.json");
