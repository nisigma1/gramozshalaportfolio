import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "Gramoz Shala — Electronics, Automation & Robotics";
const description =
  "Portfolio of Gramoz Shala, an Electrical and Computer Engineering student focused on electronics, automation, robotics, technology, and innovation.";

export const metadata: Metadata = {
  metadataBase: new URL("https://gramozshala.com"),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "profile",
    title,
    description,
    url: "/",
    siteName: "Gramoz Shala",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "Gramoz Shala — Electronics, Automation & Robotics",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark light",
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0A0B" },
    { media: "(prefers-color-scheme: light)", color: "#F5F4F0" },
  ],
};

const themeScript = `
  (() => {
    try {
      const saved = localStorage.getItem("gramoz-theme");
      document.documentElement.dataset.theme =
        saved === "light" || saved === "dark" ? saved : "dark";
    } catch {
      document.documentElement.dataset.theme = "dark";
    }
  })();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="preload"
          as="font"
          href="/fonts/geist-latin.woff2"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
