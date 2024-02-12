const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let config = require("../.env");

let secret = process.env.TOKEN_SECRET || config.token.secret;
const mail = require("../lib/mailing_inscription"); // librairie pour l'envoi de mail
const withAuth = require("../withAuth");

let api_url_back = process.env.api_url_back || config.api_url_back;
let api_url_front = process.env.api_url_front || config.api_url_front;

module.exports = (app, db) => {
  const userModel = require("../models/UserModel")(db);

// route pour vérifier le token du localstorage
  app.get('/api/v1/checkToken', withAuth, async (req, res, next)=>{
    console.log("user dans route checkToken: ",req.email)
    let user = await userModel.getUserByMail(req.email); 
    if(user.code){
        res.json({status:500, err: user})
    }
    res.json({status: 200, msg: "token valide ", user: user})
})

  //route de login ---OK---
  app.post("/api/v1/user/login", async (req, res, next) => {
    console.log("Connecté !");

    let user = await userModel.getUserByMail(req.body.email);
    console.log("-----------------");
    // vérifie si l'email est dans la BDD
    if (user.length === 0) {
      // console.log("Email inexistant dans la base de donnée")
      res.json({ status: 404, msg: "Email inexistant dans la base de donnée" });
    } else {
      // l'email est bien dans la BDD
      // compare le mot de passe rentré
      let same = await bcrypt.compare(req.body.pwd, user[0].pwd);
      if (same) {
        console.log("same", same);
        // le mot de passe est bon
        // crée les infos pour les stocker dans le store de redux
        let infos = { id: user[0].id, email: user[0].mail };
        let token = jwt.sign(infos, secret);
        console.log("Connecté !");
        res.json({ status: 200, msg: "Connecté", token: token, user: user[0] });
      } else {
        // le mot de passe n'est pas bon
        console.log("Mauvais mot de passe", same);
        res.json({ status: 401, msg: "Mauvais mot de passe" });
      }
    }
  });

  //route d'ajout d'un utilisateur ---OK---
  app.post("/api/v1/user/add", async (req, res, next) => {
     console.log("XXXXXXXXXroute d'ajout d'un utilisateur")
    //sauvegarde d'un utilisateur (la colonne validate sera no par defaut)
    let result = await userModel.saveOneUser(req);
    if (result.code) {
      res.json({ status: 500, msg: "echec requète", err: result });
    }

    if (result.status === 501) {
      res.json(result);
    } else {
      //envoi d'un mail (avec un lien a qui pointe vers la route api de validation par le key_id)
      mail(
        req.body.mail,
        "Validation de votre compte sur vinsnaturels.fr ",
        req.body.mail,
        'Pour finaliser votre inscription, vous devez valider votre mail, en cliquant sur <a href="' +
          api_url_back +
          "/api/v1/user/validate/" +
          result.key_id +
          '">ce lien<a/> !'
      );
      res.json({ status: 200, msg: "Utilisateur enregistré" });
      console.log("msg", res.status);
    }
  });

  // route de modification de l'user
  app.put('/api/v1/user/update', withAuth, async (req, res, next) => {
    console.log("route de modification du profil de l'utilisateur")
    let result = await userModel.updateUser(req, req.body.id);
    console.log("zzzzzzz", result)
    console.log("code", result.code)
    console.log("status", result.status)
    console.log("msg", result.msg)
    if (result.code) {
        res.json({ status: 500, err: result });
    }
    res.json({ status: 200, msg: 'Profil modifié !', results: { result: result.msg } })
    console.log("result", result.msg)
})



  //route de validation d'un utilisateur (par son key_id) ---OK---
  app.get("/api/v1/user/validate/:key_id", async (req, res, next) => {
    let key_id = req.params.key_id;
    console.log("key_id dans route", key_id);
    //on update la colonne validate de no à yes
    let validate = await userModel.updateValidateUser(key_id);

    if (validate.code) {
      res.json({ status: 500, msg: "probleme", error: validate });
    }

    res.redirect("http://localhost:3000/Login/Validate");
    //res.render('validate', { key_id: key_id, msg: "ok", error: null })
    //res.json({status: 200, msg:"compte utilisateur validé"})
  });

  //route de demande de récupération de mot de pass oublié ---OK---
  app.post("/api/v1/user/forgot", async (req, res, next) => {
    //console.log("demande de récupération de mot de pass oublié")

    // on vérifie que l'email soit dans le BDD
    let user = await userModel.getUserByMail(req.body.email);
    console.log("-----------------");
    // vérifie si l'email est dans la BDD
    if (user.length === 0) {
      console.log("Email inexistant dans la base de donnée");
      res.json({ status: 404, msg: "Email inexistant dans la base de donnée" });
    } else {
      let result = await userModel.updateKeyId(req.body.email);
      console.log("updateKeyId");

      if (result.code) {
        console.log("result.code", result.code);
        res.json({
          status: 500,
          msg: "nous n'avons pas pu envoyer un email",
          error: result,
        });
      }
      let key_id = result.key_id;
      mail(
        req.body.email,
        "Demande de réinitialisation de mot de passe",
        "Mot de passe oublié ?",
        'Vous avez demandé de réinitialiser votre mot de passe, cliquez <a href="' +
          api_url_back +
          "/changePassword/" +
          key_id +
          '">ici pour le réinitialiser<a/> !'
      );
      res.json({ status: 200, msg: "email envoyé" });
      console.log("email envoyé", res.msg);
    }
  });

  //route d'affichage du template de modification de password (ejs) ---OK---
  app.get("/changePassword/:key_id", async (req, res, next) => {
    let key_id = req.params.key_id;
    let result = await userModel.checkKeyId(key_id);

    if (result.status === 401) {
      res.render("forgot", {
        key_id: key_id,
        msg: "probleme",
        error: "Mot de passe déjà réinitialisé",
      });
    } else {
      res.render("forgot", { key_id: key_id, msg: "ok", error: null });
    }
  });

  //route de modification du mot de passe ---OK---
  app.post("/changePassword/:key_id", async (req, res, next) => {
    let key_id = req.params.key_id;
    if (req.body.password1 !== req.body.password2) {
      error = "Vos deux mots de passe ne sont pas identique !";
    } else if (req.body.password1.length < 6) {
      error = "Votre mot de passe doit avoir au moins 6 caractères";
    } else {
      // on modifie le mot de passe
      let result = await userModel.updatepassword(req.body.password1, key_id);
      if (result.code) {
        error = "Le mot de passe n'a pas pu être modifié !";
      } else {
        // on modifie également la key_id pour ne pas qu'il réutilise le mail de changement de password
        console.log("updateKeyIdMDP", key_id);
        let result2 = await userModel.updateKeyIdMDP(key_id);
        if (result2.code) {
          error = "La key_id n'a pas pu être modifié !";
        } else {
          error = "Votre mot de passe est modifié !";
        }
      }
    }
    res.render("forgot", { key_id: key_id, msg: "ok", error: error });
  });

  // Tous les users(Pour l'admin, pas encore utilisé)
  app.get("/api/v1/user/all", async (req, res, next) => {
    console.log("Dans getAllUsers BACKKKK");
    let users = await userModel.getAllUsers();
    if (users.code) {
      res.json({ status: 500, err: users });
    }
    res.json({ status: 200, users: users });
  });
};
