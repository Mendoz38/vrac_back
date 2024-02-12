const bcrypt = require('bcryptjs');
const saltRounds = 10;
const jwt = require('jsonwebtoken');
let config = require('../.env')
let secret = process.env.TOKEN_SECRET || config.token.secret;
const withAuth = require('../withAuth')


module.exports = (app, db) => {
    const userModel = require('../models/UserModel')(db);

    app.get('/api/v1/checkToken', withAuth, async (req, res, next) => {
        let user = await userModel.getUserByMail(req.email);
        // console.log("user : ",user);
        if (user.code) {
            res.json({ status: 500, err: user })
        }
        res.json({ status: 200, msg: "token valide ", user: user })
    })

}