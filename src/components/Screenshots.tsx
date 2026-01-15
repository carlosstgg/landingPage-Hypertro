'use client';
import { motion } from "framer-motion";
import Image from 'next/image';

const screenshots = [
  { src: "/1000384034.jpg", label: "Tu Perfil", description: "Estadísticas de constancia y volumen" },
  { src: "/1000384038.jpg", label: "Próxima Sesión", description: "Vista rápida de tu entrenamiento del día" },
  { src: "/1000384040.jpg", label: "Registro de Ejercicio", description: "Captura cada serie con precisión" },
  { src: "/1000384042.jpg", label: "Entrenamiento Completado", description: "Celebra tu progreso con XP" },
  { src: "/1000384046.jpg", label: "Tu Legado", description: "Comparte tus logros con el mundo" },
];

export default function Screenshots() {
  return (
    <section id="screenshots" className="py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-16">
         <motion.div 
           initial={{ opacity: 0 }} 
           whileInView={{ opacity: 1 }}
           viewport={{ once: true }}
         >
            <h2 className="text-primary text-xl font-bold tracking-widest mb-2">GALERÍA</h2>
            <h3 className="text-5xl md:text-7xl font-teko uppercase text-white">Diseñada para Ganar</h3>
         </motion.div>
      </div>

      {/* Scrolling Screenshot Gallery */}
      <div className="relative">
        <div className="flex gap-6 overflow-x-auto pb-8 px-6 snap-x snap-mandatory scrollbar-hide">
          {screenshots.map((shot, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex-shrink-0 snap-center group"
            >
              <div className="relative w-[240px] md:w-[280px] aspect-[9/19.5] rounded-3xl border-4 border-gray-800 bg-black overflow-hidden shadow-xl transition-all group-hover:scale-105 group-hover:shadow-[0_0_40px_rgba(0,255,136,0.2)]">
                <Image 
                  src={shot.src} 
                  alt={shot.label} 
                  fill 
                  className="object-cover object-top"
                />
              </div>
              <div className="mt-4 text-center">
                <h4 className="text-white font-teko text-2xl uppercase">{shot.label}</h4>
                <p className="text-gray-500 text-sm font-inter">{shot.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Gradient Fades */}
        <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-background to-transparent pointer-events-none z-10"></div>
        <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-background to-transparent pointer-events-none z-10"></div>
      </div>
    </section>
  );
}
