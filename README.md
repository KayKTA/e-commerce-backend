# E-commerce – Backend API

The goal of this project is to provide a simple but clean REST API for an e-commerce application, including authentication, products management, cart and wishlist features.

The backend is intentionally **file-based (JSON storage)** to keep the setup lightweight and runnable without a database.

---

## Tech stack

* **Node.js**
* **Express**
* **TypeScript**
* **JWT authentication**
* **bcrypt** (password hashing)
* **File-based storage (JSON)**
* **Swagger / OpenAPI** documentation
* **Jest + Supertest** for integration tests

---

## Features & requirements covered

### Authentication

* Create user account: `POST /account`
* Login and retrieve JWT token: `POST /token`
* JWT-based authentication for all protected routes

### Products

* List all products
* Get a product by ID
* Create / update / delete a product (**admin only**)

### Cart

* Each authenticated user has their own cart
* Add products to cart
* Update product quantity
* Remove products from cart

### Wishlist

* Each authenticated user has their own wishlist
* Add products to wishlist
* Remove products from wishlist

### Documentation

* Swagger UI available at `/docs`

### Testing

* Integration tests with **Jest + Supertest**
* Tests run on an isolated temporary data directory

---

## Project structure

```
back/
├── src/
│   ├── app.ts
│   ├── server.ts
│   ├── swagger.ts
│   ├── data/
│   │   ├── users.json
│   │   ├── products.json
│   │   ├── carts.json
│   │   └── wishlists.json
│   ├── lib/
│   │   ├── jsonStore.ts
│   │   └── dataPath.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   └── admin.middleware.ts
│   ├── models/
│   │   ├── user.model.ts
│   │   ├── product.model.ts
│   │   ├── cart.model.ts
│   │   └── wishlist.model.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── products.routes.ts
│   │   ├── cart.routes.ts
│   │   └── wishlist.routes.ts
│   └── __tests__/
│       ├── auth.test.ts
│       ├── products.test.ts
│       └── cart-wishlist.test.ts
└── README.md
```

---

## Getting started

### Installation

```bash
npm install
```

### Environment variables

Create a `.env` file at the root of the `back` folder:

```env
PORT=3001
JWT_SECRET=dev_secret_change_me
```

---

## Run the API (development)

```bash
npm run dev
```

The API will be available at:

```
http://localhost:3001
```

---

## Swagger documentation

Swagger UI is available at:

```
http://localhost:3001/docs
```

It provides:

* All available endpoints
* Request/response schemas
* Authentication support via JWT

---

## Authentication flow (Swagger or API client)

### 1. Create an account

`POST /account`

```json
{
  "username": "admin",
  "firstname": "Admin",
  "email": "admin@admin.com",
  "password": "admin123"
}
```

### 2. Login

`POST /token`

```json
{
  "email": "admin@admin.com",
  "password": "admin123"
}
```

Response:

```json
{
  "token": "<JWT_TOKEN>"
}
```

### 3. Use the token in Swagger

* Click **Authorize** in Swagger UI
* Paste:

```
Bearer <JWT_TOKEN>
```

You can now access protected endpoints.

---

## Products seed

A sample dataset is provided in:

```
src/data/products.json
```

This allows the API (and front-end) to work immediately after cloning the repository.

---

## Data storage strategy

* Data is stored in JSON files (users, products, carts, wishlists)
* For real-world usage, a database should be used instead

---

## Tests

### Run all tests

```bash
npm test
```

### Watch mode

```bash
npm run test:watch
```

### Testing strategy

* Integration tests using **Supertest**
* Each test suite runs with an isolated temporary `DATA_DIR`
* No test ever modifies `src/data`
