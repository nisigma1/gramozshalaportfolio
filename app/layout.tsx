import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const forwardedProtocol = headerStore.get("x-forwarded-proto");
  const protocol =
    forwardedProtocol ??
    (host?.startsWith("localhost") || host?.startsWith("127.0.0.1")
      ? "http"
      : "https");
  const origin = host ? `${protocol}://${host}` : "http://localhost:3000";
  const title = "Gramoz Shala — Electronics, Automation & Robotics";
  const description =
    "Portfolio of Gramoz Shala, an Electrical and Computer Engineering student focused on electronics, automation, robotics, technology, and innovation.";

  return {
    metadataBase: new URL(origin),
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
}

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
      const systemLight = window.matchMedia("(prefers-color-scheme: light)").matches;
      document.documentElement.dataset.theme =
        saved === "light" || saved === "dark" ? saved : systemLight ? "light" : "dark";
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
          as="image"
          href="/images/gramoz-shala.jpg"
          fetchPriority="high"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
