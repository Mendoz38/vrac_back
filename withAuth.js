const jwt = require("jsonwebtoken");
let secret = process.env.TOKEN_SECRET || config.token.secret;
// middleware permettant de contrôler la validité du token
const withAuth = (req, res, next) => {
    // on récupère les information du token stockées dans la partie headers de la requete axios
    const token = req.headers['x-access-token'];

    // si pas de token, c'est mort
    //console.log("Token dans withAuth : ", token)
    //console.log("secret dans withAuth : ", secret)

    jwt.verify(token, secret, (err, decode) => {
        //console.log("decode : ",decode);

        if (err) {
            //console.log("Erreur !!!", err);
            res.json({ status: 401, err: err });
        } else {
            req.id = decode.id;
            req.email = decode.email;
            console.log("ok !!!", req.id);
            next();
        }
    });
};

module.exports = withAuth;