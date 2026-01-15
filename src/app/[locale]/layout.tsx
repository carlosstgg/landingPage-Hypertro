import {NextIntlClientProvider} from 'next-intl';
import {getMessages} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import type { Metadata } from "next";
import { Inter, Teko } from "next/font/google";
import "../globals.css";

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

export default async function RootLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  
  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }
 
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
 
  return (
    <html lang={locale}>
      <body
        className={`${inter.variable} ${teko.variable} bg-background text-foreground antialiased selection:bg-primary selection:text-black`}
      >
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
