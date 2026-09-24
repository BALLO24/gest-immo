import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowLeft, AlertTriangle } from "lucide-react";

// Petits sous-composants pour garder le contenu ci-dessous lisible, sans
// répéter les mêmes classes Tailwind à chaque titre/paragraphe.
const H2 = ({ children }) => <h2 className="text-xl font-bold text-maliGreen mt-8 mb-3">{children}</h2>;
const P = ({ children }) => <p className="text-gray-700 leading-relaxed mb-3">{children}</p>;
const Li = ({ children }) => <li className="text-gray-700 leading-relaxed mb-1.5">{children}</li>;

export default function CGUPage() {
  return (
    <>
      <Helmet>
        <title>Conditions Générales d'Utilisation | ImmoMali</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-maliGreen mb-6 transition-colors">
          <ArrowLeft size={16} /> Retour à l'accueil
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">Conditions Générales d'Utilisation</h1>
        <p className="text-sm text-gray-400 mb-6">Dernière mise à jour : [à compléter avant publication]</p>

        <div className="flex gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
          <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-amber-800 leading-relaxed">
            Ce document est une base de travail, à faire valider par un professionnel du droit avant publication définitive.
          </p>
        </div>

        <P>Les présentes Conditions Générales d'Utilisation (« CGU ») définissent les modalités et conditions dans lesquelles ImmoMali (« la Plateforme », « le Site », « nous ») met à disposition son service de mise en relation entre les agences immobilières partenaires (« les Agences ») et les personnes recherchant un bien à louer ou à vendre (« l'Utilisateur », « le Client », « vous »).</P>
        <P>Toute utilisation du Site implique l'acceptation pleine et entière des présentes CGU.</P>

        <H2>1. Définitions</H2>
        <ul className="list-disc pl-5 mb-3">
          <Li><strong>Plateforme / Site</strong> : le site web ImmoMali et ses services associés.</Li>
          <Li><strong>Agence</strong> : toute agence immobilière inscrite et validée sur la Plateforme.</Li>
          <Li><strong>Bien</strong> : tout logement, magasin, terrain ou autre bien immobilier référencé.</Li>
          <Li><strong>Utilisateur / Client</strong> : toute personne consultant le Site à la recherche d'un bien.</Li>
          <Li><strong>Visite</strong> : rendez-vous organisé permettant de visiter physiquement un Bien.</Li>
        </ul>

        <H2>2. Rôle de la Plateforme</H2>
        <P>ImmoMali est un intermédiaire technique de mise en relation. La Plateforme n'est pas propriétaire des Biens publiés et n'est pas partie au contrat de bail ou de vente conclu entre un Client et une Agence. Elle ne garantit pas l'exactitude des informations publiées par les Agences, celles-ci restant responsables du contenu de leurs annonces. La Plateforme n'intervient pas dans la négociation, la signature, ni l'exécution du contrat entre le Client et l'Agence.</P>

        <H2>3. Inscription des Agences</H2>
        <P>Toute Agence doit créer un compte et fournir des informations exactes. L'activation d'un compte est soumise à validation par un administrateur, qui peut refuser ou suspendre un compte sans justification, notamment en cas de non-respect des présentes CGU. Un seul compte de connexion est associé à chaque Agence, qui est responsable de la confidentialité de ses identifiants. L'Agence garantit être habilitée à commercialiser les Biens qu'elle publie.</P>

        <H2>4. Utilisation du Site par les Utilisateurs</H2>
        <P>La consultation des annonces est libre et gratuite. Toute demande de visite ou de contact doit être exacte et sincère. L'Utilisateur s'engage à ne pas contourner la Plateforme pour éviter le paiement des frais prévus à l'article 5 après une mise en relation initiée via ImmoMali.</P>

        <H2>5. Frais et commissions</H2>
        <P>Cette section décrit les frais applicables à l'Utilisateur, distincts et s'ajoutant au loyer ou au prix de vente négocié avec l'Agence.</P>
        <P><strong>Frais de visite</strong> : toute visite organisée via la Plateforme donne lieu à un frais de 2 000 FCFA, dont 500 FCFA reviennent à ImmoMali au titre de sa commission d'intermédiation.</P>
        <P><strong>Commission en cas de location</strong> : un frais de service unique de 3 % du montant du loyer mensuel convenu est dû à ImmoMali, calculé une seule fois, en plus du loyer versé au bailleur.</P>
        <P><strong>Commission en cas de vente</strong> : un frais de service de 2,5 % du montant total de la vente est dû à ImmoMali.</P>
        <P>Le Client s'engage à déclarer toute location ou vente conclue avec une Agence rencontrée via le Site, y compris en dehors du Site. Tout contournement avéré pourra entraîner la suspension du compte et la facturation rétroactive des frais dus.</P>

        <H2>6. Propriété intellectuelle</H2>
        <P>L'ensemble des éléments du Site est protégé par le droit de la propriété intellectuelle. Les photographies et descriptions publiées par les Agences restent leur propriété ; l'Agence garantit détenir les droits nécessaires et concède à ImmoMali le droit de les afficher dans le cadre du service.</P>

        <H2>7. Données personnelles</H2>
        <P>Le traitement de vos données personnelles est décrit dans notre <Link to="/confidentialite" className="text-maliGreen font-semibold hover:underline">Politique de Confidentialité</Link>.</P>

        <H2>8. Responsabilité</H2>
        <P>ImmoMali ne saurait être tenu responsable des litiges relatifs à l'état du Bien ou à l'exécution du bail/de la vente entre le Client et l'Agence. La responsabilité d'ImmoMali, si elle devait être engagée, serait limitée aux frais effectivement perçus au titre de l'opération concernée.</P>

        <H2>9. Suspension et résiliation</H2>
        <P>ImmoMali peut suspendre ou résilier l'accès d'un Utilisateur ou d'une Agence en cas de non-respect des présentes CGU ou de comportement portant atteinte au bon fonctionnement de la Plateforme.</P>

        <H2>10. Modification des CGU</H2>
        <P>ImmoMali peut modifier les présentes CGU à tout moment. La poursuite de l'utilisation du Site après modification vaut acceptation des nouvelles CGU.</P>

        <H2>11. Droit applicable</H2>
        <P>Les présentes CGU sont soumises au droit malien. À défaut d'accord amiable, les tribunaux compétents du Mali seront seuls compétents.</P>

        <H2>12. Contact</H2>
        <P>Pour toute question relative aux présentes CGU : [à compléter — email de contact].</P>
      </div>
    </>
  );
}
