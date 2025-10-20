import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "5:20 Habit Stack - 毎朝5:20起床習慣",
  description: "LLMによる習慣スタック提案で、毎朝5:20起床を実現",
  manifest: "/manifest.json",
  themeColor: "#f07020",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
