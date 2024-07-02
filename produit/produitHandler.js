import connectionPromise from "../model/connexion.js";

export const readProduits = async () => {
  let connection = await connectionPromise;
  let produits = await connection.all("SELECT * FROM produit");
  return produits;
};