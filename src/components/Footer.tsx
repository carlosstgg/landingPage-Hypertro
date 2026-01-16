'use client';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Instagram, Twitter, Mail } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Footer() {
  const t = useTranslations('Footer');

  return (
    <footer className="py-16 bg-black border-t border-white/5 text-gray-500 font-inter relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand */}
            <div className="col-span-1 md:col-span-1">
                <div className="flex items-center gap-3 mb-4">
                   <Image src="/logo.png" alt="HYPERTRO Logo" width={36} height={36} />
                   <span className="text-2xl font-bold font-teko text-white tracking-widest">HYPERTRO</span>
                </div>
                <p className="text-sm leading-relaxed mb-6">
                    {t('description')}
                </p>
                <div className="flex gap-4">
                    <a href="https://www.instagram.com/hypertroapp/" className="hover:text-primary transition-colors"><Instagram size={20} /></a>
                </div>
            </div>

            {/* Links */}
            <div className="col-span-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t('product')}</h4>
                <ul className="space-y-4 text-sm">
                    <li><Link href="#features" className="hover:text-primary transition-colors">Features</Link></li>
                    <li><Link href="#gamification" className="hover:text-primary transition-colors">Gamificación</Link></li>
                </ul>
            </div>
            
            {/* Legal */}
            <div className="col-span-1">
                <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t('legal')}</h4>
                <ul className="space-y-4 text-sm">
                    <li><Link href="/privacy" className="hover:text-primary transition-colors">{t('privacy')}</Link></li>
                    <li><Link href="/terms" className="hover:text-primary transition-colors">{t('terms')}</Link></li>
                    <li><Link href="/contact" className="hover:text-primary transition-colors">{t('contact')}</Link></li>
                </ul>
            </div>

            {/* Coming Soon */}
            <div className="col-span-1 md:col-span-1">
                 <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t('coming_soon_title')}</h4>
                 <p className="text-xs mb-4">{t('coming_soon_desc')}</p>
                 <div className="flex flex-col gap-3">
                   <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-400 font-bold px-6 py-3 text-sm rounded-lg w-fit">
                     <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                       <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.199l2.807 1.626a1 1 0 0 1 0 1.732l-2.807 1.626L15.206 12l2.492-2.492zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                     </svg>
                     Google Play
                   </div>
                   <div className="inline-flex items-center gap-2 bg-gray-800 text-gray-400 font-bold px-6 py-3 text-sm rounded-lg w-fit">
                     <svg className="w-5 h-5" viewBox="0 0 384 512" fill="currentColor">
                       <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 52.3-11.4 69.5-34.3z"/>
                     </svg>
                     App Store
                   </div>
                 </div>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-xs">
            {t('rights')}
        </div>
    </footer>
  );
}
