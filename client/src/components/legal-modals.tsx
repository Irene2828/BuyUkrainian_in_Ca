import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useI18n } from "@/lib/i18n";

interface LegalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "terms" | "privacy" | "accessibility" | null;
}

export const legalContent = {
    terms: {
      en: {
        title: "Terms & Listing Policy",
        lastUpdated: "August 4, 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">About this project</h3>
              <p>BuyUkrainian.ca is an independent, volunteer-led community directory created to help people in Canada find stores carrying products made in Ukraine. It is not a retailer, marketplace, certification body or government service.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Free and independent listings</h3>
              <p>Stores cannot pay to be included, ranked more prominently or described more favourably. BuyUkrainian.ca does not receive commissions from purchases and does not sell products on behalf of listed businesses.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Community submissions</h3>
              <p>Anyone may suggest a store using the Add Store form. Please submit only accurate, publicly available business information that you have the right to share.</p>
              <p className="mt-2">Submitted information may be reviewed, corrected, combined with an existing listing, declined or removed. Submission does not guarantee publication.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">What a listing means</h3>
              <p>A listing means that available information reasonably indicates that the store carries one or more products made in Ukraine.</p>
              <p className="mt-2">A listing is not an endorsement, formal verification, guarantee or certification of the store, its owners or every product it sells. Products, suppliers, prices, opening hours and availability may change. Visitors should confirm important details directly with the business before travelling or purchasing.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Public information</h3>
              <p>Approved store names, public business addresses, categories, product descriptions, websites and other listing details may be displayed publicly on the map.</p>
              <p className="mt-2">Do not submit a private residential address unless it is already publicly presented by the owner as a customer-facing business location.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Corrections and removal</h3>
              <p>Store owners and community members may contact BuyUkrainian.ca to report incorrect, outdated or inappropriate information. We may update or remove a listing when necessary.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">External businesses and services</h3>
              <p>Transactions occur directly between visitors and independent businesses. BuyUkrainian.ca is not responsible for purchases, product quality, store operations, external websites, directions or interactions with listed businesses.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Use of Google Maps</h3>
              <p>The map uses Google Maps. Use of Google Maps features is also subject to the <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Google Maps/Google Earth Additional Terms of Service</a> and <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Google’s Privacy Policy</a>.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Contact</h3>
              <p>Questions, corrections and listing-removal requests may be sent through the existing public contact email.</p>
            </div>
          </div>
        )
      },
      fr: {
        title: "Conditions et politique des fiches",
        lastUpdated: "Mise à jour : 4 août 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">À propos du projet</h3>
              <p>BuyUkrainian.ca est un répertoire communautaire indépendant, géré bénévolement, qui aide les personnes au Canada à trouver des boutiques offrant des produits fabriqués en Ukraine. Il ne s’agit ni d’un détaillant, ni d’une place de marché, ni d’un organisme de certification, ni d’un service gouvernemental.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Fiches gratuites et indépendantes</h3>
              <p>Les commerces ne peuvent pas payer pour être ajoutés, mieux classés ou présentés plus favorablement. BuyUkrainian.ca ne reçoit aucune commission sur les achats et ne vend aucun produit au nom des commerces répertoriés.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Ajouts communautaires</h3>
              <p>Toute personne peut proposer une boutique au moyen du formulaire d’ajout. Veuillez transmettre uniquement des renseignements commerciaux exacts, publics et que vous avez le droit de partager.</p>
              <p className="mt-2">Les renseignements soumis peuvent être vérifiés, corrigés, regroupés avec une fiche existante, refusés ou supprimés. Une soumission ne garantit pas sa publication.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Signification d’une fiche</h3>
              <p>Une fiche signifie que les renseignements disponibles indiquent raisonnablement que la boutique offre un ou plusieurs produits fabriqués en Ukraine.</p>
              <p className="mt-2">Une fiche ne constitue pas une recommandation, une vérification officielle, une garantie ou une certification du commerce, de ses propriétaires ou de tous les produits qu’il vend. Les produits, fournisseurs, prix, heures d’ouverture et stocks peuvent changer. Les visiteurs devraient confirmer les renseignements importants directement auprès du commerce avant de se déplacer ou d’effectuer un achat.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Renseignements publics</h3>
              <p>Le nom de la boutique, son adresse commerciale publique, sa catégorie, les produits indiqués, son site Web et d’autres renseignements approuvés peuvent être affichés publiquement sur la carte.</p>
              <p className="mt-2">Ne soumettez pas une adresse résidentielle privée, sauf si le propriétaire la présente déjà publiquement comme un lieu commercial accueillant des clients.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Corrections et suppressions</h3>
              <p>Les propriétaires et les membres de la communauté peuvent communiquer avec BuyUkrainian.ca pour signaler des renseignements inexacts, désuets ou inappropriés. Nous pouvons modifier ou supprimer une fiche lorsque cela est nécessaire.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Commerces et services externes</h3>
              <p>Les transactions ont lieu directement entre les visiteurs et les commerces indépendants. BuyUkrainian.ca n’est pas responsable des achats, de la qualité des produits, des activités des commerces, des sites externes, des itinéraires ou des interactions avec les commerces répertoriés.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Utilisation de Google Maps</h3>
              <p>La carte utilise Google Maps. L’utilisation des fonctionnalités de Google Maps est également assujettie aux <a href="https://maps.google.com/help/terms_maps/" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Conditions d’utilisation supplémentaires de Google Maps/Google Earth</a> et à la <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Politique de confidentialité de Google</a>.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Contact</h3>
              <p>Les questions, corrections et demandes de suppression peuvent être envoyées à l’adresse courriel publique existante du projet.</p>
            </div>
          </div>
        )
      }
    },
    privacy: {
      en: {
        title: "Privacy",
        lastUpdated: "August 4, 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Our approach</h3>
              <p>BuyUkrainian.ca is designed to collect as little personal information as possible.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">No account or contact-information collection</h3>
              <p>Visitors do not need an account to browse the map or suggest a store. The Add Store form does not request a submitter’s name, email address or telephone number.</p>
              <p className="mt-2">Store information submitted through the form may be saved, reviewed and published because it is intended for the public directory.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Technical information</h3>
              <p>Like most websites, technical service providers may automatically process limited information needed to deliver and secure the site, such as IP address, browser type, device information, requested pages, dates and times.</p>
              <p className="mt-2">These providers include Vercel (hosting), Neon/PostgreSQL (database), Google Maps (map display), and OpenStreetMap/Nominatim (reverse geocoding).</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Google Maps</h3>
              <p>The site uses Google Maps to display locations and may use Google Places, Geocoding or related services. Google may process technical and map-related information according to <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Google’s Privacy Policy</a>.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Location permission</h3>
              <p>Your location is requested only after you select the location control and grant permission through your browser. It is used to centre the map or show nearby stores. BuyUkrainian.ca does not store your device location.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Analytics and advertising</h3>
              <p>BuyUkrainian.ca does not use advertising trackers, behavioural profiling or third-party advertising tools.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Payments and sales</h3>
              <p>The site does not process payments, purchases or financial information.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Sharing and selling information</h3>
              <p>BuyUkrainian.ca does not sell personal information. Information may be processed by technical providers only as necessary to operate the site, display the map, prevent misuse and store submitted listings.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Questions</h3>
              <p>Privacy questions may be sent through the existing public contact email.</p>
            </div>
          </div>
        )
      },
      fr: {
        title: "Confidentialité",
        lastUpdated: "Mise à jour : 4 août 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Notre approche</h3>
              <p>BuyUkrainian.ca est conçu pour recueillir le moins de renseignements personnels possible.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Aucun compte ni renseignement de contact demandé</h3>
              <p>Il n’est pas nécessaire de créer un compte pour consulter la carte ou proposer une boutique. Le formulaire d’ajout ne demande pas le nom, l’adresse courriel ou le numéro de téléphone de la personne qui soumet la fiche.</p>
              <p className="mt-2">Les renseignements commerciaux transmis au moyen du formulaire peuvent être enregistrés, examinés et publiés, puisqu’ils sont destinés au répertoire public.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Renseignements techniques</h3>
              <p>Comme pour la plupart des sites Web, certains fournisseurs techniques peuvent traiter automatiquement des renseignements limités nécessaires à l’affichage et à la sécurité du site, comme l’adresse IP, le type de navigateur, l’appareil utilisé, les pages demandées ainsi que la date et l’heure.</p>
              <p className="mt-2">Ces fournisseurs comprennent Vercel (hébergement), Neon/PostgreSQL (base de données), Google Maps (affichage de la carte) et OpenStreetMap/Nominatim (géocodage inversé).</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Google Maps</h3>
              <p>Le site utilise Google Maps pour afficher les emplacements et peut utiliser Google Places, Geocoding ou des services connexes. Google peut traiter certains renseignements techniques et cartographiques conformément à sa <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-[#0057B7] hover:underline">Politique de confidentialité</a>.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Autorisation de localisation</h3>
              <p>Votre position est demandée uniquement lorsque vous sélectionnez la commande de localisation et accordez votre autorisation dans le navigateur. Elle sert à centrer la carte ou à afficher les boutiques à proximité. BuyUkrainian.ca ne conserve pas la position de votre appareil.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Analyse et publicité</h3>
              <p>BuyUkrainian.ca n’utilise pas de traceurs publicitaires, de profilage comportemental ou d’outils de publicité de tiers.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Paiements et achats</h3>
              <p>Le site ne traite aucun paiement, achat ou renseignement financier.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Communication et vente de renseignements</h3>
              <p>BuyUkrainian.ca ne vend aucun renseignement personnel. Certains renseignements peuvent être traités par des fournisseurs techniques uniquement lorsque cela est nécessaire au fonctionnement du site, à l’affichage de la carte, à la prévention des abus ou à l’enregistrement des fiches soumises.</p>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2 text-[16px]">Questions</h3>
              <p>Les questions concernant la confidentialité peuvent être envoyées à l’adresse courriel publique existante du projet.</p>
            </div>
          </div>
        )
      }
    },
    accessibility: {
      en: {
        title: "Accessibility",
        lastUpdated: "August 4, 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <p>BuyUkrainian.ca aims to make its map and directory usable by as many people as possible.</p>
            <p>We work to support keyboard navigation, readable contrast, text resizing, clear labels and assistive technologies. Because an interactive map can create accessibility limitations, store information should also be available through the List view.</p>
            <p>If you encounter an accessibility barrier or need store information in another format, please contact us through the existing public email. Include the page, feature and problem you experienced so it can be reviewed.</p>
          </div>
        )
      },
      fr: {
        title: "Accessibilité",
        lastUpdated: "Mise à jour : 4 août 2026",
        body: (
          <div className="space-y-6 text-[15px] leading-relaxed text-slate-700 font-sans">
            <p>BuyUkrainian.ca souhaite rendre sa carte et son répertoire utilisables par le plus grand nombre de personnes possible.</p>
            <p>Nous travaillons à favoriser la navigation au clavier, un contraste lisible, le redimensionnement du texte, des libellés clairs et l’utilisation de technologies d’assistance. Comme une carte interactive peut présenter certaines limites d’accessibilité, les renseignements sur les boutiques doivent également être accessibles dans la vue Liste.</p>
            <p>Si vous rencontrez un obstacle d’accessibilité ou avez besoin des renseignements dans un autre format, communiquez avec nous à l’adresse courriel publique existante. Indiquez la page, la fonctionnalité et le problème rencontré afin que nous puissions l’examiner.</p>
          </div>
        )
      }
    }
  };

export function LegalModal({ open, onOpenChange, type }: LegalModalProps) {
  const { language } = useI18n();
  
  if (!type) return null;

  const currentContent = legalContent[type][language === 'fr-CA' ? 'fr' : 'en'] || legalContent[type].en;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-[720px] w-[calc(100vw-32px)] max-h-[80vh] bg-white rounded-none border border-slate-200 shadow-xl overflow-hidden flex flex-col p-0 gap-0"
        aria-describedby="legal-modal-content"
      >
        <DialogHeader className="px-6 py-5 border-b border-slate-100 flex-shrink-0 bg-white">
          <DialogTitle className="text-xl font-bold font-header text-slate-900">
            {currentContent.title}
          </DialogTitle>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            {currentContent.lastUpdated}
          </p>
        </DialogHeader>
        
        <div 
          id="legal-modal-content"
          className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-slate-50/30"
        >
          {currentContent.body}
        </div>

        <div className="p-4 border-t border-slate-100 bg-white flex justify-end flex-shrink-0">
          <button
            onClick={() => onOpenChange(false)}
            className="relative inline-flex w-auto items-center justify-center h-[46px] px-6 text-[16px] font-semibold tracking-normal rounded-none bg-transparent text-[#0057B7] border border-[#0057B7] shadow-none transition-all duration-300 hover:bg-[#0057B7] hover:border-[#0057B7] hover:text-white hover:scale-[1.02] active:scale-95 focus-visible:ring-2 focus-visible:ring-[#0057B7]/30 font-sans"
          >
            {language === 'fr-CA' ? 'Fermer' : 'Close'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
