'use client';
import { motion } from "framer-motion";
import { Zap, Crown, Target, Star } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Gamification() {
  const t = useTranslations('Gamification');

  return (
    <section id="gamification" className="py-32 relative overflow-hidden bg-black">
      {/* Background accents */}
      <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           whileInView={{ opacity: 1, x: 0 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
        >
             <h2 className="text-secondary text-xl font-bold tracking-widest mb-2">{t('rpg_system').toUpperCase()}</h2>
             <h3 className="text-5xl md:text-7xl font-teko uppercase text-white mb-6 leading-[0.9]">
               {t('title')}<br/> <span className="text-gray-500">{t('title_suffix')}</span>
             </h3>
             <p className="text-gray-400 text-lg mb-10 leading-relaxed font-inter">
               {t('description')}
             </p>
             
             {/* Progress Visualization */}
             <div className="space-y-4">
                 <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                     <div className="absolute top-0 left-0 h-full w-2/3 bg-gradient-to-r from-primary to-secondary"></div>
                 </div>
                 <div className="flex justify-between text-xs uppercase tracking-widest text-gray-500 font-bold">
                     <span className="flex items-center gap-2"><div className="w-2 h-2 bg-gray-600 rounded-full"></div> {t('ranks.recruit')}</span>
                     <span className="flex items-center gap-2 text-primary"><div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div> {t('ranks.veteran')}</span>
                     <span className="flex items-center gap-2 text-secondary"><div className="w-2 h-2 bg-secondary rounded-full"></div> {t('ranks.legend')}</span>
                 </div>
             </div>
        </motion.div>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           whileInView={{ opacity: 1, scale: 1 }}
           viewport={{ once: true }}
           transition={{ duration: 0.6 }}
           className="relative"
        >
            <div className="absolute inset-0 bg-secondary/10 blur-[100px] rounded-full"></div>
            
            {/* Notification Card */}
            <div className="relative z-10 bg-[#0A0A0A] border border-white/10 p-8 rounded-3xl transform rotate-3 hover:rotate-0 transition-transform duration-500 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 uppercase text-xs tracking-widest font-bold">{t('unlock')}</span>
                    <span className="text-xs text-gray-600">{t('just_now')}</span>
                </div>
                <div className="flex gap-5 items-center">
                   <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-yellow-800 rounded-2xl flex items-center justify-center text-white shadow-lg border border-yellow-500/30">
                      <Crown size={32} />
                   </div>
                   <div>
                       <h4 className="text-white font-bold text-xl font-teko tracking-wide">{t('achievement_title').toUpperCase()}</h4>
                       <p className="text-gray-400 text-sm">{t('achievement_desc')}</p>
                       <div className="mt-2 text-secondary text-xs font-bold">+5000 XP</div>
                   </div>
                </div>
            </div>

             {/* Secondary Card floating */}
             <div className="relative z-0 -mt-10 mx-auto w-[90%] bg-[#0F0F0F] border border-white/5 p-6 rounded-b-3xl opacity-80 scale-95">
                <div className="flex gap-4 items-center pl-4">
                     <Target size={20} className="text-primary" />
                     <span className="text-gray-400 text-sm">{t('weekly_goal')}: 4/5 Sesiones</span>
                </div>
             </div>

        </motion.div>
      </div>
    </section>
  );
}

