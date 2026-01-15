import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslations } from 'next-intl';

export default function TermsPage() {
  const t = useTranslations('Terms');

  return (
    <main className="min-h-screen bg-background text-foreground font-inter selection:bg-primary selection:text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-5xl md:text-7xl font-teko uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{t('title')}</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">{t('last_updated')}</p>
            <p>{t('intro')}</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section1.title')}</h2>
            <p>{t('Section1.content')}</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section2.title')}</h2>
            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-white mb-4 flex items-start gap-4">
                 <div className="text-3xl">⚠️</div>
                 <div>
                    <strong className="text-red-400 block mb-2">{t('Section2.warning')}</strong>
                    {t('Section2.content')}
                 </div>
            </div>
            <p>{t('Section2.risk')}</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section3.title')}</h2>
            <p>{t('Section3.content1')}</p>
            <p className="mt-2 text-gray-400">{t('Section3.content2')}</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section4.title')}</h2>
            <p>{t('Section4.content')}</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section5.title')}</h2>
            <p>{t('Section5.content')}</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section6.title')}</h2>
            <p>{t('Section6.content')}</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">{t('Section7.title')}</h2>
            <p>{t('Section7.content')}</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
