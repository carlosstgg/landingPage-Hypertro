import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const teko = Teko({
  variable: "--font-teko",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "HYPERTRO | Evolución de tu Entrenamiento",
  description: "Construye tu legado. Entrena, sube de nivel y domina tu físico con HYPERTRO.",
  keywords: ["fitness", "gamification", "workout", "gym", "rpg", "hypertrophy", "training"],
  authors: [{ name: "Hypertro Team" }],
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "HYPERTRO | Evolución de tu Entrenamiento",
    description: "Construye tu legado. Entrena, sube de nivel y domina tu físico.",
    type: "website",
    locale: "es_ES",
    images: ["/logo.png"],
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${teko.variable} bg-background text-foreground antialiased selection:bg-primary selection:text-black`}
      >
        {children}
      </body>
    </html>
  );
}
