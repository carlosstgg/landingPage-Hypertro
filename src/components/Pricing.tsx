'use client';
import { motion } from "framer-motion";
import { Check, X, AlertTriangle, Lightbulb } from "lucide-react";
import { useTranslations } from 'next-intl';

export default function Pricing() {
  // Ideally we would use translations here, but for now we'll use the provided text directly
  // or we can add keys to the messages files. 
  // Given the specificity of the request, I will use the provided Spanish text directly in the code for the structure
  // and maybe later move to i18n if requested. 
  // However, to keep consistency with the project, I will try to use the keys if I add them.
  // Let's implement with hardcoded text first to match the screenshot exactly, as adding to i18n files requires multiple file edits.
  
  const features = [
    { name: "Registrar entrenamientos", free: true, pro: true },
    { name: "Temporizadores de descanso", free: true, pro: true },
    { name: "Generar rutinas automáticas", free: true, pro: true },
    { name: "Modo Offline completo", free: true, pro: true },
    { name: "Sistema de Logros", free: true, pro: true },
    { name: "Widgets en pantalla de inicio", free: true, pro: true },
    { name: "Notificaciones y recordatorios", free: true, pro: true },
    { 
      name: "Historial de entrenamientos", 
      free: { type: "warning", text: "Últimos 5" }, 
      pro: { type: "check", text: "Ilimitado" } 
    },
    { 
      name: "Rutinas guardadas", 
      free: { type: "warning", text: "Máximo 2" }, 
      pro: { type: "check", text: "Ilimitadas" } 
    },
    { name: "Elegir cualquier sesión libremente", free: false, pro: true },
    { name: "Estadísticas avanzadas", free: false, pro: true },
    { name: "Compartir progreso con fotos personalizadas", free: false, pro: true },
    { name: "Insignia PRO en tu perfil", free: false, pro: true },
    { name: "Sin anuncios", free: false, pro: true },
  ];

  const renderCell = (value: boolean | { type: string, text: string }) => {
    if (typeof value === 'boolean') {
      return value ? (
        <div className="flex justify-center"><div className="bg-emerald-500/20 p-1 rounded-md"><Check className="w-4 h-4 md:w-5 md:h-5 text-emerald-500" /></div></div>
      ) : (
        <div className="flex justify-center"><X className="w-5 h-5 md:w-6 md:h-6 text-red-500/50" /></div>
      );
    }
    
    if (value.type === 'warning') {
      return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-amber-500 text-xs md:text-sm font-medium text-center leading-tight">
          <AlertTriangle className="w-3 h-3 md:w-4 md:h-4 shrink-0" />
          <span>{value.text}</span>
        </div>
      );
    }
    
    if (value.type === 'check') {
      return (
        <div className="flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 text-emerald-500 text-xs md:text-sm font-medium text-center leading-tight">
          <div className="bg-emerald-500/20 p-0.5 md:p-1 rounded-md shrink-0"><Check className="w-3 h-3 md:w-4 md:h-4" /></div>
          <span>{value.text}</span>
        </div>
      );
    }
  };

  return (
    <section id="pricing" className="py-24 px-4 md:px-6 max-w-5xl mx-auto">
      <motion.div 
         initial={{ opacity: 0, y: 20 }} 
         whileInView={{ opacity: 1, y: 0 }}
         viewport={{ once: true }}
         className="mb-12"
      >
         <h2 className="text-3xl md:text-5xl font-teko uppercase text-white mb-8 text-center">
           Planes de <span className="text-primary">Hypertro</span>
         </h2>

         <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0F0F0F] shadow-2xl relative">
            {/* Glow Effect */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none"></div>

            {/* Header */}
            <div>
                <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 font-teko text-lg md:text-2xl tracking-wide">
                  <div className="col-span-6 py-4 px-2 md:p-6 text-white text-left pl-4 md:pl-8"></div>
                  <div className="col-span-3 py-4 px-2 md:p-6 text-center text-white flex items-center justify-center">FREE</div>
                  <div className="col-span-3 py-4 px-2 md:p-6 text-center text-white bg-primary/10 border-l border-white/5 relative flex items-center justify-center">
                    PRO
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
                  </div>
                </div>

                {/* Price Row */}
                <div className="grid grid-cols-12 border-b border-white/10 font-inter text-xs md:text-base">
                  <div className="col-span-6 py-4 px-2 md:p-6 text-gray-300 font-semibold pl-4 md:pl-8 flex items-center">Precio</div>
                  <div className="col-span-3 py-4 px-2 md:p-6 text-center text-gray-300 flex items-center justify-center">Gratis</div>
                  <div className="col-span-3 py-4 px-2 md:p-6 text-center text-primary font-bold bg-primary/5 border-l border-white/5 text-sm md:text-lg flex items-center justify-center">$2.50/m</div>
                </div>

                {/* Features */}
                <div className="divide-y divide-white/5">
                  {features.map((feature, i) => (
                    <div key={i} className="grid grid-cols-12 hover:bg-white/[0.02] transition-colors font-inter text-xs md:text-sm">
                      <div className="col-span-6 py-4 px-2 md:p-4 text-gray-400 pl-4 md:pl-8 flex items-center">
                        {feature.name}
                      </div>
                      <div className="col-span-3 py-4 px-1 md:p-4 flex items-center justify-center">
                        {renderCell(feature.free)}
                      </div>
                      <div className="col-span-3 py-4 px-1 md:p-4 flex items-center justify-center bg-primary/[0.02] border-l border-white/5">
                        {renderCell(feature.pro)}
                      </div>
                    </div>
                  ))}
                </div>
            </div>
         </div>

         <div className="mt-8 flex items-center justify-center gap-3 text-amber-200/80 text-sm md:text-base font-inter italic">
            <Lightbulb className="w-5 h-5 text-amber-400" />
            <p>Cancela en cualquier momento. Sin compromisos.</p>
         </div>
      </motion.div>
    </section>
  );
}
