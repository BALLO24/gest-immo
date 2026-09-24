import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

const H2 = ({ children }) => <h2 className="text-xl font-bold text-maliGreen mt-8 mb-3">{children}</h2>;
const P = ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>;
const Li = ({ children }) => <li className="text-gray-700 leading-relaxed mb-1.5">{children}</li>;

export default function PolitiqueConfidentialitePage() {
  return (
    <>
      <Helmet>
        <title>Politique de Confidentialité | ImmoMali</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-maliGreen mb-6 transition-colors">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Politique de Confidentialité</h1>
        <p className="text-sm text-gray-400 mb-6">Dernière mise à jour : [à compléter avant publication]</p>

        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-amber-800 leading-relaxed">
            Ce document est une base de travail, à faire valider par un professionnel du droit avant publication définitive — notamment pour vérifier une éventuelle obligation de déclaration auprès de l'APDP.
          </p>
        </div>

        <P>ImmoMali accorde une grande importance à la protection des données personnelles de ses utilisateurs. Cette politique est établie conformément à la Loi n°2013-015 du 21 mai 2013 portant protection des données à caractère personnel en République du Mali (modifiée en 2017), sous le contrôle de l'Autorité de Protection des Données à Caractère Personnel (APDP).</P>

        <H2>1. Responsable du traitement</H2>
        <P>Le responsable du traitement des données collectées sur ImmoMali est : [à compléter — raison sociale, adresse, contact].</P>

        <H2>2. Quelles données collectons-nous ?</H2>
        <P><strong>Visiteurs sans compte</strong> : données techniques de navigation (adresse IP, type de navigateur) à des fins de sécurité, et les informations transmises volontairement via un formulaire de contact (nom, téléphone, message).</P>
        <P><strong>Comptes Agence</strong> : nom de l'agence, nom du responsable, numéro de téléphone et email de connexion, coordonnées publiques affichées sur les annonces, mot de passe stocké de façon chiffrée.</P>
        <P><strong>Contenu publié</strong> : photographies et descriptions des biens, y compris des informations de localisation.</P>
        <P><strong>Données de session</strong> : un jeton de connexion conservé localement dans votre navigateur, et votre nom d'utilisateur si vous cochez « Se souvenir de moi ». Ces données restent sur votre appareil.</P>

        <H2>3. Pourquoi collectons-nous ces données ?</H2>
        <ul className="list-disc pl-5 mb-3">
          <Li>Permettre la connexion et la gestion des annonces des agences</Li>
          <Li>Afficher les coordonnées de contact sur les annonces et permettre la mise en relation</Li>
          <Li>Répondre aux demandes de contact ou de visite</Li>
          <Li>Assurer la sécurité et prévenir les abus</Li>
        </ul>
        <P>Nous ne vendons ni ne louons vos données personnelles à des tiers à des fins commerciales ou publicitaires.</P>

        <H2>4. Base légale du traitement</H2>
        <P>Le traitement repose selon les cas sur votre consentement (inscription, formulaire de contact), l'exécution du service que vous avez sollicité, ou notre intérêt légitime à assurer la sécurité de la Plateforme.</P>

        <H2>5. Qui a accès à vos données ?</H2>
        <P>Les administrateurs de la Plateforme pour la gestion du service, l'agence que vous contactez pour les informations que vous lui transmettez volontairement, et certains prestataires techniques (hébergement, envoi d'emails, hébergement d'images) n'accédant à vos données que dans la stricte mesure nécessaire à la fourniture du service.</P>

        <H2>6. Durée de conservation</H2>
        <P>Les données d'un compte Agence sont conservées tant que le compte reste actif, puis pendant une durée raisonnable après suppression à des fins de preuve. Les données transmises via formulaire sont conservées le temps nécessaire au traitement de la demande.</P>

        <H2>7. Sécurité des données</H2>
        <P>Nous mettons en œuvre des mesures techniques raisonnables : chiffrement des mots de passe (jamais stockés en clair), chiffrement des échanges (HTTPS), et limitations contre les tentatives d'accès abusif.</P>

        <H2>8. Vos droits</H2>
        <P>Conformément à la loi malienne n°2013-015, vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition, et d'information sur le traitement de vos données. Vous disposez également du droit d'introduire une réclamation auprès de l'APDP.</P>

        <H2>9. Cookies et stockage local</H2>
        <P>ImmoMali n'utilise pas de cookies publicitaires ou de traçage. Le site utilise uniquement le stockage local de votre navigateur pour maintenir votre session active et mémoriser votre nom d'utilisateur si vous le souhaitez. Vous pouvez effacer ces données via les paramètres de votre navigateur.</P>

        <H2>10. Mineurs</H2>
        <P>ImmoMali ne s'adresse pas aux personnes mineures et ne collecte pas sciemment de données les concernant.</P>

        <H2>11. Contact et exercice de vos droits</H2>
        <P>Pour exercer vos droits ou pour toute question : [à compléter — email dédié]. Autorité de contrôle compétente : APDP — Autorité de Protection des Données à Caractère Personnel du Mali (<a href="https://apdp.ml" target="_blank" rel="noopener noreferrer" className="text-maliGreen font-semibold hover:underline">apdp.ml</a>).</P>

        <H2>12. Modification de cette politique</H2>
        <P>Cette politique peut être mise à jour pour refléter des évolutions du service ou de la réglementation. En cas de modification substantielle, un avis sera publié sur le Site.</P>
      </div>
    </>
  );
}
