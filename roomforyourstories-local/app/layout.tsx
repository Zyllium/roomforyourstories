import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "My Voice — Share your story",
  description: "Share a story with the You Are Heard community.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
