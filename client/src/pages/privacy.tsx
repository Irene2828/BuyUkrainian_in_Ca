import { useI18n } from "@/lib/i18n";
import { Link } from "wouter";

export default function PrivacyPage() {
  const { language } = useI18n();

  const isFr = language === 'fr-CA';

  return (
    <div className="min-h-screen bg-slate-50 py-12 md:py-24 font-sans">
      <div className="max-w-3xl mx-auto px-6">
        <Link href="/">
          <a className="text-[#0057B7] hover:underline mb-8 inline-block font-medium">
            {isFr ? "← Retour à l'accueil" : "← Back to Home"}
          </a>
        </Link>
        
        <div className="bg-white p-8 md:p-12 shadow-sm border border-slate-200">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            {isFr ? "Politique de confidentialité" : "Privacy Policy"}
          </h1>
          <p className="text-sm text-slate-500 mb-8 border-b border-slate-100 pb-8">
            {isFr ? "Dernière mise à jour : [À CONFIRMER]" : "Last updated: [TO CONFIRM]"}
          </p>

          {!isFr ? (
            <div className="space-y-8 text-[16px] leading-relaxed text-slate-700">
              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">1. What information is collected</h2>
                <p>When you submit a store, we collect the store name, address, products, and optionally a contact email and store photos.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">2. Why we collect it</h2>
                <p>This information is collected to display accurate locations on our map and directory so people can find Ukrainian products in Canada.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">3. Public visibility</h2>
                <p>Approved listings, including store name, address, products, and photos, are public on the map. The optional contact email is <strong>not shown publicly</strong> and is used only if we need to clarify submission details.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">4. Storage and hosting</h2>
                <p>Your data is securely stored with Supabase and the website is hosted on Vercel.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">5. Data retention</h2>
                <p>We keep the submitted information for [TO CONFIRM].</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">6. Removal and correction</h2>
                <p>If you would like to request removal or correction of a listing or your information, please contact [TO CONFIRM].</p>
              </section>
            </div>
          ) : (
            <div className="space-y-8 text-[16px] leading-relaxed text-slate-700">
              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">1. Renseignements recueillis</h2>
                <p>Lorsque vous soumettez une boutique, nous recueillons le nom de la boutique, son adresse, ses produits et, de manière facultative, une adresse courriel et des photos.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">2. Pourquoi nous les recueillons</h2>
                <p>Ces renseignements sont recueillis pour afficher des emplacements exacts sur notre carte et notre répertoire afin d'aider le public à trouver des produits ukrainiens au Canada.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">3. Visibilité publique</h2>
                <p>Les fiches approuvées, y compris le nom, l'adresse, les produits et les photos de la boutique, sont publiques sur la carte. L'adresse courriel facultative <strong>n'est pas affichée publiquement</strong> et sert uniquement à préciser les détails de votre soumission au besoin.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">4. Stockage et hébergement</h2>
                <p>Vos données sont stockées de façon sécuritaire avec Supabase et le site Web est hébergé sur Vercel.</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">5. Conservation des données</h2>
                <p>Nous conservons les renseignements soumis pour [À CONFIRMER].</p>
              </section>

              <section>
                <h2 className="font-bold text-slate-900 text-xl mb-3">6. Retrait et correction</h2>
                <p>Si vous souhaitez demander le retrait ou la correction d'une fiche ou de vos renseignements, veuillez contacter [À CONFIRMER].</p>
              </section>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
