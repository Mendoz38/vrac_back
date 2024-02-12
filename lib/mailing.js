const nodeMailer = require('nodemailer');
const fs = require('fs');

config = require('../.env')

//module d'envoi de mail grace à la librairie nodeMailer
module.exports = (mailTo, subject, title, text) => {

  // on lit le fichier où est stockée la clé privée DKIM
  const privateKey = fs.readFileSync("./lib/dkim.private", "utf8");

  //on crée le chemin de connexion au serveur mail
  let transporter = nodeMailer.createTransport({
    host: config.mail.host,
    port: config.mail.port,
    secure: true,
    auth: {
      user: config.auth.user,
      pass: config.auth.pass
    },
    dkim: {
      domainName: config.dkim.domainName,
      keySelector: config.dkim.keySelector,
      privateKey: privateKey
    }

  });

  
  //Load the template file
  const templateFile = fs.readFileSync("./lib/template/template.html");
  const templateFile2 = fs.readFileSync("./lib/template/template2.html");

  let mailOptions = {
    from: '[Vinsnaturels.fr] noreply@vinsnaturels.fr', // sender address
    to: mailTo, // list of receivers
    replyTo: title,
    subject: subject, // Subject line
    text: '', // plain text body
    html: templateFile + text + templateFile2 ,

  }; 
  
  //chemin d'envoi du mail
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('Erreur lors de l\'envoi de mail');
      return console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);

  });

}