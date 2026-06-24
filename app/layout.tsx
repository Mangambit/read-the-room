import type { Metadata } from "next";
import { Schibsted_Grotesk, Atkinson_Hyperlegible } from "next/font/google";
import "./globals.css";

const schibsted = Schibsted_Grotesk({
  subsets: ["latin"],
  variable: "--font-schibsted",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Read the Room — understand what they really mean",
  description:
    "Paste a confusing message and Read the Room tells you what they really mean, how they feel, what they want, and drafts your reply. Built for neurodivergent minds; useful for everyone.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${schibsted.variable} ${atkinson.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
