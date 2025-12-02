# 📚 BookStore Inventory & POS System

A modern, full-featured bookstore management system built with Next.js 14, TypeScript, PostgreSQL, and Tailwind CSS. Features complete inventory management, point-of-sale, and sales tracking.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=flat-square&logo=tailwind-css)

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
- **Protected Routes**: Middleware-based route protection

### 🎨 User Interface
- **Dark Mode**: Beautiful, modern dark theme
- **Responsive Design**: Works on desktop and tablet
- **Client-side Pagination**: Fast navigation through large datasets
- **Custom Scrollbars**: Themed scrollbars matching the dark UI

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript (Strict mode) |
| **Database** | PostgreSQL + Prisma ORM |
| **Styling** | Tailwind CSS |
| **UI Components** | Custom Shadcn-style components |
| **File Uploads** | Uploadthing |
| **Authentication** | Custom session-based auth |

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL database
- Uploadthing account (for image uploads)
- npm, yarn, or pnpm

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone <repository-url>
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
│   ├── sales/
│   │   └── page.tsx            # Sales History page
│   ├── globals.css             # Global styles & CSS variables
│   ├── layout.tsx              # Root layout with dark mode
│   └── page.tsx                # Inventory Dashboard
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
│   │   ├── POSClient.tsx
│   │   ├── ProductGrid.tsx
│   │   └── CartPanel.tsx
│   ├── sales/                  # Sales components
│   │   ├── SalesStatsCards.tsx
│   │   ├── SalesTable.tsx
│   │   ├── ViewSaleDialog.tsx
│   │   ├── EditSaleDialog.tsx
│   │   └── DeleteSaleDialog.tsx
│   ├── AddBookForm.tsx         # Add book dialog
│   ├── BookTable.tsx           # Inventory table
│   ├── EditBookDialog.tsx      # Edit book dialog
│   ├── DeleteBookDialog.tsx    # Delete confirmation
│   ├── LoginForm.tsx           # Login form
│   ├── Navigation.tsx          # Top navigation bar
│   ├── Footer.tsx              # Footer component
│   └── StatsCards.tsx          # Dashboard statistics
├── lib/
│   ├── auth.ts                 # Session management
│   ├── prisma.ts               # Prisma client singleton
│   ├── uploadthing.ts          # Uploadthing client
│   └── utils.ts                # Utility functions
├── hooks/
│   └── usePagination.ts        # Pagination hook
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── seed.ts                 # Database seeder
└── middleware.ts               # Auth middleware
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

## 📝 Logging

All server actions include structured logging with timestamps:

```
[2025-12-02T11:00:47.428Z] [ACTION: getBooks] Fetching all books...
[2025-12-02T11:00:47.902Z] [ACTION: getBooks] Successfully fetched books | {"count":12}
```

## 🔒 Security Notes

- Session tokens are base64 encoded with server-side secret validation
- Passwords are not stored - validated against environment variables
- All routes except `/login` are protected by middleware
- Uploadthing handles secure file uploads

## 📄 License

MIT

---

Built with ❤️ using Next.js and TypeScript
