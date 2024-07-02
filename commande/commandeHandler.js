import connectionPromise from "../model/connexion.js";

export const readCartIDOrCreateNewCart = async () => {
  // get commande with id_etat_commande = 1 or create new one
  let connection = await connectionPromise;
  let commande = await connection.get(
    `SELECT * FROM commande WHERE id_etat_commande = 1`
  );
  if (commande) {
    return commande.id_commande;
  } else {
    let result = await connection.run(
      `INSERT INTO commande(id_etat_commande) VALUES(1)`
    );
    return result.lastID;
  }
};

export const readCommandesPopulated = async () => {
  let connection = await connectionPromise;
  let commandes = await connection.all(
    `
    SELECT
        c.id_commande,
        c.id_utilisateur,
        c.id_etat_commande,
        ec.nom,
        datetime(c.date/1000, 'unixepoch', 'localtime') AS date,
        GROUP_CONCAT(pp.nom_produit) AS noms_produits,
        GROUP_CONCAT(pp.prix_total) AS totaux_produits,
        GROUP_CONCAT(pp.quantite) AS quantites_produits
    FROM commande c
    INNER JOIN etat_commande ec ON ec.id_etat_commande = c.id_etat_commande
    INNER JOIN (
        SELECT
            cp.id_commande,
            p.nom AS nom_produit,
            p.prix * cp.quantite AS prix_total,
            cp.quantite AS quantite
        FROM commande_produit cp
        INNER JOIN produit p ON p.id_produit = cp.id_produit
    ) AS pp ON c.id_commande = pp.id_commande
    WHERE c.id_etat_commande != 1
    GROUP BY c.id_commande, c.id_utilisateur, c.id_etat_commande, date, ec.nom
    ORDER BY c.id_commande DESC;
`
  );
  commandes.forEach((element) => {
    // make a new and put nom_produit and prix_total in it
    let total = 0;
    let produits = [];
    let noms_produits = element.noms_produits.split(",");
    let totaux_produits = element.totaux_produits.split(",");
    let quantites_produits = element.quantites_produits.split(",");
    for (let i = 0; i < noms_produits.length; i++) {
      let t = parseFloat(totaux_produits[i]);
      let q = parseInt(quantites_produits[i]);
      produits.push({
        nom: noms_produits[i],
        total: t.toFixed(2),
        quantite: q,
      });
      total += (t * q);
      console.log(total);
    }
    element.produits = produits;
    element.total = total.toFixed(2);
  });
  console.log(commandes);
  return commandes;
};

export const updateCommande = async (id_commande, id_etat_commande, date) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `UPDATE commande SET id_etat_commande = ?, date = ?  WHERE id_commande = ?`,
    [id_etat_commande, date, id_commande]
  );
  console.log(result);
  return result.changes;
};

export const deleteCommande = async (id_commande) => {
  let connection = await connectionPromise;
  let result = await connection.run(
    `DELETE FROM commande_produit WHERE id_commande = ?`,
    [id_commande]
  );
  console.log(result);
  result = await connection.run(`DELETE FROM commande WHERE id_commande = ?`, [
    id_commande,
  ]);
  console.log(result);
  return result.changes;
};
