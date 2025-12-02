"use client";

import * as React from "react";

export function Footer() {
  const [year, setYear] = React.useState<number | null>(null);

  React.useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-muted-foreground">
          BookStore Inventory System &copy; {year ?? "2024"}
        </p>
      </div>
    </footer>
  );
}

