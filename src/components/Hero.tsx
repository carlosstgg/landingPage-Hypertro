'use client';
import { useState } from 'react';
import { motion } from "framer-motion";
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';

export default function Hero() {
  const t = useTranslations('Hero');
  
  const screenshots = [
    { src: "/1000384038.jpg", label: t('screenshots.next_session') },
    { src: "/1000384034.jpg", label: t('screenshots.profile') },
    { src: "/1000384040.jpg", label: t('screenshots.log') },
    { src: "/1000384042.jpg", label: t('screenshots.completed') },
    { src: "/1000384046.jpg", label: t('screenshots.legacy') },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % screenshots.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + screenshots.length) % screenshots.length);
  };

  // Calculate position for each item relative to current center
  const getPosition = (index: number) => {
    const diff = index - currentIndex;
    // Normalize to handle wrap-around
    let normalizedDiff = diff;
    if (diff > screenshots.length / 2) normalizedDiff = diff - screenshots.length;
    if (diff < -screenshots.length / 2) normalizedDiff = diff + screenshots.length;
    return normalizedDiff;
  };

  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center pt-32 pb-12 overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[128px]" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-secondary/10 rounded-full blur-[128px]" />
      
      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" style={{ opacity: 0.1 }}></div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-5xl px-4 flex flex-col items-center"
      >
        <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-teko uppercase font-bold leading-[0.9] mb-8 tracking-tight">
          <span className="block text-white">{t('title_prefix')}</span>
          <span className="block relative mt-1">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary">
              {t('title_highlight')}
            </span>
            <span 
              className="absolute inset-0 text-primary blur-2xl opacity-30 select-none -z-10" 
              aria-hidden="true"
            >
              {t('title_highlight')}
            </span>
          </span>
        </h1>
        
        <p className="text-gray-400 text-base sm:text-lg md:text-xl font-inter max-w-2xl mx-auto mb-10 leading-relaxed">
          {t('subtitle')}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-lg">
            {/* App Store Badge */}
            <button className="flex items-center gap-3 bg-white text-black px-6 py-3 rounded-xl hover:scale-105 transition-transform w-full sm:w-auto justify-center group relative overflow-hidden border border-transparent hover:border-primary/30">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <div className="text-left">
                    <div className="text-[10px] uppercase font-semibold tracking-wider opacity-70 leading-tight">{t('coming_soon')}</div>
                    <div className="text-xl font-semibold leading-tight -mt-0.5">{t('app_store')}</div>
                </div>
            </button>

            {/* Google Play Badge */}
            <button className="flex items-center gap-3 bg-black border border-white/30 text-white px-6 py-3 rounded-xl hover:scale-105 transition-transform w-full sm:w-auto justify-center group relative overflow-hidden hover:border-primary/50">
                <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-5 transition-opacity"></div>
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 0 1-.61-.92V2.734a1 1 0 0 1 .609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 0 1 0 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.8 8.99l-2.302 2.302-8.634-8.634z"/>
                </svg>
                <div className="text-left">
                    <div className="text-[10px] uppercase font-semibold tracking-wider opacity-70 leading-tight">{t('coming_soon')}</div>
                    <div className="text-xl font-semibold leading-tight -mt-0.5">{t('google_play')}</div>
                </div>
            </button>
        </div>
      </motion.div>

      {/* Orbiting Carousel */}
      <motion.div 
         initial={{ opacity: 0, y: 50 }}
         animate={{ opacity: 1, y: 0 }}
         transition={{ delay: 0.3, duration: 1, type: "spring" }}
         className="mt-16 relative z-10 flex flex-col items-center"
      >
        {/* Carousel Container */}
        <div 
          className="relative h-[480px] md:h-[580px] w-full max-w-5xl flex items-center justify-center overflow-visible"
          style={{ perspective: '1200px' }}
        >
          {screenshots.map((screenshot, index) => {
            const position = getPosition(index);
            const isCenter = position === 0;
            const isVisible = Math.abs(position) <= 2;
            
            if (!isVisible) return null;

            // Calculate transforms based on position
            const xOffset = position * 200; // Horizontal spacing
            const zOffset = -Math.abs(position) * 150; // Depth
            const rotateY = position * -25; // Rotation angle
            const scale = isCenter ? 1 : 0.75 - Math.abs(position) * 0.1;
            const opacity = isCenter ? 1 : 0.6 - Math.abs(position) * 0.15;

            return (
              <motion.div
                key={index}
                initial={false}
                animate={{
                  x: xOffset,
                  z: zOffset,
                  rotateY: rotateY,
                  scale: scale,
                  opacity: opacity,
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 80,
                  damping: 20,
                  mass: 0.8,
                }}
                className="absolute"
                style={{ 
                  transformStyle: 'preserve-3d',
                  zIndex: isCenter ? 10 : 5 - Math.abs(position),
                }}
              >
                <div 
                  className={`relative w-[200px] md:w-[260px] aspect-[9/19] rounded-3xl overflow-hidden ${
                    isCenter 
                      ? 'shadow-[0_0_60px_rgba(0,255,136,0.3),0_0_100px_rgba(0,255,136,0.15)] ring-2 ring-primary/30' 
                      : 'shadow-2xl'
                  }`}
                >
                  <Image 
                    src={screenshot.src} 
                    alt={screenshot.label} 
                    fill 
                    className="object-cover object-top"
                    priority={isCenter}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Carousel Controls */}
        <div className="flex items-center gap-8 mt-4">
          {/* Previous Button */}
          <button 
            onClick={prevSlide}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 hover:scale-110 transition-all active:scale-95"
          >
            <ChevronLeft size={28} className="text-white" />
          </button>

          {/* Dots indicator */}
          <div className="flex gap-2">
            {screenshots.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all duration-500 ${
                  index === currentIndex 
                    ? 'bg-primary w-8' 
                    : 'bg-white/30 hover:bg-white/50 w-2'
                }`}
              />
            ))}
          </div>

          {/* Next Button */}
          <button 
            onClick={nextSlide}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary/50 hover:scale-110 transition-all active:scale-95"
          >
            <ChevronRight size={28} className="text-white" />
          </button>
        </div>

        {/* Current screen label */}
        <motion.p 
          key={currentIndex}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 text-white text-xl font-teko uppercase tracking-widest"
        >
          {screenshots[currentIndex].label}
        </motion.p>
      </motion.div>
    </section>
  );
}
