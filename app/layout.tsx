import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "CipherDrill",
  description: "Mechanism-first cybersecurity exam practice."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <div className="min-h-screen bg-background">
            <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
              <div className="container flex h-16 items-center justify-between gap-4">
                <Link href="/" className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-md border border-primary/40 bg-primary/10 font-semibold text-primary">
                    C
                  </div>
                  <div>
                    <div className="text-sm font-semibold leading-4">CipherDrill</div>
                    <div className="text-xs text-muted-foreground">final exam practice</div>
                  </div>
                </Link>
                <nav className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/">Dashboard</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href="/analytics">Analytics</Link>
                  </Button>
                  <ThemeToggle />
                </nav>
              </div>
            </header>
            <main className="container py-6">{children}</main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
