import { readCommandeProduitPopulated } from "./commandeProduitHandler.js"

export const calculTotal = async (id_commande) => {
  const produits = await readCommandeProduitPopulated(id_commande);
  let total = 0;
  for (let produit of produits) {
    total += produit.prix * produit.quantite;
  }
  return total;
}

export const calculCartItemsLength = async (id_commande) => {
  const produits = await readCommandeProduitPopulated(id_commande);
  console.log(produits);
  return produits.length;
}