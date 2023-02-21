const { google } = require("googleapis");
const nodemailer = require("nodemailer");

//Metodo para enviar un correo
const enviarCorreo = async (req, res, next) => {
  try {
    const { mensaje, destino,asunto} = req.body;
    
    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const USER = process.env.USER;
    const FROM_EMAIL = process.env.FROM_EMAIL;

    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({refresh_token:REFRESH_TOKEN});
    async function sendEmail() {
      try {
        const accessToken = await oAuth2Client.getAccessToken()
        //Crear objeto de transporte
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: 'OAuth2',
            user: USER,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken
          },
        });

        var mailOptions = {
            from: FROM_EMAIL,
            to: destino,
            subject: asunto,
            text: mensaje
        };
        // const result = await transporter.sendMail(mailOptions);
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(error);
            } else {
                res.status(200).send("enviado");
                console.log('Email enviado: ' + info.response);
            }
        });
      } catch (error) {}
    }
    await sendEmail().then().catch((err) => console.log(err));

  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

module.exports = {
  enviarCorreo,
};