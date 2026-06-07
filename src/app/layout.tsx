import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MACO Creators",
  description: "Creator matching workspace for local business campaigns",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
