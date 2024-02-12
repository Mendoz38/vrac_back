
let config = require("../.env");

const withAuth = require("../withAuth");

console.log("XXXXXXXXXroute ddes boutiques")

module.exports = (app, db) => {
  const cuveeModel = require("../models/BoutiqueModel")(db);

  //route d'ajout d'une boutique ---OK---
  app.post("/api/etikette/boutique/add", async (req, res, next) => {
     console.log("XXXXXXXXXroute d'ajout d'une boutique")
    let result = await cuveeModel.addOneBoutique(req);
    console.log("result", result)

    if (result.status === 501) {
      res.json(result);
    } else {

      res.json({ status: 200, msg: "Cuvée enregistré" });
      console.log("msg", result.status);
    }
    
  });



      
};
