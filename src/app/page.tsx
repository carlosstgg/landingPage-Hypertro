'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Gamification from "@/components/Gamification";
import Footer from "@/components/Footer";
import { Mail, Loader2, CheckCircle, Copy, Check, XCircle } from 'lucide-react';

export default function Home() {
  // Waitlist form states
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [copied, setCopied] = useState(false);
  
  // Spots tracking
  const [spotsLeft, setSpotsLeft] = useState<number | null>(null);
  const [isFull, setIsFull] = useState(false);

  // Fetch initial waitlist status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch('/api/waitlist');
        const data = await response.json();
        setSpotsLeft(data.spotsLeft);
        setIsFull(data.isFull);
      } catch (error) {
        console.error('Error fetching waitlist status:', error);
      }
    };
    fetchStatus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error);
        if (data.isFull) {
          setIsFull(true);
          setSpotsLeft(0);
        }
        return;
      }

      setPromoCode(data.promoCode);
      setIsSuccess(true);
      if (data.spotsLeft !== undefined) {
        setSpotsLeft(data.spotsLeft);
      }
    } catch {
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(promoCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <main className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-primary selection:text-black">
      <Navbar />
      <Hero />
      <Features />
      <Gamification />
      
      {/* Final CTA Section */}
      <section id="waitlist" className="py-24 px-6 text-center relative">
         <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#0F0F0F] to-black border border-white/10 p-12 rounded-3xl relative overflow-hidden group hover:border-primary/30 transition-colors duration-500">
             {/* Glows */}
             <div className="absolute -top-24 -left-24 w-64 h-64 bg-primary/20 blur-[100px] rounded-full group-hover:bg-primary/30 transition-colors"></div>
             <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-secondary/10 blur-[100px] rounded-full"></div>
             
             <div className="relative z-10">
                <h2 className="text-4xl md:text-6xl font-teko uppercase text-white mb-6 leading-none">
                  ¿Listo para dejar tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Legado</span>?
                </h2>
                <p className="text-gray-400 mb-6 max-w-xl mx-auto text-lg font-inter">
                  Únete a la lista de espera hoy y recibe 1 mes de HYPERTRO Pro gratis cuando lancemos.
                </p>
                
                {/* Spots Counter */}
                {spotsLeft !== null && !isFull && !isSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center gap-2 bg-primary/10 border border-primary/30 rounded-full px-4 py-2 mb-8"
                  >
                    <span className="w-2 h-2 bg-primary rounded-full animate-pulse"></span>
                    <span className="text-primary font-semibold font-inter text-sm">
                      {spotsLeft} plazas disponibles
                    </span>
                  </motion.div>
                )}

                {/* Promotion Full Message */}
                {isFull && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 max-w-md mx-auto mb-8"
                  >
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-white mb-2 font-teko uppercase tracking-wide">
                      ¡Promoción Agotada!
                    </h3>
                    <p className="text-gray-400 text-sm font-inter">
                      Las 1000 plazas de Fundador ya han sido ocupadas. ¡Pero no te preocupes! Puedes descargar la app cuando esté disponible.
                    </p>
                  </motion.div>
                )}
                
                <AnimatePresence mode="wait">
                  {!isSuccess && !isFull ? (
                    <motion.form 
                      key="form"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      onSubmit={handleSubmit}
                      className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                    >
                      <div className="relative w-full sm:w-auto">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input 
                          type="email" 
                          placeholder="Introduce tu correo" 
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isLoading}
                          className="w-full sm:w-auto pl-12 pr-6 py-4 bg-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary min-w-[300px] disabled:opacity-50 transition-all"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isLoading}
                        className="w-full sm:w-auto bg-white hover:bg-gray-200 text-black font-bold font-teko text-2xl px-10 py-3 rounded-lg hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2"
                      >
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          'UNIRSE AHORA'
                        )}
                      </button>
                    </motion.form>
                  ) : isSuccess ? (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-primary/20 to-emerald-500/10 border border-primary/30 rounded-2xl p-8 max-w-md mx-auto"
                    >
                      <CheckCircle className="w-16 h-16 text-primary mx-auto mb-4" />
                      <h3 className="text-2xl font-bold text-white mb-2 font-teko uppercase tracking-wide">
                        ¡Eres un Fundador!
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 font-inter">
                        Guarda tu código para obtener 1 mes gratis de Premium + tu badge exclusivo:
                      </p>
                      <div className="flex items-center justify-center gap-3 bg-black/40 rounded-xl p-4 border border-white/10">
                        <code className="text-primary text-2xl font-mono font-bold tracking-wider">
                          {promoCode}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                          title="Copiar código"
                        >
                          {copied ? (
                            <Check className="w-6 h-6 text-primary" />
                          ) : (
                            <Copy className="w-6 h-6 text-gray-400 hover:text-white" />
                          )}
                        </button>
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>

                {errorMessage && !isFull && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 text-red-400 text-sm font-inter"
                  >
                    {errorMessage}
                  </motion.p>
                )}

                {!isSuccess && !isFull && spotsLeft !== null && (
                  <p className="mt-4 text-xs text-gray-500">
                    ¡Solo quedan <span className="text-primary font-semibold">{spotsLeft}</span> de 1000 plazas!
                  </p>
                )}
             </div>
         </div>
      </section>

      <Footer />
    </main>
  );
}
