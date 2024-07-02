import "dotenv/config";
import express, { json, request, response } from "express";
import { engine } from "express-handlebars";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

import {
  isIDProduitValid,
  isQuantiteProduitValid,
} from "./produit/produitValidation.js";
import {
  isDateCommandeValid,
  isIDEtatCommandeValid,
} from "./commande/commandeValidation.js";
import { readProduits } from "./produit/produitHandler.js";
import {
  readCartIDOrCreateNewCart,
  readCommandesPopulated,
  updateCommande,
  deleteCommande,
} from "./commande/commandeHandler.js";
import {
  readCommandeProduitPopulated,
  readProduitInCommandeProduit,
  createCommandeProduit,
  deleteCommandeProduit,
  updateCommandeProduit,
} from "./commande/commandeProduitHandler.js";

import { CreateSampleProducts } from "./model/sampleDB.js";
import connectionPromise from "./model/connexion.js";
import { calculCartItemsLength, calculTotal } from "./commande/utils.js";

// Création du serveur web
let app = express();

//Creation de l'engine dans Express avec des helpers
app.engine(
  "handlebars",
  engine({
    helpers: {
      ifEquals: function (arg1, arg2, options) {
        return arg1 == arg2 ? options.fn(this) : options.inverse(this);
      },
      ifNotEquals: function (arg1, arg2, options) {
        return arg1 != arg2 ? options.fn(this) : options.inverse(this);
      },
    },
  })
);

//Mettre l'engine handlebars comm engin de rendu
app.set("view engine", "handlebars");

//Confuguration de handlebars
app.set("views", "./views");

// Ajout de middlewares
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(json());
app.use(express.static("public"));

// Programmation de routes
// Route pour visualiser le menu du restaurant
app.get("/", async (request, response) => {
  response.render("menu", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/menu.js"], // Updated script name
    produits: await readProduits(),
    nbAchats: await calculCartItemsLength(await readCartIDOrCreateNewCart()),
  });
});

// Route pour réviser et soumettre la panier
app.get("/panier", async (request, response) => {
  response.render("panier", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/panier.js"], // Updated script name
    produits: await readCommandeProduitPopulated(
      await readCartIDOrCreateNewCart()
    ),
    total: (await calculTotal(await readCartIDOrCreateNewCart())).toFixed(2),
    nbAchats: await calculCartItemsLength(await readCartIDOrCreateNewCart()),
  });
});

// Route pour voir toutes les commandes soumises
app.get("/commandes", async (request, response) => {
  response.render("commandes", {
    // Updated route name and template
    titre: "Good Food", // Updated project title
    h1: "Good Food", // Updated project title
    styles: ["/css/general.css"],
    scripts: ["/js/commandes.js"], // Updated script name
    commandes: await readCommandesPopulated(),
    nbAchats: await calculCartItemsLength(await readCartIDOrCreateNewCart()),
  });
});

// Routes pour l'API
// Route pour ajouter un produit au panier
app.post("/api/panier", async (request, response) => {
  const { id_produit, quantity } = request.body;
  if (!(isIDProduitValid(id_produit) && isQuantiteProduitValid(quantity))) {
    response.sendStatus(400);
    return;
  }
  console.log(
    `[POST] - /api/panier - ${new Date()}: Ajout du produit ${id_produit} au panier`
  );
  let id_commande = await readCartIDOrCreateNewCart();
  let produit = await readProduitInCommandeProduit(id_commande, id_produit);
  if (produit) {
    await updateCommandeProduit(
      id_commande,
      id_produit,
      produit.quantite + quantity
    );
  } else {
    await createCommandeProduit(id_commande, id_produit, quantity);
  }
  response.sendStatus(201);
});

// Route pour mettre a jour ou supprimer les produits du panier
app.put("/api/panier", async (request, response) => {
  const { id_produit, quantite } = request.body;
  if (!(isIDProduitValid(id_produit) && isQuantiteProduitValid(quantite))) {
    response.sendStatus(400);
    return;
  }
  console.log(
    `[PUT] - /api/panier - ${new Date()}: Mise a jour du quantité du produit ${id_produit}`
  );
  let id_commande = await readCartIDOrCreateNewCart();
  let produit = await readProduitInCommandeProduit(id_commande, id_produit);
  if (!produit) {
    console.log(`[PUT] - /api/panier - ${new Date()}: Produit non trouvé`);
    response.sendStatus(404);
    return;
  }

  if (quantite > 0) {
    await updateCommandeProduit(id_commande, id_produit, quantite);
  } else {
    await deleteCommandeProduit(id_commande, id_produit);
  }
  response.sendStatus(200);
});

// Route pour supprimer le panier
app.delete("/api/panier", async (request, response) => {
  console.log(`[DELETE] - /api/panier - ${new Date()}: Suppression du panier`);
  let id_commande = await readCartIDOrCreateNewCart();
  await deleteCommande(id_commande);
  response.sendStatus(200);
});

// Route pour mettre a jour l'etat d'un commande
app.put("/api/commande", async (request, response) => {
  let { id_commande, id_etat_commande, date } = request.body;
  if (
    !(
      isIDEtatCommandeValid(id_etat_commande) &&
      id_etat_commande != 1 &&
      isDateCommandeValid(date)
    )
  ) {
    response.sendStatus(400);
    return;
  }
  console.log(
    `[POST] - /api/panier/commande - ${new Date()}: Mise a jour de l'etat de la commande vers etat ${id_etat_commande}`
  );
  if (!id_commande) {
    id_commande = await readCartIDOrCreateNewCart();
  }
  if ((await calculCartItemsLength(id_commande)) == 0) {
    response.sendStatus(400);
    return;
  }
  await updateCommande(id_commande, id_etat_commande, date);

  response.sendStatus(200);
});

// Démarrage du serveur
app.listen(process.env.PORT);
console.log("Serveur démarré: http://localhost:" + process.env.PORT);

/**
 * Initialisation de la base de données
 */

if (process.env.SAMPLE_DB && process.env.SAMPLE_DB === "true") {
  let produits = await readProduits();
  if (produits.length > 0) {
    console.log(
      "SAMPLE_DB: Skipping initialisation. Ignorer l'initialisation. La base de données est déjà initialisée."
    );
  } else {
    CreateSampleProducts(connectionPromise);
  }
}
