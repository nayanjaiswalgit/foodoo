# GitHub Copilot — repository instructions

## What this repo is

A food delivery platform built as a pnpm + Turborepo monorepo. Five packages:

- `apps/api` — Express 4 + TypeScript (CommonJS), Mongoose, Socket.IO, JWT auth, Zod validation
- `apps/mobile` — React Native customer app (Expo 54, expo-router 5)
- `apps/delivery` — React Native delivery partner app (Expo 54, expo-router 5)
- `apps/web-admin` — Restaurant/admin dashboard (Vite 7, React 19, Tailwind v4)
- `packages/shared` — Shared TypeScript types, Zod schemas, and enums — the single source of truth

## Key conventions

**TypeScript**: Strict mode everywhere. No `any`. Use `unknown` + narrowing instead.
`noUncheckedIndexedAccess` is on — always guard array/object access.

**Imports**: Use `import type` for type-only imports. Import roles, order statuses, and payment
types exclusively from `@food-delivery/shared` — never hardcode these strings.

**Backend pattern**: Route → Zod validation middleware → auth middleware → Controller → Service → Model.
Controllers wrap async handlers with `asyncHandler`. Services throw `ApiError` on failure.
All responses use `sendResponse(res, status, data, msg)`.

**Frontend state**: Zustand for client state; TanStack React Query for server state.
Axios interceptors handle JWT and silent token refresh — do not add manual token handling.
Mobile uses `expo-secure-store`; web-admin uses `localStorage`.

**Formatting**: Prettier with single quotes, semicolons, `trailingComma: "es5"`, 100-char width.
Run `pnpm exec prettier --write <file>` to format.

## Build commands

```
pnpm dev:api       # Express API on :5000
pnpm dev:admin     # Vite web-admin on :5173
pnpm dev:mobile    # Expo customer app
pnpm dev:delivery  # Expo delivery app
pnpm build         # All packages via Turborepo
pnpm --filter @food-delivery/api seed   # Seed DB
```

## What to avoid

- Do not suggest `console.log` in production code paths.
- Do not use `as any` or `// @ts-ignore` without an explanation comment.
- Do not add dependencies without checking if the shared package already solves the need.
- Do not write business logic in Express controllers — put it in service files.
