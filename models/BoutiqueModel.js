
module.exports = (_db) => {
  db = _db;
  return boutiqueModel;
};

class boutiqueModel {
  
  //Création d'une boutique
  static async addOneBoutique(req) {
	return db.query('INSERT INTO boutiques (nom_boutique, type, adresse, telephone, mail) VALUES(?, ?, ?, ?, ?)', [req.body.epicerie, req.body.type, req.body.adresse, req.body.telephone, req.body.mail])
	  .then((result) => {
        return { status: 200, msg: "Boutique  enregistrée !" };
      })
      .catch((err) => {
        console.log("err : ", err);
        return err;
      });
      
  }

	// Toutes les boutiques
	static async getAllBoutiques() {
		return db.query('SELECT * FROM boutiques ORDER BY id ASC')
			.then((result) => {
				return result
			})
			.catch((err) => {
				return err
			})
	}

	// Toutes les boutiques
	static async getOneBoutique(id) {
		return db.query('SELECT * FROM boutiques WHERE id = ?', [id])
			.then((result) => {
				return result
			})
			.catch((err) => {
				return err
			})
	}

	// Coordonnées étikette par id_boutique
	static async getCoordEtikette(id) {
		//return db.query('SELECT * FROM etikette WHERE id_boutique = ?', [id])

		return db.query('SELECT * FROM etikette WHERE id_boutique = ?', [id])
			.then((result) => {
				console.log("zzz", result)
				return result
			})
			.catch((err) => {
				return err
			})
	}


/*
    console.log("Model Boutique par id", id)
*/









  
}
