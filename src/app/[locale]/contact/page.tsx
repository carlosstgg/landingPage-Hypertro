import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function ContactPage() {
  const t = useTranslations('Contact');
  return (
    <main className="min-h-screen bg-background text-foreground font-inter selection:bg-primary selection:text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24 text-center">
        <h1 className="text-5xl md:text-7xl font-teko uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
          {t('title')}
        </h1>
        <p className="text-xl text-gray-300 mb-12">
          {t('subtitle')}
        </p>
        
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8 max-w-lg mx-auto backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4">
                <div className="p-4 bg-primary/10 rounded-full text-primary ring-1 ring-primary/20">
                    <Mail size={48} />
                </div>
                <h2 className="text-2xl font-teko font-bold text-white uppercase">{t('card_title')}</h2>
                <p className="text-gray-400 text-sm">{t('card_desc')}</p>
                <a href="mailto:hypertroapp@gmail.com" className="text-2xl md:text-3xl font-bold text-white hover:text-primary transition-colors border-b-2 border-primary/50 hover:border-primary pb-1">
                    hypertroapp@gmail.com
                </a>
            </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}

