import { google } from 'googleapis';
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import trigger from "../../models/Trigger.js";
import archivo from "../../models/Archivo.js";
import subCarpeta from "../../models/SubCarpeta.js";
import moment from "moment";
//Metodo para enviar un correo

async function enviarCorreo2(mensaje, asunto, destino) {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  const USER = "reportes@transportesruiz.cl";
  const FROM_EMAIL = "reportes@transportesruiz.cl";

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

  var mailOptions = {
    from: FROM_EMAIL,
    to: destino,
    subject: asunto,
    text: mensaje,
  };

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
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log("Email enviado: " + info.response);
    }
  });
}

const enviarCorreo = async (req, res, next) => {
  try {
    const {
      mensaje,
      destino,
      asunto,
      expresion,
      nombre,
      contenedor,
      carpeta,
      status,
      parametro,
      rango,
    } = req.body;

    const CLIENT_ID = process.env.CLIENT_ID;
    const CLIENT_SECRET = process.env.CLIENT_SECRET;
    const REDIRECT_URI = process.env.REDIRECT_URI;
    const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
    const USER = "reportes@transportesruiz.cl";
    const FROM_EMAIL = "reportes@transportesruiz.cl";

    const oAuth2Client = new google.auth.OAuth2(
      CLIENT_ID,
      CLIENT_SECRET,
      REDIRECT_URI
    );
    oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
    async function sendEmail(
      mensaje,
      destino,
      asunto,
      contenedor,
      carpeta,
      status,
      parametro,
      rango
    ) {
      try {
        let archivos = [];
        //Si el status es vigente el trigger sera por rango de dias
        if (status === "Vigente") {
          let diasSumados = rango.value;
          let fechaTope = moment().add(diasSumados, "days");
          archivos = await archivo.find({
            padreSuperior: contenedor._id,
            abuelo: carpeta._id,
            status: status,
            parametro: { $in: parametro },
            fechaCambioEstado: { $gte: new Date(), $lte: fechaTope.toDate() },
          });
        } else {
          archivos = await archivo.find({
            padreSuperior: contenedor._id,
            abuelo: carpeta._id,
            status: status,
            parametro: { $in: parametro },
          });
        }

        const subCarpetas = await subCarpeta.find();

        let result = JSON.parse(JSON.stringify(archivos));
        let result2 = JSON.parse(JSON.stringify(subCarpetas));

        result.forEach((archivo) => {
          let fechaCadu = archivo.fechaCaducidad.split("T");
          archivo.fechaCaducidad = moment(fechaCadu[0]).format("DD/MM/YYYY");
          var found = result2.find((e) => e._id === archivo.padre);
          var found2 = parametro.find(
            (param) => param._id === archivo.parametro
          );
          let nombreSubCarpeta = found.nombre;
          let nombreParametro = found2.value;
          archivo.nombrePadre = nombreSubCarpeta;
          archivo.nombreParametro = nombreParametro;
        });

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
                <th>#</th>
                <th>Nombre archivo</th>
                <th>Parametro</th>
                <th>Sub-Carpeta</th>
                <th>Fecha de caducidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${result
                .map(
                  (u, index) =>
                    `<tr><td>${index + 1}</td><td>${u.nombre}</td><td>${
                      u.nombreParametro
                    }</td><td>${u.nombrePadre}</td><td>${
                      u.fechaCaducidad
                    }</td><td>${u.status}</td></tr>`
                )
                .join("")}
            </tbody>
        </table>`;

        var mailOptions = {
          from: FROM_EMAIL,
          to: destino,
          subject: asunto,
          text: mensaje,
          html: tablaHTML,
        };
        // const result = await transporter.sendMail(mailOptions);
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            console.log("Email enviado: " + info.response);
          }
        });
      } catch (error) {}
    }

    //Guardando el trigger en la bd
    let newTrigger = {
      nombre: nombre,
      asunto: asunto,
      expresion: expresion,
      contenedor: contenedor,
      carpeta: carpeta,
      status: status,
      destino: destino,
      parametro: parametro,
      rango: rango,
    };

    const reg = await trigger.create(newTrigger);
    //Si se puede guardar lo ejecutamos
    if (reg) {
      // Definir la zona horaria de Santiago, Chile
      const timezone = "America/Santiago";
      let trabajo = cron.schedule(
        expresion,
        () => {
          console.log("Email enviado por:" + nombre);
          sendEmail(
            mensaje,
            destino,
            asunto,
            contenedor,
            carpeta,
            status,
            parametro,
            rango
          )
            .then()
            .catch((err) => console.log(err));
        },
        {
          scheduled: true,
          timezone: timezone,
        }
      );
      trabajo.start();
      let objeto = {
        nombre: nombre,
        tarea: trabajo,
      };
      global.triggers.push(objeto);
      res.status(200).send("Trigger creado");
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
    const { nombreCron } = req.body;
    let buscado = global.triggers.find(
      (element) => element.nombre == nombreCron
    );
    if (buscado) {
      const tarea = buscado.tarea;
      tarea.stop();
      const reg = await trigger.findOneAndDelete({ nombre: nombreCron });
      if (reg) {
        let respuesta = "Cron " + nombreCron + " detenido";
        const index = global.triggers.findIndex((x) => x.nombre === nombreCron);
        global.triggers.splice(index, 1);
        res.status(200).send(respuesta);
      }
    } else {
      res.status(400).send("No existe este cron");
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
async function cargar(trigger) {
  const CLIENT_ID = process.env.CLIENT_ID;
  const CLIENT_SECRET = process.env.CLIENT_SECRET;
  const REDIRECT_URI = process.env.REDIRECT_URI;
  const REFRESH_TOKEN = process.env.REFRESH_TOKEN;
  const USER = "reportes@transportesruiz.cl";
  const FROM_EMAIL = "reportes@transportesruiz.cl";

  const oAuth2Client = new google.auth.OAuth2(
    CLIENT_ID,
    CLIENT_SECRET,
    REDIRECT_URI
  );
  oAuth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });
  
  async function sendEmail(mensaje,destino,asunto,contenedor,carpeta,status,parametro,rango) {
    try {
      let archivos = [];
      if (status === "Vigente") {
        let diasSumados = rango.value;
        let fechaTope = moment().add(diasSumados, "days");
        archivos = await archivo.find({
          padreSuperior: contenedor._id,
          abuelo: carpeta._id,
          status: status,
          parametro: { $in: parametro },
          fechaCambioEstado: { $gte: new Date(), $lte: fechaTope.toDate() },
        });
      } else {
        archivos = await archivo.find({
          padreSuperior: contenedor._id,
          abuelo: carpeta._id,
          status: status,
          parametro: { $in: parametro },
        });
      }

      const subCarpetas = await subCarpeta.find();
      let result = JSON.parse(JSON.stringify(archivos));
      let result2 = JSON.parse(JSON.stringify(subCarpetas));
      result.forEach((archivo) => {
        let fechaCadu = archivo.fechaCaducidad.split("T");
        archivo.fechaCaducidad = moment(fechaCadu[0]).format("DD/MM/YYYY");
        var found = result2.find((e) => e._id === archivo.padre);
        var found2 = parametro.find((param) => param._id === archivo.parametro);
        let nombreSubCarpeta = found.nombre;
        let nombreParametro = found2.value;
        archivo.nombrePadre = nombreSubCarpeta;
        archivo.nombreParametro = nombreParametro;
      });

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
                <th>#</th>
                <th>Nombre archivo</th>
                <th>Parametro</th>
                <th>Sub-Carpeta</th>
                <th>Fecha de caducidad</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              ${result
                .map(
                  (u, index) =>
                    `<tr><td>${index}</td><td>${u.nombre}</td><td>${u.nombreParametro}</td><td>${u.nombrePadre}</td><td>${u.fechaCaducidad}</td><td>${u.status}</td></tr>`
                )
                .join("")}
            </tbody>
        </table>`;

      var mailOptions = {
        from: FROM_EMAIL,
        to: destino,
        subject: asunto,
        text: mensaje,
        html: tablaHTML,
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
  // Definir la zona horaria de Santiago, Chile
  const timezone = "America/Santiago";
  let trabajo = cron.schedule(
    trigger.expresion,
    () => {
      console.log("Email enviado por:" + trigger.nombre);
      sendEmail(
        trigger.mensaje,
        trigger.destino,
        trigger.asunto,
        trigger.contenedor,
        trigger.carpeta,
        trigger.status,
        trigger.parametro,
        trigger.rango
      )
        .then()
        .catch((err) => console.log(err));
    },
    {
      scheduled: true,
      timezone: timezone,
    }
  );

  trabajo.start();

  let objeto = {
    nombre: trigger.nombre,
    tarea: trabajo,
  };
  global.triggers.push(objeto);
}

async function cargarTriggers() {
  try {
    console.log("Leyendo triggers");
    const reg = await trigger.find();
    if (reg.length == 0) {
      console.log("No hay ningun trigger creado");
    } else {
      console.log("Hay triggers creados");
      reg.forEach((trigger) => {
        cargar(trigger);
      });
    }
  } catch (e) {
    console.log("Ocurrio un error");
    next(e);
  }
}

const obtenerTriggers = async (req, res, next) => {
  try {
    const reg = await trigger.find();
    console.log(reg);
    if (!reg) {
      res.status(404).send({
        message: "No hay ningún trigger creado",
      });
    } else {
      res.status(200).json(reg);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

export default {
  enviarCorreo,
  enviarCorreo2,
  stopCron,
  obtenerTriggers,
  cargarTriggers,
}

// module.exports = {
//   enviarCorreo,
//   enviarCorreo2,
//   stopCron,
//   obtenerTriggers,
//   cargarTriggers,
// };
