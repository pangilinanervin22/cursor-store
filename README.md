# 📚 BookStore Inventory & POS System

A modern, full-featured bookstore management system built with Next.js 16, React 19, TypeScript, PostgreSQL, and Tailwind CSS. Features complete inventory management, point-of-sale, sales tracking, and Docker support.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)

## ✨ Features

### 📦 Inventory Management
- **Complete Book CRUD**: Add, edit, and delete books with cover images
- **Image Uploads**: Uploadthing integration for book cover images
- **Stock Tracking**: Real-time stock levels with low-stock alerts
- **Smart Search & Sort**: Filter and sort books by title, author, genre, price, or stock

### 💰 Point of Sale (POS)
- **Intuitive Interface**: Two-column layout for quick transactions
- **Real-time Cart**: Add/remove items with quantity controls
- **Stock Validation**: Prevents overselling with automatic stock checks
- **Cash Handling**: Cash received input with automatic change calculation
- **Tax Calculation**: Built-in 12% VAT calculation

### 📊 Sales History
- **Complete Transaction Log**: View all past sales with details
- **Edit Sales**: Adjust quantities or remove items from past sales
- **Stock Restoration**: Automatic stock adjustment when editing/deleting sales
- **Sales Statistics**: Track total revenue, items sold, and daily performance

### 🔐 Authentication
- **Basic Auth**: Username/password authentication
- **Session Management**: Secure cookie-based sessions
- **Protected Routes**: Route protection via server-side session checks

### 🎨 User Interface
- **Dark Mode**: Beautiful, modern dark theme
- **Responsive Design**: Works on desktop and tablet
- **Client-side Pagination**: Fast navigation through large datasets
- **Custom Scrollbars**: Themed scrollbars matching the dark UI

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router, Server Actions) |
| **Language** | TypeScript 5.6 |
| **UI Library** | React 19 |
| **Database** | PostgreSQL 16 + Prisma ORM 5 |
| **Styling** | Tailwind CSS 3.4 |
| **UI Components** | Custom Shadcn-style components + Lucide icons |
| **File Uploads** | Uploadthing 7 |
| **Authentication** | Custom session-based auth |
| **Containerization** | Docker (multi-stage build) + Docker Compose |

## 📋 Prerequisites

- Node.js 20+
- PostgreSQL 16+ (or use Docker)
- Uploadthing account (for image uploads)
- npm

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/pangilinanervin22/cursor-store.git
cd cursor-store
npm install
```

### 2. Configure Environment

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` with your credentials:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"

# Uploadthing (https://uploadthing.com)
UPLOADTHING_TOKEN="your-uploadthing-token"

# Authentication
AUTH_USERNAME="admin"
AUTH_PASSWORD="your-secure-password"
AUTH_SECRET="your-secret-key-for-sessions"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Set Up Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Seed sample data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and login with your configured credentials.

### Docker Setup (Alternative)

Run the entire stack (app + PostgreSQL) with Docker Compose:

```bash
# Build and start all services
docker compose up -d

# Or build the image manually
./docker-build.sh
```

The app will be available at `http://localhost:3000` with a PostgreSQL database running on port `5432`.

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio GUI |
| `npm run db:seed` | Seed database with sample data |

## 📁 Project Structure

```
├── app/
│   ├── actions.ts              # Book CRUD server actions
│   ├── globals.css             # Global styles & CSS variables
│   ├── layout.tsx              # Root layout with dark mode
│   ├── page.tsx                # Inventory Dashboard (home)
│   ├── actions/
│   │   ├── auth.ts             # Authentication actions
│   │   ├── pos.ts              # POS server actions
│   │   ├── sales.ts            # Sales CRUD server actions
│   │   └── uploadthing.ts      # Image deletion actions
│   ├── api/
│   │   └── uploadthing/        # Uploadthing API routes
│   ├── login/
│   │   └── page.tsx            # Login page
│   ├── pos/
│   │   └── page.tsx            # Point of Sale page
│   └── sales/
│       └── page.tsx            # Sales History page
├── components/
│   ├── ui/                     # Shadcn-style UI primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── pagination.tsx
│   │   └── table.tsx
│   ├── pos/                    # POS components
│   │   ├── POSClient.tsx       # Main POS client component
│   │   ├── ProductGrid.tsx     # Product selection grid
│   │   └── CartPanel.tsx       # Shopping cart panel
│   ├── sales/                  # Sales components
│   │   ├── SalesStatsCards.tsx  # Sales statistics cards
│   │   ├── SalesTable.tsx      # Sales history table
│   │   ├── ViewSaleDialog.tsx  # View sale details
│   │   ├── EditSaleDialog.tsx  # Edit past sale
│   │   └── DeleteSaleDialog.tsx# Delete sale confirmation
│   ├── AddBookForm.tsx         # Add book dialog
│   ├── BookTable.tsx           # Inventory table
│   ├── DeleteBookDialog.tsx    # Delete confirmation
│   ├── EditBookDialog.tsx      # Edit book dialog
│   ├── Footer.tsx              # Footer component
│   ├── LoginForm.tsx           # Login form
│   ├── Logo.tsx                # App logo component
│   ├── Navigation.tsx          # Top navigation bar
│   └── StatsCards.tsx          # Dashboard statistics
├── lib/
│   ├── auth.ts                 # Session management
│   ├── prisma.ts               # Prisma client singleton
│   ├── uploadthing.ts          # Uploadthing client
│   └── utils.ts                # Utility functions (cn, formatters)
├── prisma/
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeder
│   └── migrations/             # Database migrations
├── Dockerfile                  # Multi-stage production build
├── docker-compose.yml          # Full stack (app + PostgreSQL)
├── docker-build.sh             # Docker build helper script
└── proxy.ts                    # Development proxy
```

## 🗃️ Database Schema

### Book Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Book title |
| author | String | Author name |
| isbn | String | Unique ISBN |
| price | Float | Book price (PHP) |
| stock | Int | Current stock level |
| genre | String | Book genre |
| imgUrl | String? | Cover image URL |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

### Sale Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| totalAmount | Float | Total sale amount |
| paymentMethod | String | Payment type (CASH) |
| createdAt | DateTime | Transaction timestamp |
| items | SaleItem[] | Sale line items |

### SaleItem Model

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| saleId | UUID | Foreign key to Sale |
| bookId | UUID | Foreign key to Book |
| quantity | Int | Quantity sold |
| priceAtSale | Float | Price at time of sale |

## 🔌 Server Actions API

### Book Actions (`app/actions.ts`)

| Action | Description |
|--------|-------------|
| `getBooks()` | Fetch all books |
| `addBook(data)` | Add a new book |
| `updateBook(id, data)` | Update book details |
| `updateStock(id, stock)` | Update stock level |
| `deleteBook(id)` | Delete a book |
| `forceDeleteBook(id)` | Delete book & related sales |
| `checkBookSales(id)` | Check if book has sales |
| `getInventoryStats()` | Get dashboard statistics |

### POS Actions (`app/actions/pos.ts`)

| Action | Description |
|--------|-------------|
| `getBooksForPOS(search?)` | Get available books |
| `processSale(items)` | Process a sale transaction |
| `getRecentSales(limit)` | Get recent transactions |

### Sales Actions (`app/actions/sales.ts`)

| Action | Description |
|--------|-------------|
| `getSales()` | Fetch all sales |
| `getSaleById(id)` | Get sale details |
| `updateSaleItem(id, qty)` | Update item quantity |
| `removeSaleItem(id)` | Remove item from sale |
| `deleteSale(id)` | Delete entire sale |
| `getSalesStats()` | Get sales statistics |

### Auth Actions (`app/actions/auth.ts`)

| Action | Description |
|--------|-------------|
| `login(user, pass)` | Authenticate user |
| `logout()` | End session |
| `getCurrentUser()` | Get current session |

## � Docker

### Architecture

The Docker setup uses a **multi-stage build** for minimal production images:

1. **Builder stage**: Installs all dependencies, generates Prisma client, builds Next.js (standalone output)
2. **Production stage**: Copies only the built artifacts, uses `dumb-init` for proper signal handling

### Services (Docker Compose)

| Service | Image | Port |
|---------|-------|------|
| **app** | Custom (Dockerfile) | 3000 |
| **postgres** | postgres:16-alpine | 5432 |

Both services include health checks for reliability.

## 📝 Logging

All server actions include structured logging with timestamps:

```
[2026-02-26T11:00:47.428Z] [ACTION: getBooks] Fetching all books...
[2026-02-26T11:00:47.902Z] [ACTION: getBooks] Successfully fetched books | {"count":12}
```

## 🔒 Security Notes

- Session tokens are base64 encoded with server-side secret validation
- Passwords are not stored — validated against environment variables
- All routes except `/login` are protected by server-side session checks
- Uploadthing handles secure file uploads
- Standalone Next.js output minimizes the production surface area

## 📄 License

MIT

---