// AJOUT : favoris — le site n'a pas de compte visiteur (seuls les
// agences/admins ont un compte), donc pas question d'exiger une inscription
// juste pour sauvegarder un bien. Stockage entièrement côté navigateur : pas
// de compte nécessaire, mais les favoris restent propres à cet appareil et
// ce navigateur (pas de synchronisation entre appareils, c'est le
// compromis assumé de cette approche).
const STORAGE_KEY = "immomali-favoris";

function lireFavoris() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function ecrireFavoris(liste) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(liste));
    // AJOUT : notifie les autres composants montés (ex: le cœur d'une carte
    // et le compteur dans la Navbar) qu'un favori a changé — localStorage
    // ne déclenche nativement un événement "storage" que dans les AUTRES
    // onglets, jamais dans l'onglet qui vient d'écrire lui-même.
    window.dispatchEvent(new Event("favoris-changed"));
  } catch {
    // Stockage plein ou désactivé (navigation privée stricte) — on abandonne
    // silencieusement plutôt que de casser l'interaction de la personne.
  }
}

export function estFavori(proprieteId) {
  return lireFavoris().includes(proprieteId);
}

export function getFavoris() {
  return lireFavoris();
}

export function toggleFavori(proprieteId) {
  const liste = lireFavoris();
  const index = liste.indexOf(proprieteId);
  if (index === -1) {
    liste.push(proprieteId);
  } else {
    liste.splice(index, 1);
  }
  ecrireFavoris(liste);
  return index === -1; // true si vient d'être ajouté, false si retiré
}

export function retirerFavori(proprieteId) {
  ecrireFavoris(lireFavoris().filter((id) => id !== proprieteId));
}
