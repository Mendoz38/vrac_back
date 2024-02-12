
module.exports = (_db) => {
  db = _db;
  return cuveeModel;
};

class cuveeModel {
  
  //ajout d'un utilisateur ---OK---
  static async addOneBoutique(req) {

    //on sauvegarde la cuvée
	return db.query('INSERT INTO boutique (entreprise, adresse, adresse, telephone, mail) VALUES(?, ?, ?, ?, ?, ?, ?)', [req.body.domaine, req.body.domaine2, req.body.vigneron,req.body.cuvee, req.body.millesime, req.body.lot, req.body.nomImage])
	  .then((result) => {
        return { status: 200, msg: "Boutique  enregistrée !" };
      })
      .catch((err) => {
        console.log("err : ", err);
        return err;
      });
      
  }

  
}
