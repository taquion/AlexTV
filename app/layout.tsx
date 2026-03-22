import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlexTV",
  description: "Your memories, on the big screen",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-surface text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}
