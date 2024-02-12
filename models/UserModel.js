const bcrypt = require("bcryptjs");
const saltRounds = 10;
let randomId = require("random-id");
let len = 30;
let pattern = "aA0";

module.exports = (_db) => {
  db = _db;
  return UserModel;
};

class UserModel {
  // Selectionner l'user par son mail pour le login ---OK---
  static async getUserByMail(mail) {
    //console.log("req.body.mail : ", mail);
    let user = await db.query("SELECT * FROM membres WHERE mail = ?", [
      mail,
    ]);
    //console.log("user : ", user[0].pwd)
    return user;
  }

  //ajout d'un utilisateur ---OK---
  static async saveOneUser(req) {
    //on hash le password
    let hash = await bcrypt.hash(req.body.password, saltRounds);
    //on génère un id personalisé
    let key_id = randomId(len, pattern);
    console.log("key_id :", key_id)

    // checke si le mail existe déjà dans la BDD
    console.log("mail", req.body.mail);
    let user = await db.query("SELECT * FROM membres WHERE mail = ?", [
      req.body.mail,
    ]);
    console.log("user.length", user.length);
    if (user.length > 0) {
      console.log("Email déjà utilisé");
      return { status: 501, msg: "Email déjà utilisé" };
    }
    //on sauvegarde l'utilisateur
	return db.query('INSERT INTO membres (nom, prenom, mail, pwd, membre_grade, date_inscription, validate, key_id, profession, entreprise) VALUES(?, ?, ?, ?, "3", NOW(), "no", ?, ?, ?)', [req.body.nom, req.body.prenom, req.body.mail, hash, key_id, req.body.profession, req.body.entreprise])
	  .then((result) => {
        //on retourne l'objet de reponse reussit en lui rajoutant le key_id
        result.key_id = key_id;
        //console.log("key_id : ", key_id)
        return { status: 200, msg: "Utilisateur enregistré !", key_id: key_id };
      })
      .catch((err) => {
        console.log("err : ", err);
        return err;
      });
  }

  // Validation via adresse key_id ---OK---
  static async updateValidateUser(key_id) {
    console.log("key_id dans model", key_id);
    let user = await db.query(
      'UPDATE membres SET validate = "yes" WHERE key_id = ?',
      [key_id]
    );
    console.log("user : ", user);
    return user;
  }

  // checke si la key_id existe déjà dans la BDD lors de la demande de réinitialisation du mot de passe ---OK---
  static async checkKeyId(key_id) {
    let check = await db.query("SELECT * FROM membres WHERE key_id = ?", [
      key_id,
    ]);
    console.log("checkKeyId check.length", check.length);
    let error = null;
    let ok = null;
    if (check.length === 0) {
      return { status: 401, msg: "key_id n'existe pas", ok: ok, error: error };
    } else {
      return { status: 501, msg: "key_id existe bien !", ok: ok, error: error };
    }
  }

  // Selectionne la key_id via le mail de l'utilisateur ---OK---
  static async selectKeyId(mail) {
    console.log("Dans Model : selectKeyId pour", mail);
    let result = await db.query(
      "SELECT key_id FROM membres WHERE mail = ?",
      [mail, mail]
    );
    //		let result = { key_id: key_id }
    console.log("Dans Model :  result", result);
    return result;
  }

  // Mise à jour de la key_id via mail ---OK---
  static async updateKeyId(mail) {
    let key_id = randomId(len, pattern);
    let user = await db.query(
      "UPDATE membres SET key_id = ? WHERE mail = ?",
      [key_id, mail]
    );
    let result = { key_id: key_id, user: user };
    return result;
  }

  // Mise à jour de la key_id lors d'un changement de mot de passe ---OK---
  static async updateKeyIdMDP(key_id) {
    console.log("Ancienne key_id", key_id);
    let new_key_id = randomId(len, pattern);
    console.log("new_key_id key_id", new_key_id);
    let user = await db.query(
      "UPDATE membres SET key_id = ? WHERE key_id = ?",
      [new_key_id, key_id]
    );
    let result = { key_id: key_id, user: user };
    return result;
  }

  // Mise à jour du mot de passe ---OK---
  static async updatepassword(newPassword, key_id) {
    //on crypte le password
    let hash = await bcrypt.hash(newPassword, saltRounds);
    let result = await db.query(
      "UPDATE membres SET pwd = ? WHERE key_id = ?",
      [hash, key_id]
    );
    console.log("Mot de passe modifié !");
    return result;
  }


	// Mise à jour du profil de l'utilisateur XXXXXXXXX A REVOIR XXXXXXXXXXXXXXXXXXX
	static async updateUser(req, id) {
		return db.query('UPDATE membres SET nom = ?, prenom = ?, mail = ?, profession = ?, entreprise = ?, ville = ?, pays = ?, description = ? WHERE id = ?', [req.body.nom, req.body.prenom, req.body.mail, req.body.profession, req.body.entreprise, req.body.ville, req.body.pays, req.body.description, req.body.id])
			.then((result) => {
        return { status: 200, msg: "Utilisateur modifié !" };
			})
			.catch((err) => {
				return err
			})
	}

  // Tous les users (Pour l'admin, pas encore utilisé)
  static async getAllUsers() {
    return db
      .query("SELECT * FROM membres ")
      .then((result) => {
        return result;
      })
      .catch((err) => {
        return err;
      });
  }
}
