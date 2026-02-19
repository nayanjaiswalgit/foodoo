# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Run Commands

```bash
# Start databases (required first)
docker compose up -d

# Development servers (via Turborepo)
pnpm dev:api          # Backend at http://localhost:5000
pnpm dev:mobile       # Customer app (Expo)
pnpm dev:delivery     # Delivery partner app (Expo)
pnpm dev:admin        # Web admin at http://localhost:5173

# Build
pnpm build            # All packages (shared builds first via turbo ^build)
pnpm --filter @food-delivery/shared build   # Shared package only
pnpm --filter @food-delivery/api build      # API only

# Seed database with test data
pnpm --filter @food-delivery/api seed

# Lint (only web-admin has eslint configured)
pnpm --filter @food-delivery/web-admin lint

# Clean build artifacts
pnpm clean
```

## Architecture

**Monorepo** using pnpm workspaces + Turborepo. Five packages:

- `apps/api` — Express + TypeScript backend (CommonJS, uses `tsx` for dev)
- `apps/mobile` — Customer React Native app (Expo 54 + expo-router)
- `apps/delivery` — Delivery partner React Native app (Expo 54 + expo-router)
- `apps/web-admin` — Restaurant/Admin dashboard (Vite + React 19 + Tailwind v4)
- `packages/shared` — Types, Zod validators, constants (consumed as raw TS source via `workspace:*`)

### Backend Pattern (apps/api)

**Request flow:** Route → validate.middleware (Zod) → auth.middleware → Controller → Service → Model

- **Controllers** only handle `req`/`res` — delegate to services. Wrapped with `asyncHandler` (no try-catch needed).
- **Services** contain business logic, throw `ApiError` on failure.
- **All responses** use `sendResponse(res, status, data, msg)` or `sendPaginatedResponse()` returning `{ success, data, message, pagination? }`.
- **Auth:** JWT access token (15m) + refresh token (7d). `authenticate` middleware extracts Bearer token, attaches `req.user = { _id, role }`. `authorize(...roles)` checks RBAC.
- **Socket.IO** namespaces: `/orders`, `/restaurant`, `/delivery` — each with JWT auth middleware. Rooms are `user:<id>`, `order:<id>`, `restaurant:<id>`, `partner:<id>`.
- **Env validation** in `src/config/env.ts` using Zod — crashes on startup if invalid.

### Frontend State Pattern

- **Zustand** for client state: auth store (tokens in SecureStore/localStorage), cart store (single-restaurant enforced), location store, feature flag store.
- **TanStack React Query** for server state: restaurants, orders, menus, reviews. Configured with 5-min stale time, 2 retries.
- **Axios interceptors** on all frontends: auto-attach JWT, auto-refresh on 401 via refresh token, clear tokens on refresh failure.
- Mobile apps use `expo-secure-store` for tokens; web-admin uses `localStorage`.

### Shared Package

Single source of truth for cross-app types and validation. Key exports:
- `UserRole`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`, `FeatureFlag` enums/constants
- `ORDER_STATUS_FLOW` map defining valid status transitions
- Zod schemas (used both frontend forms and backend request validation)
- TypeScript interfaces: `IUser`, `IRestaurant`, `IMenuItem`, `IOrder`, `IReview`, `ICoupon`, `IDeliveryPartner`

### API Route Mounting

All routes mounted under `/api/` in `app.ts`:
`auth`, `users`, `addresses`, `restaurants`, `menu`, `orders`, `delivery`, `coupons`, `reviews`, `uploads`, `admin`

### Mobile File-Based Routing (expo-router)

- `app/(tabs)/` — Tab navigator: Home, Search, Orders, Account
- `app/auth/` — Login, Register
- `app/restaurant/[id].tsx` — Restaurant detail with menu
- `app/cart/`, `app/order/[id].tsx`, `app/address/`, `app/profile/`, `app/favorites/`, `app/review/[id].tsx`

## Key Conventions

- **TypeScript strict mode** everywhere. No `any`. `noUncheckedIndexedAccess` enabled.
- **Roles** and **order statuses** come from `@food-delivery/shared` constants — never hardcode strings.
- Backend API tsconfig uses `CommonJS` module (Node.js), while shared and web-admin use `ESNext`.
- Delivery assignment uses atomic `findOneAndUpdate` with availability check to prevent race conditions.
- Cart store prevents mixing items from different restaurants.
- Order items are price-snapshotted at placement time.
- No test framework is configured yet.

## Test Accounts (from seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@food.dev | Admin@123 |
| Restaurant Owner | pizza@food.dev | Owner@123 |
| Restaurant Owner | biryani@food.dev | Owner@123 |
| Customer | john@food.dev | User@1234 |
| Delivery Partner | raj@food.dev | Rider@123 |
