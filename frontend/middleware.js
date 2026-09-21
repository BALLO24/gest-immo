// AJOUT : Vercel Edge Middleware — s'exécute sur l'infrastructure Vercel
// AVANT que la requête n'atteigne le SPA React. C'est la seule façon
// d'intercepter les robots WhatsApp/Facebook ici, car frontend (Vercel) et
// backend (Render) sont sur des domaines séparés : une route Express dans le
// backend ne verrait jamais passer ces requêtes.
//
// Principe : WhatsApp/Facebook/Twitter ne savent PAS exécuter JavaScript
// quand ils génèrent l'aperçu d'un lien partagé — ils lisent uniquement le
// HTML brut de la réponse. Pour un vrai navigateur humain, ce middleware ne
// fait rien (laisse passer vers le SPA normal, qui affiche la vraie page
// React avec toute l'interactivité). Pour un robot reconnu, il renvoie un
// mini-HTML statique avec les bonnes balises Open Graph pour CE bien précis.
//
// CONFIGURATION REQUISE avant déploiement (à faire dans Vercel, pas ici) :
// - Ajouter une variable d'environnement BACKEND_API_URL dans les Settings
//   du projet Vercel (ex: https://votre-backend.onrender.com/api).
//   ATTENTION : ne PAS utiliser le préfixe VITE_ ici — ce préfixe ne
//   fonctionne que pour les variables lues côté client par Vite
//   (import.meta.env). Ce middleware tourne côté edge Vercel, dans un
//   contexte totalement séparé du bundle React ; il lit process.env.

export const config = {
  matcher: "/bien/:path*",
};

const CRAWLER_USER_AGENTS = [
  "whatsapp",
  "facebookexternalhit",
  "twitterbot",
  "linkedinbot",
  "slackbot",
  "telegrambot",
  "discordbot",
  "pinterest",
];

function isKnownCrawler(userAgent) {
  const ua = (userAgent || "").toLowerCase();
  return CRAWLER_USER_AGENTS.some((bot) => ua.includes(bot));
}

// Échappement HTML minimal — la description d'un bien vient du formulaire
// d'une agence, donc potentiellement du texte libre non fiable. On l'insère
// dans du HTML brut ici, contrairement au rendu React habituel qui échappe
// automatiquement : cet échappement manuel est indispensable pour éviter
// une injection HTML dans l'aperçu partagé.
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const TYPE_LABELS = { maison: "Maison", appartement: "Appartement", magasin: "Magasin", terrain: "Terrain" };

export default async function middleware(request) {
  const userAgent = request.headers.get("user-agent");

  // Visiteur humain normal : on ne touche à rien, le SPA React se charge
  // normalement (rewrite vers index.html défini dans vercel.json).
  if (!isKnownCrawler(userAgent)) {
    return;
  }

  const url = new URL(request.url);
  const slug = url.pathname.replace(/^\/bien\//, "");
  const backendUrl = process.env.BACKEND_API_URL;

  if (!backendUrl) {
    console.error("BACKEND_API_URL manquant — impossible de pré-rendre les balises OG.");
    return; // on laisse passer plutôt que de casser la page pour tout le monde
  }

  try {
    const res = await fetch(`${backendUrl}/proprietes/${encodeURIComponent(slug)}`);
    if (!res.ok) return; // bien introuvable/supprimé : on laisse le SPA gérer le 404

    const { propriete: item } = await res.json();
    if (!item) return;

    const typeLabel = TYPE_LABELS[item.__t] || "Bien";
    const offreLabel = item.typeOffre === "location" ? "à louer" : "à vendre";
    const lieu = [item.quartier?.nom, item.quartier?.ville?.nom].filter(Boolean).join(", ");
    const title = `${typeLabel} ${offreLabel}${lieu ? " à " + lieu : ""} - ${item.prix?.toLocaleString("fr-FR") || ""} FCFA`;
    const description = (item.description || `${typeLabel} ${offreLabel} à ${lieu || "Bamako"}. Contactez l'agence directement sur ImmoMali.`).slice(0, 200);
    const image = item.images?.[0] || `${url.origin}/preview-image.jpg`;

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)} | ImmoMali</title>
  <meta name="description" content="${escapeHtml(description)}" />
  <meta property="og:site_name" content="ImmoMali" />
  <meta property="og:type" content="product" />
  <meta property="og:title" content="${escapeHtml(title)}" />
  <meta property="og:description" content="${escapeHtml(description)}" />
  <meta property="og:image" content="${escapeHtml(image)}" />
  <meta property="og:url" content="${escapeHtml(url.href)}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(title)}" />
  <meta name="twitter:description" content="${escapeHtml(description)}" />
  <meta name="twitter:image" content="${escapeHtml(image)}" />
  <!-- Redirection pour le rare cas d'un humain qui atterrirait ici directement -->
  <meta http-equiv="refresh" content="0; url=${escapeHtml(url.href)}" />
</head>
<body>
  <p>Redirection vers <a href="${escapeHtml(url.href)}">${escapeHtml(title)}</a>...</p>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  } catch (err) {
    console.error("Erreur middleware pré-rendu OG:", err);
    return; // en cas d'erreur, ne pas bloquer la requête — laisser passer vers le SPA
  }
}
