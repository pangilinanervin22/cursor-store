import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Prices in Philippine Peso (PHP)
const sampleBooks = [
  {
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    isbn: "978-0743273565",
    price: 599.00,
    stock: 25,
    genre: "Classic Fiction",
    imgUrl: null,
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    isbn: "978-0061120084",
    price: 499.00,
    stock: 3,
    genre: "Classic Fiction",
    imgUrl: null,
  },
  {
    title: "1984",
    author: "George Orwell",
    isbn: "978-0451524935",
    price: 449.00,
    stock: 18,
    genre: "Dystopian",
    imgUrl: null,
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    isbn: "978-0141439518",
    price: 399.00,
    stock: 2,
    genre: "Romance",
    imgUrl: null,
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    isbn: "978-0316769488",
    price: 549.00,
    stock: 12,
    genre: "Coming-of-Age",
    imgUrl: null,
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    price: 1899.00,
    stock: 8,
    genre: "Technology",
    imgUrl: null,
  },
  {
    title: "The Pragmatic Programmer",
    author: "David Thomas & Andrew Hunt",
    isbn: "978-0135957059",
    price: 2499.00,
    stock: 4,
    genre: "Technology",
    imgUrl: null,
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    isbn: "978-0441172719",
    price: 749.00,
    stock: 0,
    genre: "Science Fiction",
    imgUrl: null,
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  for (const book of sampleBooks) {
    await prisma.book.upsert({
      where: { isbn: book.isbn },
      update: book,
      create: book,
    });
  }

  console.log("✅ Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
