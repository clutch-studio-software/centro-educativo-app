import React from 'react';
import Navbar from '../components/Navbar';
import Icon from '../components/atoms/Icon';

const Privacy = () => {
  return (
    <div className="relative min-h-screen bg-surface text-on-surface">
      <Navbar />

      <main className="pt-10 pb-16 px-6 md:px-12 max-w-4xl mx-auto flex flex-col">
        {/* Hero Banner / Header */}
        <div className="bg-surface-container-low rounded-3xl p-8 md:p-12 mb-8 border border-surface-container-highest flex flex-col md:flex-row items-center gap-6 shadow-sm">
          <div className="bg-primary-container text-on-primary-container p-4 rounded-2xl flex items-center justify-center shadow-md">
            <span className="material-symbols-outlined text-4xl">shield</span>
          </div>
          <div className="text-left">
            <h1 className="text-3xl md:text-4xl font-headline font-extrabold tracking-tight text-on-surface mb-2">
              Política de Privacidad
            </h1>
            <p className="text-on-surface-variant font-body text-sm md:text-base max-w-xl">
              Centro Educativo Educar para Transformar. Entérese de cómo recopilamos, utilizamos y protegemos su información personal en nuestro Sitio.
            </p>
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 md:p-12 border border-surface-container-highest shadow-md text-left flex flex-col gap-8">
          
          <section className="border-b border-surface-container-highest pb-6">
            <p className="font-body text-on-surface leading-relaxed mb-4">
              Esta Política de privacidad describe cómo se recopila, utiliza y comparte su información personal cuando visita o hace una compra en{' '}
              <a
                href="https://web-centroeducativo-mkdw.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-semibold"
              >
                https://web-centroeducativo-mkdw.vercel.app/
              </a>{' '}
              (denominado en lo sucesivo el “Sitio”).
            </p>
          </section>

          {/* Section 1 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">visibility</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                1. INFORMACIÓN PERSONAL QUE RECOPILAMOS
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Cuando visita el Sitio, recopilamos automáticamente cierta información sobre su dispositivo, incluida información sobre su navegador web, dirección IP, zona horaria y algunas de las cookies que están instaladas en su dispositivo. Además, a medida que navega por el Sitio, recopilamos información sobre las páginas web individuales o los productos que ve, las páginas web o los términos de búsqueda que lo remitieron al Sitio e información sobre cómo interactúa usted con el Sitio. Nos referimos a esta información recopilada automáticamente como <strong>“Información del dispositivo”</strong>.
            </p>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-highest mt-2 flex flex-col gap-4">
              <p className="font-body text-sm font-semibold text-on-surface">
                Recopilamos Información del dispositivo mediante el uso de las siguientes tecnologías:
              </p>
              <ul className="list-disc list-inside flex flex-col gap-3 font-body text-sm text-on-surface-variant ml-2">
                <li>
                  <strong>Los “Archivos de registro”</strong> rastrean las acciones que ocurren en el Sitio y recopilan datos, incluyendo su dirección IP, tipo de navegador, proveedor de servicio de Internet, páginas de referencia/salida y marcas de fecha/horario.
                </li>
                <li>
                  <strong>Las “balizas web”, las “etiquetas” y los “píxeles”</strong> son archivos electrónicos utilizados para registrar información sobre cómo navega usted por el Sitio.
                </li>
              </ul>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed mt-2">
              Además, cuando hace una compra o intenta hacer una compra a través del Sitio, recopilamos cierta información de usted, entre la que se incluye su nombre, dirección de facturación, dirección de envío, información de pago (incluidos los números de la tarjeta de crédito), dirección de correo electrónico y número de teléfono. Nos referimos a esta información como <strong>“Información del pedido”</strong>.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Cuando hablamos de “Información personal” en la presente Política de privacidad, nos referimos tanto a la Información del dispositivo como a la Información del pedido.
            </p>
          </section>

          {/* Section 2 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">handshake</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                2. ¿CÓMO UTILIZAMOS SU INFORMACIÓN PERSONAL?
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Usamos la Información del pedido que recopilamos en general para preparar los pedidos realizados a través del Sitio (incluido el procesamiento de su información de pago, la organización de los envíos y la entrega de facturas y/o confirmaciones de pedido).
            </p>
            <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-highest flex flex-col gap-2">
              <p className="font-body text-sm font-semibold text-on-surface mb-2">
                Además, utilizamos esta Información del pedido para:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-body text-on-surface-variant">
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">chat</span>
                  <span>Comunicarnos con usted</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="material-symbols-outlined text-primary text-lg">verified_user</span>
                  <span>Examinar nuestros pedidos en busca de fraudes o riesgos potenciales</span>
                </div>
                <div className="flex items-start gap-2 col-span-1 md:col-span-2">
                  <span className="material-symbols-outlined text-primary text-lg">campaign</span>
                  <span>Cuando de acuerdo con las preferencias que usted compartió con nosotros, le proporcionamos información o publicidad relacionada con nuestros productos o servicios.</span>
                </div>
              </div>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed mt-2">
              Utilizamos la Información del dispositivo que recopilamos para ayudarnos a detectar posibles riesgos y fraudes (en particular, su dirección IP) y, en general, para mejorar y optimizar nuestro Sitio (por ejemplo, al generar informes y estadísticas sobre cómo nuestros clientes navegan e interactúan con el Sitio y para evaluar el éxito de nuestras campañas publicitarias y de marketing).
            </p>
          </section>

          {/* Section 3 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">share</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                3. COMPARTIR SU INFORMACIÓN PERSONAL
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Compartimos su Información personal con terceros para que nos ayuden a utilizar su Información personal, tal como se describió anteriormente.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Por ejemplo, utilizamos la tecnología de Shopify en nuestra tienda online. Puede obtener más información sobre cómo Shopify utiliza su Información personal aquí:{' '}
              <a
                href="https://www.shopify.com/legal/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.shopify.com/legal/privacy
              </a>
              .
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              También utilizamos Google Analytics para ayudarnos a comprender cómo usan nuestros clientes el Sitio. Puede obtener más información sobre cómo Google utiliza su Información personal aquí:{' '}
              <a
                href="https://www.google.com/intl/es/policies/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://www.google.com/intl/es/policies/privacy/
              </a>
              . Puede darse de baja de Google Analytics aquí:{' '}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                https://tools.google.com/dlpage/gaoptout
              </a>
              .
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Finalmente, también podemos compartir su Información personal para cumplir con las leyes y regulaciones aplicables, para responder a una citación, orden de registro u otra solicitud legal de información que recibamos, o para proteger nuestros derechos.
            </p>
          </section>

          {/* Section 4 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">ads_click</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                4. PUBLICIDAD ORIENTADA POR EL COMPORTAMIENTO
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Como se describió anteriormente, utilizamos su Información personal para proporcionarle anuncios publicitarios dirigidos o comunicaciones de marketing que creemos que pueden ser de su interés. Para más información sobre cómo funciona la publicidad dirigida, puede visitar la página educativa de la Iniciativa Publicitaria en la Red ("NAI" por sus siglas en inglés) en{' '}
              <a
                href="https://www.networkadvertising.org/understanding-online-advertising/how-does-it-work"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                http://www.networkadvertising.org/understanding-online-advertising/how-does-it-work
              </a>
              .
            </p>
            
            <div className="bg-surface-container-low p-6 rounded-2xl border border-surface-container-highest flex flex-col gap-3">
              <p className="font-body text-sm font-semibold text-on-surface">
                Puede darse de baja de la publicidad dirigida mediante los siguientes enlaces:
              </p>
              <div className="flex flex-wrap gap-2 text-sm">
                <a
                  href="https://www.facebook.com/settings/?tab=ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-lowest border border-surface-container-highest px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-body"
                >
                  Facebook
                </a>
                <a
                  href="https://adssettings.google.com/authenticated?hl=es"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-lowest border border-surface-container-highest px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-body"
                >
                  Google
                </a>
                <a
                  href="https://about.ads.microsoft.com/es-es/recursos/directivas/anuncios-personalizados"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-surface-container-lowest border border-surface-container-highest px-4 py-2 rounded-xl text-on-surface-variant hover:text-primary hover:border-primary/30 transition-all font-body"
                >
                  Bing
                </a>
              </div>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed text-sm">
              Además, puede darse de baja de algunos de estos servicios visitando el portal de exclusión voluntaria de Digital Advertising Alliance en:{' '}
              <a
                href="https://optout.aboutads.info/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                http://optout.aboutads.info/
              </a>
              .
            </p>
          </section>

          {/* Section 5 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">leak_remove</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                5. NO RASTREAR
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Tenga en cuenta que no alteramos las prácticas de recopilación y uso de datos de nuestro Sitio cuando vemos una señal de No rastrear desde su navegador.
            </p>
          </section>

          {/* Section 6 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                6. SUS DERECHOS
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Si usted es un residente europeo, tiene derecho a acceder a la información personal que tenemos sobre usted y a solicitar que su información personal sea corregida, actualizada o eliminada. Si desea ejercer este derecho, comuníquese con nosotros a través de la información de contacto que se encuentra a continuación.
            </p>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Además, si usted es un residente europeo, tenemos en cuenta que estamos procesando su información para cumplir con los contratos que podamos tener con usted (por ejemplo, si realiza un pedido a través del Sitio) o para perseguir nuestros intereses comerciales legítimos enumerados anteriormente. Además, tenga en cuenta que su información se transferirá fuera de Europa, incluidos Canadá y los Estados Unidos.
            </p>
          </section>

          {/* Section 7 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">inventory_2</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                7. RETENCIÓN DE DATOS
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Cuando realiza un pedido a través del Sitio, mantendremos su Información del pedido para nuestros registros a menos que y hasta que nos pida que eliminemos esta información.
            </p>
          </section>

          {/* Section 8 */}
          <section className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">update</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                8. CAMBIOS
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Podemos actualizar esta política de privacidad periódicamente para reflejar, por ejemplo, cambios en nuestras prácticas o por otros motivos operativos, legales o reglamentarios.
            </p>
          </section>

          {/* Section 9 */}
          <section className="flex flex-col gap-4 border-t border-surface-container-highest pt-6">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-2xl">mail</span>
              <h2 className="text-xl font-headline font-bold text-on-surface">
                9. CONTÁCTENOS
              </h2>
            </div>
            <p className="font-body text-on-surface-variant leading-relaxed">
              Para obtener más información sobre nuestras prácticas de privacidad, si tiene alguna pregunta o si desea presentar una queja, contáctenos por correo electrónico a:{' '}
              <a
                href="mailto:centroeducativo@educarparatransformar.com"
                className="text-primary hover:underline font-semibold"
              >
                centroeducativo@educarparatransformar.com
              </a>
            </p>
          </section>

        </div>
      </main>
    </div>
  );
};

export default Privacy;
