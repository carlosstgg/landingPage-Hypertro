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

            {/* Newsletter/CTA */}
            <div className="col-span-1 md:col-span-1">
                 <h4 className="text-white font-bold uppercase tracking-wider mb-6 text-sm">{t('join')}</h4>
                 <p className="text-xs mb-4">{t('newsletter_desc')}</p>
                 <div className="flex">
                     <input type="email" placeholder={t('email_placeholder')} className="bg-gray-900 border border-gray-800 text-white px-4 py-2 text-sm rounded-l-md focus:outline-none focus:border-primary w-full" />
                     <button className="bg-primary text-black font-bold px-4 py-2 text-sm rounded-r-md hover:bg-white transition-colors">IR</button>
                 </div>
            </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/5 text-center text-xs">
            {t('rights')}
        </div>
    </footer>
  );
}
