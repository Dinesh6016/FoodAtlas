# 🍲 FoodAtlas — Scalable Restaurant & Food Discovery Platform

**FoodAtlas** is a production-grade restaurant, menu, and culinary discovery platform built for nationwide scale, designed initially for India (INR) and architected for international expansion. Inspired by the best discovery elements of Zomato, Google Maps, and Swiggy, FoodAtlas places prime focus on **dish-level search, complete digital menus, QR codes, food photography, owner self-service management, and robust administrative moderation**.

---

## 🌟 Key Features

### 🔍 For Food Lovers & Diners
- **Multi-Vector Search**: Instant search by Restaurant Name (*Paradise*), Dish (*Biryani*, *Paneer Butter Masala*), Cuisine (*Hyderabadi*, *South Indian*), or Area (*Banjara Hills*, *Indiranagar*).
- **Rich Dietary Indicators**: Indian FSSAI compliant Veg (🟢 green dot), Non-Veg (🔴 red triangle), and Egg (🟡 oval) badges, with spicy flame indicators.
- **Interactive Geospatial Map**: Discovery map with pins, ratings, distance calculation, and direct driving directions.
- **Complete Digital Menus**: Detailed item descriptions, prices in INR (`₹`), discounted pricing, and category jump tabs.
- **QR Tableside Menus**: Instant, mobile-first `/menu/[slug]` view with downloadable PNG QR codes for restaurant tables.
- **Verified Reviews & Ratings**: 1–5 star reviews with title, body, and timestamp validation.
- **Saved Favorites**: Personalized `/favorites` collection with immediate save/remove toggling.

### 🏢 For Restaurant Owners & Partners
- **Owner Dashboard**: Real-time discovery metrics (profile views, menu views, review counts).
- **Restaurant Listing Creation**: Intuitive onboarding flow with location mapping, price range, and cuisine tagging.
- **Ownership Verification Claims**: Claim existing directory listings by submitting FSSAI/GST certificates.
- **Interactive Menu Editor**: Add and organize menu categories (*Starters*, *Main Course*, *Desserts*) and menu items with instant live preview.
- **Operating Hours Management**: Set opening and closing hours for all 7 days of the week.

### 🛡️ For Platform Administrators
- **Moderation Console**: Approve or reject new restaurant submissions and verify owner claims with one click.
- **Audit Logging**: Sensitive administrative actions automatically generate immutable `AuditLog` records with actor ID, IP address, and old/new state snapshots.
- **Bulk CSV Data Onboarding**: Automated script (`scripts/import-restaurants.ts`) to import bulk restaurant records from `data/restaurants.csv` with full data provenance tracking.

---

## 🏗️ Architecture & Technology Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | **Next.js 16.4.0 (App Router)** with React 19 Server Components |
| **Language** | **TypeScript 5.x** with strict type checking |
| **Styling & Design System** | **Tailwind CSS 4.x** with custom warm culinary color tokens and glassmorphism |
| **Icons & Micro-interactions** | **Lucide React** |
| **Database** | **PostgreSQL** with PostGIS geography compatibility |
| **ORM & Migrations** | **Prisma 6.4.1** (with connection pooling and transaction support) |
| **Search System** | PostgreSQL Trigram/Full-Text Search abstraction layer (prepared for Meilisearch/Elasticsearch) |
| **Cache Layer** | In-Memory & Redis abstraction layer (`lib/cache/redis.ts`) |
| **Authentication** | Secure HTTP-only JWT sessions with `bcryptjs` password hashing and multi-role RBAC (`USER`, `OWNER`, `ADMIN`) |
| **Digital QR Generator** | Native `qrcode` canvas rendering with PNG export |
| **Validation** | Strict **Zod 4.x** runtime validation schemas |
| **Containerization** | Multi-stage production `Dockerfile` & `docker-compose.yml` |

---

## 🚀 Quick Start Guide

### Prerequisites
- **Node.js**: v20+ or v22+
- **PostgreSQL**: Local server or Docker container
- **npm** (or pnpm/yarn)

---

### Step 1: Clone & Install Dependencies
```bash
# Clone the repository
git clone https://github.com/your-username/foodatlas.git
cd foodatlas

# Install dependencies
npm install
```

---

### Step 2: Configure Environment Variables
Copy the `.env.example` file to `.env`:
```bash
# Windows PowerShell:
Copy-Item .env.example .env

# Linux / macOS:
cp .env.example .env
```

Ensure your PostgreSQL credentials in `.env` match your local environment:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/foodatlas?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/foodatlas?schema=public"
AUTH_SECRET="foodatlas-dev-secret-key-32-chars-long-secure-token-development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

*(Optional) Start PostgreSQL and Redis via Docker Compose:*
```bash
docker compose up -d
```

---

### Step 3: Run Database Migrations & Seed Sample Data
Synchronize the Prisma schema and seed 35+ realistic Indian restaurants across Hyderabad, Bengaluru, and Mumbai:
```bash
# Synchronize schema to PostgreSQL
npm run db:push

# Seed realistic restaurants, cuisines, and menus
npm run db:seed
```

---

### Step 4: Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Demo Accounts & Credentials

The seed script (`prisma/seed.ts`) automatically configures the following demo accounts:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Admin** | `admin@foodatlas.com` | `admin123` | Full access to `/admin/dashboard` (Approve/Reject restaurants & claims) |
| **Restaurant Owner** | `owner@foodatlas.com` | `owner123` | Access to `/owner/dashboard` (Manage Paradise Biryani & menus) |
| **Partner Owner 2** | `owner2@foodatlas.com` | `owner123` | Access to `/owner/dashboard` (Manage Tatva Gourmet & Vidyarthi Bhavan) |
| **Diner / User** | `user@foodatlas.com` | `password123` | Access to write reviews and save favorites at `/favorites` |

---

## 🧪 Testing

FoodAtlas includes a complete automated test suite verifying unit logic, validation, auth crypto, database integration, and end-to-end user journeys:

```bash
# Run Unit & Integration Tests:
npm run test

# Run End-to-End Simulation Tests:
npm run test:e2e
```

---

## 📡 REST API Reference

All responses follow the standard JSON envelope:
`{ "success": true, "data": { ... }, "message": "..." }`

### Public Discovery & Search
- `GET /api/search?q=biryani&city=Hyderabad` — Search restaurants with filters and distance.
- `GET /api/search/dishes?q=paneer` — Search specific dishes across restaurant menus.
- `GET /api/restaurants` — List featured and trending restaurants.
- `GET /api/restaurants/[id]` — Retrieve restaurant metadata, hours, and approved reviews.
- `GET /api/restaurants/[id]/menu` — Retrieve public digital menu with categories.

### Authentication & Sessions
- `POST /api/auth/register` — Register a new `USER` or `OWNER`.
- `POST /api/auth/login` — Sign in and issue secure HTTP-only session cookie.
- `POST /api/auth/logout` — Terminate active session.
- `GET /api/auth/me` — Retrieve currently logged-in user profile.

### Reviews & Favorites
- `GET /api/restaurants/[id]/reviews` — Fetch verified customer reviews.
- `POST /api/restaurants/[id]/reviews` — Submit customer review (recalculates average rating in a transaction).
- `GET /api/favorites` — Fetch user's saved restaurants.
- `POST /api/favorites` — Save restaurant to favorites.
- `DELETE /api/favorites/[restaurantId]` — Remove restaurant from favorites.

### Owner Management
- `POST /api/restaurants` — Create a new restaurant listing.
- `POST /api/restaurants/[id]/menu/categories` — Add menu category.
- `POST /api/menu/items` — Add dish with price, diet flags, and photo.
- `POST /api/owner/claims` — Submit business ownership verification claim.

### Admin Moderation
- `POST /api/admin/restaurants/[id]/approve` — Approve or reject listing with `AuditLog`.
- `POST /api/admin/claims/[id]/review` — Grant or reject owner verification claim.

---

## 📦 Production Build & Deployment

To generate an optimized production bundle:
```bash
npm run build
npm run start
```

### Deploying to Vercel
1. Push repository to GitHub.
2. Import project into Vercel.
3. Configure Environment Variables (`DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`).
4. Set build command: `npx prisma generate && next build`.

---

## 🗺️ Future Scaling Roadmap (Phases 3 & 4)
- **AI Menu OCR**: Automated extraction of printed menus and PDF rate cards via computer vision and LLM parsing.
- **Multilingual Support**: Architectural support for Telugu, Hindi, Tamil, Kannada, Malayalam, and Marathi menu translations.
- **Distributed Search**: Zero-downtime Meilisearch / Elasticsearch cluster integration via `lib/search/search-service.ts`.
- **Event-Driven Analytics**: Out-of-the-box integration with PostHog or custom Kafka event streaming for nationwide search telemetry.

---
*Built with ❤️ for India's food lovers and restaurants.*
