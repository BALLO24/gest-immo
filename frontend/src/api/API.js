const API_URL = import.meta.env.VITE_API_URL;

// AJOUT : centralise ce qui était dupliqué dans quasiment chaque fonction
// (récupération du token, en-têtes, sérialisation du body, gestion des
// erreurs réseau). IMPORTANT : cette fonction ne change PAS le contrat de
// l'API — elle renvoie un objet qui se comporte comme une Response standard
// (.ok, .status, .json()), donc chaque fonction ci-dessous garde exactement
// sa logique de traitement actuelle (if (response.ok)..., throw..., etc.)
// sans qu'aucun composant appelant n'ait besoin d'être modifié.
async function request(path, { method = "GET", body, isFormData = false, auth = true } = {}) {
  const headers = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = localStorage.getItem("authToken");
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }
  try {
    return await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : isFormData ? body : JSON.stringify(body),
    });
  } catch (networkError) {
    // AJOUT : fetch a échoué avant même d'obtenir une réponse (pas de réseau,
    // CORS, DNS, timeout...). Avant, ce cas n'était géré nulle part sauf dans
    // deleteHabitation — ailleurs, ça remontait comme une exception non
    // gérée. On imite ici la forme d'une Response en échec pour que le code
    // existant (response.ok / response.json()) continue de fonctionner tel quel.
    console.error(`Erreur réseau sur ${method} ${path} :`, networkError);
    return {
      ok: false,
      status: 0,
      json: async () => ({ message: "Impossible de contacter le serveur. Vérifiez votre connexion." }),
    };
  }
}

export default {
  //API pour l'authentification des agences
  async login(credentials) {
    const response = await request("/auth/login", { method: "POST", body: credentials, auth: false });
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Échec de la connexion" };
    }
  },

  async register(agenceData) {
    // CORRIGÉ : retiré le délai artificiel de 800ms (reliquat de maquette),
    // qui ralentissait inutilement chaque inscription en production.
    const response = await request("/auth/register", { method: "POST", body: agenceData, auth: false });
    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      const errorData = await response.json();
      return { success: false, error: errorData.message || "Échec de l'inscription" };
    }
  },

  /*****************API pour les propriétés**************************/
  async addHabitation(habitationData) {
    const response = await request("/proprietes/new", { method: "POST", body: habitationData, isFormData: true });
    if (!response.ok) return false;
    const result = await response.json();
    return result.success === true;
  },

  async getHabitations(filtre) {
    const response = await request("/proprietes", { method: "POST", body: filtre, auth: false });
    if (response.ok) {
      return await response.json();
    } else {
      // Si 401 ou 403, tu pourrais rediriger vers login ici
      return [];
    }
  },

  // AJOUT : détail d'un bien par id — n'existait pas côté frontend (l'endpoint
  // backend GET /proprietes/:id existe depuis l'ajout de getProprieteById).
  // Incrémente le compteur de vues côté serveur.
  async getProprieteById(proprieteId) {
    const response = await request(`/proprietes/${proprieteId}`, { auth: false });
    if (response.ok) {
      const data = await response.json();
      return data.propriete || null;
    }
    return null;
  },

  async getHabitationsByAgence(agenceId, { includeDeleted = false } = {}) {
    // AJOUT : includeDeleted permet au dashboard d'une agence de voir aussi
    // ses annonces archivées (soft delete), sans impacter l'appel existant
    // qui continue de fonctionner à l'identique par défaut.
    const qs = includeDeleted ? "?includeDeleted=true" : "";
    const response = await request(`/proprietes/agence/${agenceId}${qs}`);
    if (response.ok) {
      const data = await response.json();
      return data.proprietes; // le backend renvoie { proprietes: [...] }
    } else {
      return [];
    }
  },

  async updateHabitation(habitationId, updatedData) {
    const response = await request(`/proprietes/update/${habitationId}`, { method: "PUT", body: updatedData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour");
    }
    return await response.json();
  },

  async deleteHabitation(habitationId) {
    const response = await request(`/proprietes/delete/${habitationId}`, { method: "DELETE" });
    if (!response.ok) return false;
    return await response.json();
  },

  // AJOUT : restaurer un bien archivé par erreur (endpoint backend existant,
  // pas encore exposé côté frontend)
  async restaurerPropriete(proprieteId) {
    const response = await request(`/proprietes/restaurer/${proprieteId}`, { method: "PUT" });
    if (!response.ok) return false;
    return await response.json();
  },

  //  *****************API pour les agences**************************
  async addAgence(agenceData) {
    const response = await request("/agences/new", { method: "POST", body: agenceData });
    return await response.json();
  },

  async getAllAgences() {
    const response = await request("/agences");
    if (response.ok) {
      const data = await response.json();
      return data.agences;
    } else {
      return [];
    }
  },

  // AJOUT : détail d'une agence + son compte de connexion (endpoint existant,
  // utile pour préremplir un formulaire d'édition complet)
  async getAgenceById(agenceId) {
    const response = await request(`/agences/${agenceId}`);
    if (response.ok) return await response.json();
    return null;
  },

  async updateAgence(agenceId, updatedData) {
    const response = await request(`/agences/update/${agenceId}`, { method: "PUT", body: updatedData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour");
    }
    return await response.json();
  },

  async deleteAgence(agenceId) {
    const response = await request(`/agences/delete/${agenceId}`, { method: "DELETE" });
    if (!response.ok) return false;
    return await response.json();
  },

  // *************************API pour les villes**************************
  async addVille(villeData) {
    // CORRIGÉ : retiré le délai artificiel de 800ms.
    const response = await request("/villes/new", { method: "POST", body: villeData });
    return await response.json();
  },

  async getVilles() {
    const response = await request("/villes", { auth: false });
    if (response.ok) {
      const data = await response.json();
      return data.villes;
    } else {
      return [];
    }
  },

  // AJOUT : mettre à jour une ville (endpoint backend existant, absent du frontend)
  async updateVille(villeId, updatedData) {
    const response = await request(`/villes/update/${villeId}`, { method: "PUT", body: updatedData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour");
    }
    return await response.json();
  },

  async deleteVille(villeId) {
    const response = await request(`/villes/delete/${villeId}`, { method: "DELETE" });
    if (!response.ok) return false;
    return await response.json();
  },

  // *************************API pour les quartiers**************************
  async addQuartier(quartierData) {
    const response = await request("/quartiers/new", { method: "POST", body: quartierData });
    return await response.json();
  },

  async getQuartiers() {
    const response = await request("/quartiers", { auth: false });
    if (response.ok) {
      const data = await response.json();
      return data.quartiers;
    } else {
      return [];
    }
  },

  // AJOUT : quartiers d'une seule ville (endpoint backend existant, pratique
  // pour un menu en cascade ville -> quartier sans filtrer côté client)
  async getQuartiersByVille(villeId) {
    const response = await request(`/quartiers/ville/${villeId}`, { auth: false });
    if (response.ok) {
      const data = await response.json();
      return data.quartiers;
    }
    return [];
  },

  async updateQuartier(quartierId, updatedData) {
    const response = await request(`/quartiers/update/${quartierId}`, { method: "PUT", body: updatedData });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Erreur lors de la mise à jour");
    }
    return await response.json();
  },

  async deleteQuartier(quartierId) {
    const response = await request(`/quartiers/delete/${quartierId}`, { method: "DELETE" });
    if (!response.ok) return false;
    return await response.json();
  },

  // *************************API pour le mot de passe**************************
  // AJOUT : n'existait pas — c'était impossible pour une agence connectée de
  // consulter ou modifier son propre profil (contact public, adresse...)
  // sans passer par un admin. Branché sur GET/PUT /api/auth/profile.
  async getProfile() {
    const response = await request("/auth/profile");
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  },

  async updateProfile(profileData) {
    const response = await request("/auth/profile", { method: "PUT", body: profileData });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Erreur lors de la mise à jour du profil" };
    }
    return { success: true, message: result.message };
  },

  async changePassword(ancienMotDePasse, nouveauMotDePasse) {
    const response = await request("/auth/profile/password", {
      method: "PUT",
      body: { ancienMotDePasse, nouveauMotDePasse },
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Erreur lors du changement de mot de passe" };
    }
    return { success: true, message: result.message };
  },

  // *************************API pour le contact**************************
  // AJOUT : remplace l'ancienne route ouverte /send-mail (voir contact.controller.js)
  async contacterSupport({ nom, email, message }) {
    const response = await request("/contact/support", { method: "POST", body: { nom, email, message }, auth: false });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Erreur lors de l'envoi du message" };
    }
    return { success: true, message: result.message };
  },

  async contacterAgence(agenceId, { nom, email, message }) {
    const response = await request(`/contact/agence/${agenceId}`, {
      method: "POST",
      body: { nom, email, message },
      auth: false,
    });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Erreur lors de l'envoi du message" };
    }
    return { success: true, message: result.message };
  },

  // *************************API pour l'administration**************************
  // AJOUT : corbeille admin (toutes agences confondues) et purge définitive —
  // purgerPropriete existait côté backend depuis longtemps, jamais exposé ici.
  async getCorbeilleAdmin() {
    const response = await request("/proprietes/admin/corbeille");
    if (response.ok) {
      const data = await response.json();
      return data.proprietes;
    }
    return [];
  },

  async purgerPropriete(proprieteId) {
    const response = await request(`/proprietes/purger/${proprieteId}`, { method: "DELETE" });
    if (!response.ok) return false;
    return await response.json();
  },

  // AJOUT : liste de tous les comptes de connexion (admins + agences),
  // absent jusqu'ici — la sidebar promettait ce lien sans la moindre page derrière.
  async getAllUsers() {
    const response = await request("/users");
    if (response.ok) {
      const data = await response.json();
      return data.users;
    }
    return [];
  },

  async updateUserStatut(userId, statut) {
    const response = await request(`/users/${userId}/statut`, { method: "PUT", body: { statut } });
    const result = await response.json();
    if (!response.ok) {
      return { success: false, error: result.message || "Erreur lors de la mise à jour du statut" };
    }
    return { success: true, message: result.message, user: result.user };
  },

  // AJOUT : statistiques du dashboard admin (page d'accueil, jusqu'ici un
  // simple message de bienvenue sans aucune donnée réelle).
  async getStats() {
    const response = await request("/stats");
    if (response.ok) return await response.json();
    return null;
  },
};
