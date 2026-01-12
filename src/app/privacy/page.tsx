import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background text-foreground font-inter selection:bg-primary selection:text-black">
      <Navbar />
      <div className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        <h1 className="text-5xl md:text-7xl font-teko uppercase mb-8 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Política de Privacidad</h1>
        <div className="space-y-6 text-gray-300 leading-relaxed">
            <p className="text-sm text-gray-500">Última actualización: 10 de Enero de 2026</p>
            <p>En HYPERTRO ("nosotros", "nuestro"), respetamos su privacidad y estamos comprometidos a protegerla mediante el cumplimiento de esta política. Esta política describe los tipos de información que podemos recopilar de usted o que usted puede proporcionar cuando utiliza la aplicación móvil HYPERTRO.</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">1. Recopilación de Información</h2>
            <p>Recopilamos varios tipos de información de y sobre los usuarios de nuestra aplicación, incluyendo:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
                   <li><strong className="text-white">Información de Identificación Personal:</strong> Nombre, dirección de correo electrónico, y foto de perfil (opcional).</li>
                   <li><strong className="text-white">Datos de Salud y Fitness:</strong> Registros de entrenamiento, peso, medidas corporales y estadísticas de rendimiento.</li>
                   <li><strong className="text-white">Datos Técnicos:</strong> Dirección IP, tipo de dispositivo, versión del sistema operativo y datos de uso de la aplicación.</li>
            </ul>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">2. Uso de la Información</h2>
            <p>Utilizamos la información que recopilamos para:</p>
            <ul className="list-disc pl-5 mt-2 space-y-2 text-gray-400">
                   <li>Proporcionar, operar y mantener nuestra aplicación.</li>
                   <li>Mejorar, personalizar y expandir nuestra aplicación.</li>
                   <li>Comprender y analizar cómo utiliza nuestra aplicación.</li>
                   <li>Desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                   <li>Comunicarnos con usted, ya sea directamente o a través de uno de nuestros socios, incluso para el servicio al cliente.</li>
            </ul>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">3. Seguridad de los Datos</h2>
            <p>La seguridad de sus datos es importante para nosotros, pero recuerde que ningún método de transmisión a través de Internet o método de almacenamiento electrónico es 100% seguro. Si bien nos esforzamos por utilizar medios comercialmente aceptables para proteger sus datos personales, no podemos garantizar su seguridad absoluta.</p>
            
            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">4. Derechos del Usuario (GDPR/CCPA)</h2>
            <p>Dependiendo de su ubicación, puede tener derechos relacionados con sus datos personales, incluyendo el derecho a acceder, corregir, eliminar o restringir el uso de sus datos personales.</p>

            <h2 className="text-3xl font-teko uppercase text-white mt-12 mb-4 border-b border-white/10 pb-2">5. Contacto</h2>
            <p>Si tiene alguna pregunta sobre esta Política de Privacidad, puede contactarnos:
            <br/>Por email: <a href="mailto:privacy@hypertro.app" className="text-primary hover:underline">privacy@hypertro.app</a></p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
