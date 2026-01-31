import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "A Real Sport",
  description: "FPL Draft League",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main className="max-w-screen overflow-hidden flex min-h-screen justify-center p-2 bg-zinc-50">
            <div className="flex flex-col w-full md:w-4/5">{children}</div>
          </main>
        </Providers>
      </body>
    </html>
  );
}
