'use client';
import { motion } from "framer-motion";
import { Sparkles, WifiOff, BarChart3, Trophy, Share2, Timer } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Features() {
  const t = useTranslations('Features');

  const features = [
    {
      title: t('items.smart_trainer.title'),
      description: t('items.smart_trainer.description'),
      icon: <Sparkles size={32} className="text-primary" />,
      colSpan: "col-span-1 md:col-span-2",
    },
    {
      title: t('items.offline_mode.title'),
      description: t('items.offline_mode.description'),
      icon: <WifiOff size={32} className="text-cyan-400" />,
      colSpan: "col-span-1",
    },
    {
      title: t('items.advanced_stats.title'),
      description: t('items.advanced_stats.description'),
      icon: <BarChart3 size={32} className="text-violet-400" />,
      colSpan: "col-span-1",
    },
    {
      title: t('items.gamification.title'),
      description: t('items.gamification.description'),
      icon: <Trophy size={32} className="text-amber-400" />,
      colSpan: "col-span-1 md:col-span-2",
    },
    {
      title: t('items.share_style.title'),
      description: t('items.share_style.description'),
      icon: <Share2 size={32} className="text-pink-400" />,
      colSpan: "col-span-1",
    },
    {
      title: t('items.timers.title'),
      description: t('items.timers.description'),
      icon: <Timer size={32} className="text-orange-400" />,
      colSpan: "col-span-1 md:col-span-2",
    },
  ];

  return (
    <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
       <motion.div 
         initial={{ opacity: 0 }} 
         whileInView={{ opacity: 1 }}
         viewport={{ once: true }}
         className="mb-16"
       >
          <h2 className="text-primary text-xl font-bold tracking-widest mb-2">{t('title').toUpperCase()}</h2>
          <h3 className="text-5xl md:text-7xl font-teko uppercase text-white">{t('subtitle')}</h3>
       </motion.div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
             <motion.div
               key={i}
               className={`${feature.colSpan} p-8 md:p-10 rounded-3xl bg-[#0F0F0F] border border-white/5 hover:border-primary/50 transition-all duration-300 group relative overflow-hidden`}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               transition={{ delay: i * 0.1 }}
             >
                {/* Glow Effect */}
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 blur-[80px] rounded-full group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="relative z-10 font-inter h-full flex flex-col justify-between">
                   <div>
                       <div className="mb-6 p-4 bg-black/50 w-fit rounded-2xl border border-white/10 group-hover:scale-110 group-hover:border-primary/30 transition-all duration-300 shadow-lg">
                          {feature.icon}
                       </div>
                       <h4 className="text-3xl font-teko uppercase text-white mb-2 group-hover:text-primary transition-colors">{feature.title}</h4>
                   </div>
                   <p className="text-gray-400 leading-relaxed text-sm md:text-base">{feature.description}</p>
                </div>
             </motion.div>
          ))}
       </div>
    </section>
  );
}
