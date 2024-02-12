const nodeMailer = require('nodemailer');
const fs = require('fs');
const hogan = require('hogan.js');
const inlineCss = require('inline-css');

config = require('../.env')

let mail = config.auth.user;
let pass = config.auth.pass;
let privateKey = config.dkim.privateKey;

//module d'envoi de mail grace à la librairie nodeMailer
module.exports = (mailTo, subject, title, text) => {

  //on crée le chemin de connexion au serveur mail
  let transporter = nodeMailer.createTransport({
    host: 'smtp.ionos.fr',
    port: 465,
    secure: true,
    auth: {
      user: mail,
      pass: pass
    },
    dkim: {
      domainName: "vinsnaturels.fr",
      keySelector: "rsa",
      privateKey: privateKey
    }

  });


  (async function(){
    try {
        
  //Load the template file
  const templateFile = fs.readFileSync("./lib/template/template.html");
  //Load and inline the style
  const templateStyled = await inlineCss(templateFile.toString(), { url: "file://" + __dirname + "/template/" });
  console.log("templateStyled", templateStyled)
  //Inject the data in the template and compile the html
  const templateCompiled = hogan.compile(templateStyled);
  
  const templateRendered = templateCompiled.render({ text:  text });

  let mailOptions = {
    from: '"[Vinsnaturels.fr] noreply@vinsnaturels.fr', // sender address
    to: mailTo, // list of receivers
    subject: subject, // Subject line
    html: templateRendered,
  };
  //chemin d'envoi du mail
  await transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erreur lors de l\'envoi de mail');
      return console.log(error);
    }
    console.log('Message %s envoyé  %s', info.messageId, info.response);

  });

        
    } catch(e){
        console.error(e);
    }      
})()


}