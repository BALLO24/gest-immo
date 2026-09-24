import { useState, useEffect, useCallback } from "react";
import { estFavori, toggleFavori, getFavoris } from "./favoris";

// AJOUT : petit hook pour qu'un composant (carte, fiche détail) reste
// synchronisé avec l'état du favori sans avoir à répéter la logique de
// lecture/écriture localStorage partout où c'est utilisé.
export function useFavori(proprieteId) {
  const [favori, setFavori] = useState(() => estFavori(proprieteId));

  useEffect(() => {
    const majDepuisStockage = () => setFavori(estFavori(proprieteId));
    window.addEventListener("favoris-changed", majDepuisStockage);
    window.addEventListener("storage", majDepuisStockage);
    return () => {
      window.removeEventListener("favoris-changed", majDepuisStockage);
      window.removeEventListener("storage", majDepuisStockage);
    };
  }, [proprieteId]);

  const toggle = useCallback((e) => {
    e?.stopPropagation();
    setFavori(toggleFavori(proprieteId));
  }, [proprieteId]);

  return [favori, toggle];
}

// AJOUT : pour la page "Mes favoris" — liste réactive des IDs sauvegardés.
export function useListeFavoris() {
  const [liste, setListe] = useState(() => getFavoris());

  useEffect(() => {
    const maj = () => setListe(getFavoris());
    window.addEventListener("favoris-changed", maj);
    window.addEventListener("storage", maj);
    return () => {
      window.removeEventListener("favoris-changed", maj);
      window.removeEventListener("storage", maj);
    };
  }, []);

  return liste;
}
