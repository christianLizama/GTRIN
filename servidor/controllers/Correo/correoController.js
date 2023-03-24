const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
const trabajos = {}
import trigger from "../../models/Trigger";

//Metodo para enviar un correo
const enviarCorreo = async (req, res, next) => {
  try {
    const { mensaje, destino, asunto,expresion,nombre } = req.body;

    console.log(mensaje)
    console.log(destino)
    console.log(asunto)
    console.log(expresion)

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
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    async function sendEmail() {
      try {
        const accessToken = await oAuth2Client.getAccessToken();
        //Crear objeto de transporte
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            type: "OAuth2",
            user: USER,
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
          },
        });

        var mailOptions = {
          from: FROM_EMAIL,
          to: destino,
          subject: asunto,
          text: mensaje,
          html: `<TABLE BORDER>
            <TR>
              <TD>A</TD> <TD>B</TD> <TD>C</TD>
            </TR>
            <TR>
              <TD>D</TD> <TD>E</TD> <TD>F</TD>
            </TR>
          </TABLE>`,
        };
        // const result = await transporter.sendMail(mailOptions);
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.status(200).send("enviado");
            console.log("Email enviado: " + info.response);
          }
        });
      } catch (error) {}
    }

    let trabajo = cron.schedule(expresion, () => {
      console.log("Email enviado por:" + nombre)
      sendEmail()
        .then()
        .catch((err) => console.log(err));
    });
    trabajo.start();
    

    trabajos[nombre] = trabajo;

  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para enviar un correo
const stopCron = async (req, res, next) => {
  try {
    const {nombreCron} = req.body
    const tarea = trabajos[nombreCron];
    tarea.stop();
    let respuesta = "Cron "+nombreCron+" detenido"
    res.status(200).send(respuesta);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};



module.exports = {
  enviarCorreo,
  stopCron
};
