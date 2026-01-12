import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-inter selection:bg-primary selection:text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-5xl md:text-7xl font-teko uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Términos y Condiciones</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">Última actualización: 10 de Enero de 2026</p>
            <p>Por favor, lea estos términos y condiciones cuidadosamente antes de usar la aplicación HYPERTRO.</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">1. Aceptación de los Términos</h2>
            <p>Al acceder o utilizar el Servicio, usted acepta estar sujeto a estos Términos. Si no está de acuerdo con alguna parte de los términos, no podrá acceder al Servicio.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">2. Descargo de Responsabilidad Médica</h2>
            <div className="bg-red-900/20 border border-red-500/50 p-6 rounded-xl text-white mb-4 flex items-start gap-4">
                 <div className="text-3xl">⚠️</div>
                 <div>
                    <strong className="text-red-400 block mb-2">ADVERTENCIA MÉDICA</strong>
                    HYPERTRO no es un proveedor de atención médica. El contenido de la aplicación, como entrenamientos, planes y análisis, es solo para fines informativos y educativos. La participación en cualquier ejercicio o programa de entrenamiento conlleva riesgos. Consulte siempre a un médico antes de comenzar este o cualquier programa de ejercicios.
                 </div>
            </div>
            <p>El uso de la aplicación es bajo su propio riesgo.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">3. Cuentas y Suscripciones</h2>
            <p>Cuando crea una cuenta con nosotros, garantiza que es mayor de 18 años y que la información proporcionada es precisa. Usted es responsable de salvaguardar la contraseña que utiliza para acceder al Servicio.</p>
            <p className="mt-2 text-gray-400">Ciertas funciones (Premium) pueden facturarse mediante suscripción. Estas se renovarán automáticamente a menos que se cancelen con al menos 24 horas de antelación.</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">4. Gamificación y Activos Virtuales</h2>
            <p>Los "puntos de experiencia" (XP), "niveles", "rangos" y "medallas" obtenidos en la App son virtuales, no tienen valor monetario en el mundo real y no pueden ser transferidos ni canjeados por dinero.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">5. Propiedad Intelectual</h2>
            <p>El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de HYPERTRO y sus licenciantes. El Servicio está protegido por derechos de autor, marcas comerciales y otras leyes.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">6. Terminación</h2>
            <p>Podemos cancelar o suspender su cuenta inmediatamente, sin previo aviso ni responsabilidad, por cualquier motivo, incluido, entre otros, si usted incumple los Términos.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">7. Cambios</h2>
            <p>Nos reservamos el derecho, a nuestra sola discreción, de modificar o reemplazar estos Términos en cualquier momento. Si una revisión es material, intentaremos proporcionar un aviso de al menos 30 días antes de que entren en vigor los nuevos términos.</p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
