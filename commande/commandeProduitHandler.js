import connectionPromise from "../model/connexion.js";

export const readCommandeProduitPopulated = async (id_commande) => {
  let connection = await connectionPromise;
  let result = await connection.all(
    `SELECT * FROM commande_produit
    INNER JOIN produit ON produit.id_produit = commande_produit.id_produit
    WHERE id_commande = ?`,
    [id_commande]
  );
  // ajoute prix_total = prix * quantite
  result.forEach((element) => {
    element.prix_total = (element.prix * element.quantite).toFixed(2);
  });
  return result;
};

export const readProduitInCommandeProduit = async (id_commande, id_produit) => {
  let connection = await connectionPromise;
  let result = await connection.get(
    `SELECT * FROM commande_produit WHERE id_commande = ? AND id_produit = ?`,
    [id_commande, id_produit]
  );
  return result;
};

export const createCommandeProduit = async (
  id_commande,
  id_produit,
  quantité
) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `INSERT INTO commande_produit(id_commande, id_produit, quantite) VALUES(?,?,?)`,
    [id_commande, id_produit, quantité]
  );
  return result.lastID;
};

export const deleteCommandeProduit = async (id_commande, id_produit) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `DELETE FROM commande_produit WHERE id_commande = ? AND id_produit = ?`,
    [id_commande, id_produit]
  );
  return result.changes;
};

export const updateCommandeProduit = async (
  id_commande,
  id_produit,
  quantité
) => {
  let connection = await connectionPromise;

  let result = await connection.run(
    `UPDATE commande_produit SET quantite = ? WHERE id_commande = ? AND id_produit = ?`,
    [quantité, id_commande, id_produit]
  );
  return result.changes;
};
