'use client';
import { motion } from "framer-motion";
import { Link, usePathname, useRouter } from '@/i18n/routing';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { startTransition } from 'react';

export default function Navbar() {
  const t = useTranslations('Navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    startTransition(() => {
        router.replace(pathname, {locale: newLocale});
    });
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 w-full z-50 glass-nav px-6 py-4 flex justify-between items-center"
    >
      <Link href="/" className="flex items-center gap-3 group">
        <Image src="/logo.png" alt="HYPERTRO Logo" width={40} height={40} className="group-hover:scale-110 transition-transform" />
        <span className="text-2xl font-bold font-teko text-primary tracking-widest hidden sm:inline">HYPERTRO</span>
      </Link>
      
      <div className="hidden md:flex items-center gap-8 font-inter text-sm tracking-wide text-gray-300">
        <Link href="#features" className="hover:text-primary transition-colors uppercase">{t('features')}</Link>
        <Link href="#gamification" className="hover:text-primary transition-colors uppercase">{t('ranks')}</Link>
        <Link href="#waitlist" className="hover:text-primary transition-colors uppercase">{t('waitlist')}</Link>
        
        {/* Language Switcher */}
        <div className="flex gap-2 ml-4 border-l border-white/10 pl-4">
            <button 
                onClick={() => handleLanguageChange('es')} 
                className={`font-teko text-lg ${locale === 'es' ? 'text-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
            >
                ES
            </button>
            <span className="text-gray-700">|</span>
             <button 
                onClick={() => handleLanguageChange('en')} 
                className={`font-teko text-lg ${locale === 'en' ? 'text-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
            >
                EN
            </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
          <div className="md:hidden flex gap-2 mr-2">
            <button 
                onClick={() => handleLanguageChange('es')} 
                className={`font-teko text-lg ${locale === 'es' ? 'text-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
            >
                ES
            </button>
            <span className="text-gray-700">|</span>
             <button 
                onClick={() => handleLanguageChange('en')} 
                className={`font-teko text-lg ${locale === 'en' ? 'text-primary' : 'text-gray-500 hover:text-white'} transition-colors`}
            >
                EN
            </button>
          </div>

          <Link href="#waitlist">
            <button className="bg-primary hover:bg-primary/90 text-black font-bold font-teko text-lg px-6 py-1 rounded-sm transition-all transform hover:skew-x-[-10deg]">
              {t('join').toUpperCase()}
            </button>
          </Link>
      </div>
    </motion.nav>
  );
}
