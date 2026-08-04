# ShopEase — Full-Stack E-Commerce App

A complete, Dockerized e-commerce application:

- **Backend:** Node.js + Express + MySQL (`mysql2`) + JWT auth
- **Frontend:** React (Vite) + React Router, responsive custom UI
- **Database:** Your existing Amazon RDS MySQL instance
- **Payments:** Dummy/mock payment flow (no real gateway wired up)

```
ecommerce-app/
├── backend/    Express API (auth, products, cart, orders)
├── frontend/   React SPA
└── README.md   You are here
```

## Features

- User registration & login (JWT-based auth)
- Product catalog with search & category filter
- Shopping cart (add / update quantity / remove)
- Checkout with a dummy payment step
- Order history per user
- Responsive, custom-designed UI (no component library)
- Standalone Dockerfiles for both services (build/run each with plain `docker` commands)
- Connects directly to your existing RDS MySQL instance — no DB container included

---

## 1. Set up the database schema

Run the schema against your existing RDS instance once. It creates the
`ecommerce` database, all tables, and inserts 8 sample products.

```bash
mysql -h <your-rds-endpoint> -P 3306 -u <your-db-user> -p < backend/db/schema.sql
```

> Make sure your RDS security group allows inbound MySQL (3306) traffic
> from wherever you run this command (and later, from your backend host).

---

## 2. Configure the backend

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
NODE_ENV=production

JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d

DB_HOST=your-db-instance.xxxxxxxxxx.us-east-1.rds.amazonaws.com
DB_PORT=3306
DB_USER=admin
DB_PASSWORD=your_rds_password
DB_NAME=ecommerce

CLIENT_ORIGIN=http://localhost:3000
```

> If your RDS instance enforces SSL, uncomment the `ssl` option in
> `backend/src/config/db.js`.

---

## 3. Configure the frontend

```bash
cd frontend
cp .env.example .env
```

Edit `.env` to point at wherever the backend will be reachable from the
**browser** (not from inside Docker):

```env
VITE_API_URL=http://localhost:5000/api
```

When deploying to a server, use its public IP/domain, e.g.
`https://api.yourdomain.com/api`.

---

## 4. Run with Docker (recommended)

Build and run each container directly — no orchestration tool needed.

**Backend**

```bash
cd backend
docker build -t shopease-backend .
docker run -d --name shopease-backend \
  --env-file .env \
  -p 5000:5000 \
  shopease-backend
```

**Frontend**

The frontend needs to know the backend's URL *at build time* (Vite bakes
it into the static bundle), so pass it as a build arg:

```bash
cd frontend
docker build -t shopease-frontend \
  --build-arg VITE_API_URL=http://localhost:5000/api \
  .
docker run -d --name shopease-frontend \
  -p 3000:80 \
  shopease-frontend
```

Check the backend is healthy:

```bash
curl http://localhost:5000/api/health
```

Open the app: `http://localhost:3000`

Stop everything:

```bash
docker stop shopease-backend shopease-frontend
docker rm shopease-backend shopease-frontend
```

---

## 5. Run without Docker (local dev)

**Backend**

```bash
cd backend
npm install
npm run dev      # nodemon, auto-reload
# or: npm start
```

**Frontend**

```bash
cd frontend
npm install
npm run dev       # http://localhost:3000 (Vite dev server)
```

---

## 6. Deploying to a server (EC2, etc.)

1. Copy this whole folder to your server (or `git clone` your repo there).
2. Fill in `backend/.env` with your **production** RDS credentials and a
   strong `JWT_SECRET`.
3. Set `VITE_API_URL` in `frontend/.env` (and as a build arg, see below)
   to your public backend URL, e.g. `https://api.yourdomain.com/api`.
4. Update `CLIENT_ORIGIN` in `backend/.env` to your public frontend URL
   so CORS allows it.
5. Build and run each container (see the commands in section 4 above),
   using your production `VITE_API_URL` as the frontend build arg and
   your production `backend/.env` for the backend.

6. Put both containers behind your reverse proxy / load balancer of
   choice (Nginx, ALB, Caddy, etc.) and terminate TLS there. Point:
   - `yourdomain.com` → frontend container (port 3000 → 80)
   - `api.yourdomain.com` → backend container (port 5000)

7. Make sure your RDS security group allows inbound 3306 from the
   backend's host/security group.

---

## API Overview

| Method | Endpoint              | Auth | Description               |
|--------|------------------------|------|----------------------------|
| POST   | `/api/auth/register`   | No   | Create account             |
| POST   | `/api/auth/login`      | No   | Log in, get JWT            |
| GET    | `/api/auth/me`         | Yes  | Current user profile       |
| GET    | `/api/products`        | No   | List products (search/category) |
| GET    | `/api/products/:id`    | No   | Product detail              |
| GET    | `/api/cart`            | Yes  | Get current user's cart     |
| POST   | `/api/cart`             | Yes  | Add item to cart            |
| PUT    | `/api/cart/:id`         | Yes  | Update item quantity        |
| DELETE | `/api/cart/:id`         | Yes  | Remove item                 |
| DELETE | `/api/cart`             | Yes  | Clear cart                  |
| POST   | `/api/orders`           | Yes  | Place order (dummy payment) |
| GET    | `/api/orders`           | Yes  | List current user's orders  |
| GET    | `/api/orders/:id`       | Yes  | Order detail                |

Authenticated requests need `Authorization: Bearer <token>`.

---

## Notes & next steps

- The payment step in `orderController.js` is a stub (`paymentSuccess = true`).
  Swap it for Stripe/Razorpay/etc. when you're ready to accept real payments.
- Passwords are hashed with bcrypt; never store plaintext passwords.
- For production, consider adding rate limiting, input validation
  middleware (e.g. `zod`/`joi`), and HTTPS everywhere.
