const { google } = require("googleapis");
const nodemailer = require("nodemailer");
const cron = require("node-cron");
import trigger from "../../models/Trigger";
import archivo from "../../models/Archivo";
import subCarpeta from "../../models/SubCarpeta";
import moment from "moment";
//Metodo para enviar un correo
const enviarCorreo = async (req, res, next) => {
  try {
    const { mensaje, destino, asunto,expresion,nombre,contenedor,carpeta,status } = req.body;
    console.log(destino)
    const archivos = await archivo.find({ padreSuperior: contenedor._id, abuelo:carpeta._id ,status:status.nombre})
    const subCarpetas = await subCarpeta.find()
    let result = JSON.parse(JSON.stringify(archivos));
    let result2 = JSON.parse(JSON.stringify(subCarpetas))
    result.forEach(archivo => {
      let fechaCadu = archivo.fechaCaducidad.split("T");
      archivo.fechaCaducidad = moment(fechaCadu[0]).format("DD/MM/YYYY")
      var found = result2.find((e) => e._id === archivo.padre);
      let nombreSubCarpeta = found.nombre;
      archivo.nombrePadre = nombreSubCarpeta
    });
    
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

        const tablaHTML = `<table BORDER>
            <caption>Contenedor: ${contenedor.nombre}</caption>
            <caption>Carpeta: ${carpeta.nombre}</caption>
            <thead>
              <tr>
                <th>Nombre archivo</th>
                <th>Sub-Carpeta</th>
                <th>Fecha de caducidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${result.map(u => `<tr><td>${u.nombre}</td><td>${u.nombrePadre}</td><td>${u.fechaCaducidad}</td><td>${u.status}</td></tr>`).join('')}
            </tbody>
        </table>`;


        var mailOptions = {
          from: FROM_EMAIL,
          to: destino,
          subject: asunto,
          text: mensaje,
          html: tablaHTML
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
    
    let newTrigger = {
      nombre: nombre,
      asunto: asunto,
      expresion: expresion,
      contenedor: contenedor,
      carpeta: carpeta,
      status: status.nombre,
      destino: destino,
    }

    const reg = await trigger.create(newTrigger);
    if(reg){
      let trabajo = cron.schedule(expresion, () => {
        console.log("Email enviado por:" + nombre)
        sendEmail()
          .then()
          .catch((err) => console.log(err));
      });
      trabajo.start();
      global.triggers[nombre] = trabajo;
    }

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
    const tarea = global.triggers[nombreCron];
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
