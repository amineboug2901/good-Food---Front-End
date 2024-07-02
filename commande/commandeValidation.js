/**
 * Valider l'ID du commande.
 * @param {number} id_commande L'ID du commande.
 */
export const isIDCommandeValid = (id_commande) => 
    typeof id_commande === 'number';

export const isIDEtatCommandeValid = (id_etat_commande) =>
    typeof id_etat_commande === 'number' && [1, 2, 3, 4].includes(id_etat_commande);
  
export const isDateCommandeValid = (date) => 
    typeof date === 'number' && date > 0;