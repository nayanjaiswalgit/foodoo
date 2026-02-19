# Food Delivery App (Zomato/Swiggy Clone)

A full-stack food delivery platform built as a **pnpm monorepo** with Turborepo. Supports customers ordering food, restaurants managing menus/orders, delivery partners handling deliveries, and a super admin managing the platform.

## Tech Stack

| Layer                 | Technology                                                              |
| --------------------- | ----------------------------------------------------------------------- |
| **Backend**           | Node.js, Express, TypeScript, MongoDB (Mongoose), Socket.IO             |
| **Mobile (Customer)** | React Native 0.81, Expo 54, expo-router, TanStack React Query, Zustand  |
| **Mobile (Delivery)** | React Native 0.81, Expo 54, expo-router, Socket.IO, Background Location |
| **Web Admin**         | React 19, Vite, Tailwind CSS, React Router, Recharts                    |
| **Shared**            | TypeScript types, Zod validators, constants                             |
| **Auth**              | JWT (access + refresh tokens), OTP verification, RBAC                   |
| **Real-time**         | Socket.IO (order tracking, notifications)                               |
| **Infrastructure**    | Docker Compose (MongoDB 7 + Redis 7), Cloudinary (images)               |

## Project Structure

```
food-delivery/
├── apps/
│   ├── api/                  # Express backend (64 files)
│   │   └── src/
│   │       ├── config/       # DB, env, cloudinary
│   │       ├── controllers/  # Request handlers
│   │       ├── middleware/    # Auth, validation, error, upload
│   │       ├── models/       # Mongoose schemas (10 models)
│   │       ├── routes/       # API endpoints (11 route files)
│   │       ├── scripts/      # Seed script
│   │       ├── services/     # Business logic layer
│   │       ├── utils/        # ApiError, ApiResponse, asyncHandler
│   │       ├── app.ts        # Express app factory
│   │       ├── server.ts     # Entry point
│   │       └── socket.ts     # Socket.IO setup
│   │
│   ├── mobile/               # Customer app (59 files)
│   │   ├── app/              # expo-router screens
│   │   │   ├── (tabs)/       # Home, Search, Orders, Account
│   │   │   ├── auth/         # Login, Register
│   │   │   ├── restaurant/   # Restaurant detail
│   │   │   ├── cart/         # Cart & checkout
│   │   │   ├── order/        # Order tracking
│   │   │   ├── address/      # Address management
│   │   │   ├── profile/      # Profile editing
│   │   │   ├── favorites/    # Favorite restaurants
│   │   │   └── review/       # Write review
│   │   └── src/
│   │       ├── components/   # UI + restaurant + cart + order components
│   │       ├── hooks/        # useAuth, useLocation, useSocket, useDebounce
│   │       ├── services/     # API service modules
│   │       ├── stores/       # Zustand (auth, cart, location, feature flags)
│   │       ├── constants/    # Theme tokens
│   │       └── lib/          # Axios client, React Query client
│   │
│   ├── delivery/             # Delivery partner app (18 files)
│   │   ├── app/              # Login, Home, Active Delivery, Earnings
│   │   └── src/
│   │       ├── hooks/        # Background location tracking
│   │       ├── services/     # Delivery API service
│   │       ├── stores/       # Auth store with online state
│   │       └── lib/          # Axios client
│   │
│   └── web-admin/            # Admin panel (30 files)
│       └── src/
│           ├── components/   # Sidebar, ProtectedRoute, AdminLayout, StatCard
│           ├── pages/        # Dashboard, Orders, Menu, Users, Restaurants,
│           │                 # Feature Flags, Reviews, Login
│           ├── services/     # Admin + restaurant API services
│           ├── stores/       # Auth store
│           └── lib/          # Axios client, React Query client
│
└── packages/
    └── shared/               # Shared package (25 files)
        └── src/
            ├── constants/    # Roles, OrderStatus, Payment, Cuisines, FeatureFlags
            ├── types/        # IUser, IRestaurant, IOrder, IReview, ICoupon, etc.
            └── validators/   # Zod schemas for auth, order, restaurant, menu, etc.
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 9
- **Docker** & Docker Compose (for MongoDB + Redis)

### Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Start databases
docker compose up -d

# 3. Build shared package
pnpm --filter @food-delivery/shared build

# 4. Seed the database
pnpm --filter @food-delivery/api seed
```

### Run Development Servers

```bash
# Backend API (http://localhost:5000)
pnpm dev:api

# Customer mobile app (Expo)
pnpm dev:mobile

# Delivery partner app (Expo)
pnpm dev:delivery

# Web admin panel (http://localhost:5173)
pnpm dev:admin
```

Or run everything at once:

```bash
pnpm dev
```

## Test Accounts

| Role                       | Email              | Password    |
| -------------------------- | ------------------ | ----------- |
| Super Admin                | `admin@food.dev`   | `Admin@123` |
| Restaurant Owner (Pizza)   | `pizza@food.dev`   | `Owner@123` |
| Restaurant Owner (Biryani) | `biryani@food.dev` | `Owner@123` |
| Customer                   | `john@food.dev`    | `User@1234` |
| Delivery Partner           | `raj@food.dev`     | `Rider@123` |

## API Endpoints

### Auth

| Method | Endpoint                  | Description               |
| ------ | ------------------------- | ------------------------- |
| POST   | `/api/auth/register`      | Register new user         |
| POST   | `/api/auth/login`         | Login with email/password |
| POST   | `/api/auth/send-otp`      | Send OTP to phone         |
| POST   | `/api/auth/verify-otp`    | Verify phone OTP          |
| POST   | `/api/auth/refresh-token` | Refresh JWT tokens        |
| POST   | `/api/auth/logout`        | Logout                    |

### Restaurants

| Method | Endpoint                    | Description                        |
| ------ | --------------------------- | ---------------------------------- |
| GET    | `/api/restaurants`          | List with filters, pagination, geo |
| GET    | `/api/restaurants/nearby`   | Find nearby restaurants            |
| GET    | `/api/restaurants/:id`      | Restaurant detail                  |
| GET    | `/api/restaurants/:id/menu` | Restaurant menu items              |
| POST   | `/api/restaurants`          | Register restaurant (owner)        |

### Orders

| Method | Endpoint                 | Description            |
| ------ | ------------------------ | ---------------------- |
| POST   | `/api/orders`            | Place order            |
| GET    | `/api/orders/my`         | Customer order history |
| GET    | `/api/orders/:id`        | Order detail           |
| PATCH  | `/api/orders/:id/status` | Update order status    |
| POST   | `/api/orders/:id/cancel` | Cancel order           |

### Delivery

| Method | Endpoint                          | Description           |
| ------ | --------------------------------- | --------------------- |
| PATCH  | `/api/delivery/toggle-online`     | Toggle availability   |
| PATCH  | `/api/delivery/location`          | Update GPS location   |
| GET    | `/api/delivery/available-orders`  | List available orders |
| POST   | `/api/delivery/accept/:orderId`   | Accept delivery       |
| POST   | `/api/delivery/complete/:orderId` | Complete delivery     |
| GET    | `/api/delivery/earnings`          | Earnings summary      |

### Reviews

| Method | Endpoint                      | Description              |
| ------ | ----------------------------- | ------------------------ |
| POST   | `/api/reviews`                | Submit review (customer) |
| GET    | `/api/reviews/restaurant/:id` | Restaurant reviews       |
| POST   | `/api/reviews/:id/reply`      | Reply to review (owner)  |

### Admin

| Method    | Endpoint                     | Description                          |
| --------- | ---------------------------- | ------------------------------------ |
| GET       | `/api/admin/dashboard`       | Platform analytics                   |
| GET       | `/api/admin/users`           | Manage users                         |
| PATCH     | `/api/admin/restaurants/:id` | Update restaurant (commission, etc.) |
| GET/PATCH | `/api/admin/feature-flags`   | Manage feature flags                 |

## Database Models

| Model               | Description                                               |
| ------------------- | --------------------------------------------------------- |
| **User**            | Customers, owners, delivery partners, admins (role-based) |
| **Address**         | User addresses with GeoJSON Points                        |
| **Category**        | Menu categories (Starters, Main Course, etc.)             |
| **Restaurant**      | Restaurant profiles with geospatial location, ratings     |
| **MenuItem**        | Menu items with variants, addons, availability            |
| **Order**           | Full order lifecycle with status history, price snapshots |
| **DeliveryPartner** | Partner profile, vehicle, location, earnings stats        |
| **Review**          | Customer reviews with ratings and owner replies           |
| **Coupon**          | Discount codes with usage limits and validity             |
| **FeatureFlag**     | Platform-level feature toggles                            |

## Architecture Decisions

- **Monorepo:** pnpm workspaces + Turborepo for build orchestration
- **Shared package:** Single source of truth for types, validators, and constants
- **Controller → Service → Model:** Clean separation of concerns in the backend
- **Zustand + React Query:** Client state (auth, cart) vs server state (restaurants, orders)
- **Single-restaurant cart:** Cart enforces items from one restaurant only
- **Price snapshots:** Item prices copied into orders at placement time
- **Atomic delivery assignment:** `findOneAndUpdate` prevents race conditions
- **JWT + refresh tokens:** Axios interceptors auto-refresh on 401
- **Standardized responses:** All endpoints return `{ success, data, message, pagination? }`

## Real-time Features (Socket.IO)

- **Order tracking:** Customers see live status updates
- **Restaurant alerts:** New order notifications
- **Delivery location:** GPS updates forwarded to customers
- **Namespaces:** `/orders`, `/restaurant`, `/delivery` with JWT authentication

## Environment Variables

```env
# Backend (apps/api)
PORT=5000
MONGODB_URI=mongodb://localhost:27017/food_delivery
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret

# Mobile (apps/mobile & apps/delivery)
EXPO_PUBLIC_API_URL=http://localhost:5000

# Web Admin (apps/web-admin)
VITE_API_URL=http://localhost:5000/api
```

## Seed Data

Running `pnpm --filter @food-delivery/api seed` creates:

- 5 test users (1 admin, 2 restaurant owners, 1 customer, 1 delivery partner)
- 4 menu categories
- 2 restaurants (Pizza Palace, Biryani House) with full menus
- 2 discount coupons (`WELCOME50` — 50% off, `FLAT100` — ₹100 off)
- Default feature flags
