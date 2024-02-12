const express = require('express');
const app = express();
app.use(express.static(__dirname + '/public'));
app.set('views', './views');
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
const cors = require('cors');
app.use(cors());

// accès aux variables d'environnement
var config = require('./.env')


const mysql = require('promise-mysql');

//import de nos routes
const userRoutes = require('./routes/userRoutes')
const authRoutes = require('./routes/authRoutes')
const CuveeRoutes = require('./routes/BoutiqueRoutes')

const host = process.env.HOST_DB || config.db.host;
const database = process.env.DATABASE_DB || config.db.database;
const user = process.env.USER_DB || config.db.user;
const password = process.env.PASSWORD_DB || config.db.password;

mysql.createConnection({
	host: host,
	database: database,
	user: user,
	password: password,
	authPlugin: 'caching_sha2_password'
}).then((db) => {
	console.log('connecté bdd');
	setInterval(async function () {
		let res = await db.query('SELECT 1');
	}, 10000);

	app.get('/', (req, res, next) => {
		res.json({ msg: 'Connecté au VN_back !', status: 200 })
	})

	//appel de nos routes
	userRoutes(app, db)
	authRoutes(app, db)
    CuveeRoutes(app, db)
})
	.catch(err => console.log(err))

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
	console.log('VN_BACK, En écoute sur le PORT : ' + PORT + ' du host : ' + host + '  user : ' + user + ' de la BDD : ' + database);
})