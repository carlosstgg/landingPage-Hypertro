'use client';
import { motion } from "framer-motion";
import Link from 'next/link';
import Image from 'next/image';

export default function Navbar() {
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
      <div className="hidden md:flex gap-8 font-inter text-sm tracking-wide text-gray-300">
        <Link href="#features" className="hover:text-primary transition-colors">FEATURES</Link>
        <Link href="#gamification" className="hover:text-primary transition-colors">RANGOS</Link>
        <Link href="#waitlist" className="hover:text-primary transition-colors">LISTA DE ESPERA</Link>
      </div>
      <Link href="#waitlist">
        <button className="bg-primary hover:bg-primary/90 text-black font-bold font-teko text-lg px-6 py-1 rounded-sm transition-all transform hover:skew-x-[-10deg]">
          UNIRSE AHORA
        </button>
      </Link>
    </motion.nav>
  );
}
