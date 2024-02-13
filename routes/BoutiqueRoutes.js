
let config = require("../.env");

const withAuth = require("../withAuth");

console.log("XXXXXXXXXroute ddes boutiques")

module.exports = (app, db) => {
  const boutiqueModel = require("../models/BoutiqueModel")(db);

  //route d'ajout d'une boutique ---OK---
  app.post("/api/etikette/boutique/add", async (req, res, next) => {
     console.log("XXXXXXXXXroute d'ajout d'une boutique")
    let result = await boutiqueModel.addOneBoutique(req);
    console.log("result", result)

    if (result.status === 501) {
      res.json(result);
    } else {

      res.json({ status: 200, msg: "Cuvée enregistré" });
      console.log("msg", result.status);
    }
    
  });

	// Toutes les boutiques
	app.get('/api/etikette/boutique/all', async (req, res, next) => {
		let boutiques = await boutiqueModel.getAllBoutiques();
		if (boutiques.code) {
			res.json({ status: 500, err: boutiques });
		}
		res.json({ status: 200, boutiques: boutiques });
	})

	// Boutique par id
	app.get('/api/etikette/boutique/one/:id', async (req, res, next) => {
		let boutiques = await boutiqueModel.getOneBoutique(req.params.id);
		if (boutiques.code) {
			res.json({ status: 500, err: boutiques });
		}
		res.json({ status: 200, boutiques: boutiques });
	})

	// Coordonnées étikette par id_boutique
	app.get('/api/etikette/boutique/coord/:id', async (req, res, next) => {
    console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzz", req.params.id)
		let boutiques = await boutiqueModel.getCoordEtikette(req.params.id);
		if (boutiques.code) {
			res.json({ status: 500, err: boutiques });
		}
		res.json({ status: 200, boutiques: boutiques });
	})



      
};

/*
    console.log("Route Boutique par id", req.params.id)
*/