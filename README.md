# BookStore Inventory System

A modern bookstore inventory management system built with Next.js 14, TypeScript, PostgreSQL, and Tailwind CSS.

## Features

- 📚 **Complete Book Management**: Add, update, and delete books from your inventory
- 📊 **Real-time Statistics**: Track total books, low stock alerts, and inventory value
- 🎨 **Dark Mode UI**: Beautiful, modern dark theme with Shadcn-style components
- ⚡ **Server Actions**: Type-safe server mutations with automatic revalidation
- 🗃️ **PostgreSQL Database**: Robust data persistence with Prisma ORM

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (Strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **UI Components**: Custom Shadcn-style components

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and update with your database credentials:

```bash
cp env.example .env
```

Edit `.env` with your PostgreSQL connection string:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

### 3. Set Up Database

Generate Prisma client and push the schema to your database:

```bash
npm run db:generate
npm run db:push
```

### 4. (Optional) Seed Sample Data

```bash
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:seed` | Seed database with sample data |

## Project Structure

```
├── app/
│   ├── actions.ts        # Server Actions for database mutations
│   ├── globals.css       # Global styles with CSS variables
│   ├── layout.tsx        # Root layout with dark mode
│   └── page.tsx          # Main dashboard page
├── components/
│   ├── ui/               # Shadcn-style UI primitives
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── table.tsx
│   ├── AddBookForm.tsx   # Form to add new books
│   ├── BookTable.tsx     # Table displaying inventory
│   └── StatsCards.tsx    # Dashboard statistics cards
├── lib/
│   ├── prisma.ts         # Prisma client singleton
│   └── utils.ts          # Utility functions
└── prisma/
    ├── schema.prisma     # Database schema
    └── seed.ts           # Database seeder
```

## Database Schema

The `Book` model includes:

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| title | String | Book title |
| author | String | Author name |
| isbn | String | Unique ISBN |
| price | Float | Book price |
| stock | Int | Current stock level |
| genre | String | Book genre |
| createdAt | DateTime | Creation timestamp |
| updatedAt | DateTime | Last update timestamp |

## API (Server Actions)

- `getBooks()` - Fetch all books ordered by creation date
- `addBook(data)` - Add a new book with validation
- `updateStock(id, newStock)` - Update inventory count
- `deleteBook(id)` - Remove a book from inventory
- `getInventoryStats()` - Get dashboard statistics

## License

MIT

