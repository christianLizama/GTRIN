import { json } from "express";
import moment from "moment";
import archivo from "../../models/Archivo";
import { Carpeta } from "../../models/Carpeta";
import subCarpeta from "../../models/SubCarpeta";
import sociedad from "../../models/Sociedad";
const fs = require("fs");

//Metodo para crear un archivo
const add = async (req, res, next) => {
  try {
    let file = req.body;
    let cortado = file.fechaCambioEstado.split("T")
    let fechaCambioEstado = moment(cortado[0])
    if (new Date() >= moment(file.fechaCaducidad)) {
      // console.log("Estoy vencido");
      file.status = "Vencido";
    } else if (new Date() >= fechaCambioEstado._d) {
      // console.log("Estoy por vencer");
      file.status = "Por vencer";
    } else {
      // console.log("Estoy vigente");
      file.status = "Vigente";
    }
    const reg = await archivo.create(req.body);
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener un archivo mediante su id
const query = async (req, res, next) => {
  try {
    const reg = await archivo.findOne({ _id: req.query._id });
    if (!reg) {
      res.status(404).send({
        message: "El registro no existe",
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

//Metodo para obtener los archivos de una sub carpeta
const getAllFiles = async (req, res, next) => {
  try {
    const reg = await archivo.find();

    if (!reg) {
      res.status(404).send({
        message: "El registro no existe",
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

//Metodo para obtener la cantidad de archivos de un parametro y sub carpeta
const countFiles = async (req, res, next) => {
  try {
    const id = req.query._id;
    const idPadre = req.query.padre;
    let date = new Date();
    console.log(date);
    const reg = await archivo
      .find({
        parametro: id,
        padre: idPadre,
        fechaCaducidad: { $gt: new Date() },
      })
      .count();
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

function obtenerNombreSociedad(itemId, sociedades) {
  let found = sociedades.find((e) => e._id === itemId);
  let nombreSociedad = found.nombre;
  return nombreSociedad;
}
function obtenerNombreCarpeta(itemId, carpetas) {
  var found = carpetas.find((e) => e._id === itemId);
  let nombreCarpeta = found.nombre;
  return nombreCarpeta;
}
function obtenerNombreSubCarpeta(itemId, subCarpetas) {
  var found = subCarpetas.find((e) => e._id === itemId);
  let nombreSubCarpeta = found.nombre;
  return nombreSubCarpeta;
}
function obtenerNombreParametro(parametroID, parametros) {
  var found = parametros.find((e) => e._id === parametroID);
  let nombreParametro = found.value;
  return nombreParametro;
}
//Iniciamos un archivo con cada uno de sus parametros
function iniciarFile(element, padres, carpetas, subCarpetas, parametros) {
  element.nombreSociedad = obtenerNombreSociedad(element.padreSuperior, padres);
  element.nombreCarpeta = obtenerNombreCarpeta(element.abuelo, carpetas);
  element.nombreSubCarpeta = obtenerNombreSubCarpeta(
    element.padre,
    subCarpetas
  );
  element.nombreParametro = obtenerNombreParametro(
    element.parametro,
    parametros
  );

  if(element.status == "Vigente"){
    element.statusId=3
  }
  else if(element.status == "Por vencer"){
    element.statusId=2
  }
  else{
    element.statusId=1
  }

  let fechaEmi = element.fechaEmision.split("T");
  let fechaCadu = element.fechaCaducidad.split("T");
  let fechaCam = element.fechaCambioEstado.split("T")
  element.fechaEmision = fechaEmi[0];
  element.fechaCaducidad = fechaCadu[0];
  element.fechaCambioEstado = fechaCam[0]
  
  let fechaEmision = moment(fechaEmi[0]);
  let fechaCaducidad = moment(fechaCadu[0]);
  let diasAviso = element.diasAviso;

  let diasVigencia = fechaCaducidad.diff(fechaEmision, "days");
  element.diasVigencia = diasVigencia;

  var today = new Date();
  var now = today.toISOString();
  var cortado = now.split("T");

  let fechaHoy = moment(cortado[0]);
  let diasRestantesCaducidad = fechaCaducidad.diff(fechaHoy, "days");

  element.diasRestantes = diasRestantesCaducidad;

  // let fechaEmi = element.fechaEmision.split("T");

  // let fechaCrea = element.fechaCreacion.split("T");
  // let fechaEmi = element.fechaEmision.split("T");
  // let fechaCadu = element.fechaCaducidad.split("T");
  // let fechaAviso = element.fechaCambioEstado.split("T");
  // element.fechaCreacion = fechaCrea[0];
  // element.fechaEmision = fechaEmi[0];
  // element.fechaCaducidad = fechaCadu[0];
  // element.fechaCambioEstado = fechaAviso[0];

  // var today = new Date();
  // var now = today.toISOString();
  // var cortado = now.split("T");
  // var fechaEmis = moment(element.fechaEmision);
  // var fechaCaducidad1 = moment(element.fechaCaducidad);
  // var fechaCaducidad = moment(element.fechaCaducidad);

  // var diasVigencia = fechaCaducidad1.diff(fechaEmis, "days");
  // var diasRestantes = fechaCaducidad.diff(cortado[0], "days");

  // element.diasVigencia = diasVigencia;
  // element.diasRestantes = diasRestantes;
  // // console.log(element.nombre);
  // // console.log(element.archivo)
  // // console.log("Fecha emision: " + element.fechaEmision);
  // // console.log("Fecha vencimiento: " + element.fechaCaducidad);
  // // console.log("Dias alerta: " + element.diasAviso);
  // // console.log("Fecha que cambia de estado: " + moment(element.fechaEmision).add(element.diasAviso,"days").format("DD/MM/YYYY"))
  // // console.log("Dias de vigencia: " + element.diasVigencia);
  // // console.log("Dias restantes: " + element.diasRestantes);
  // // console.log("-----------------------------------------------")
  // let dateArray = element.fechaEmision.split("-");
  // var diaCambio2 = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
  // diaCambio2.setDate(diaCambio2.getDate() + element.diasAviso);
  // diaCambio2.setHours(0, 0, 0, 0);

  // let date2Array = element.fechaCaducidad.split("-");
  // var fechaCaducidadAux = new Date(
  //   date2Array[0],
  //   date2Array[1] - 1,
  //   date2Array[2]
  // );
  // fechaCaducidadAux.setHours(0, 0, 0, 0);

  // // console.log("--------------------");
  // var hoy = new Date();
  // hoy.setHours(0, 0, 0, 0);

  // if (diasRestantes < 1) {
  //   element.diasRestantes = 0;
  // }
  // //Si el día de cambio de estado es igual al día de hoy pasa a estado por vencer
  // if (diaCambio2.getTime() <= hoy.getTime() && diasRestantes >= 1) {
  //   element.status = 2;
  //   element.estado = "Por Vencer";
  // }
  // //Si el día de cambio de estado es despues del día de hoy esta vigente
  // else if (diaCambio2.getTime() > hoy.getTime()) {
  //   element.status = 3;
  //   element.estado = "Vigente";
  // }
  // //Quiere decir que el día de cambio no es ni igual a hoy, ni mayor que hoy por lo que puede estar vencido
  // else if (diaCambio2.getTime() <= fechaCaducidadAux.getTime()) {
  //   element.status = 1;
  //   element.estado = "Vencido";
  // }
}

const getArchivosStatus = async (req, res, next) => {
  try {
    let archivos = await archivo.find();
    let sociedades = await sociedad.find();
    let carpetas = await Carpeta.find();
    let subCarpetas = await subCarpeta.find();

    if (!archivos && !sociedades && !carpetas && !subCarpetas && !parametros) {
      res.status(404).send({
        message: "El registro no existe",
      });
    } else {
      let result = JSON.parse(JSON.stringify(archivos));
      let result2 = JSON.parse(JSON.stringify(sociedades));
      let result3 = JSON.parse(JSON.stringify(carpetas));
      let result4 = JSON.parse(JSON.stringify(subCarpetas));
      let parametrosTotal = [];
      //Obtenemos todos los parametros de todas las carpetas
      result3.forEach((folder) => {
        folder.parametros.forEach((param) => {
          parametrosTotal.push(param);
        });
      });
      result.forEach((archivo) => {
        iniciarFile(archivo, result2, result3, result4, parametrosTotal);
      });
      let array = {
        archivos: result,
        sociedades: result2,
        carpetas: result3,
        subCarpetas: result4,
        parametros: parametrosTotal,
      };
      res.status(200).json(array);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener los archivos de una sub carpeta
const getArchivos = async (req, res, next) => {
  try {
    const id = req.query._id;
    console.log(req.query._id);
    const reg = await archivo.find({ padre: id });
    if (!reg) {
      res.status(404).send({
        message: "El registro no existe",
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

//Metodo para actualizar un archivo en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id;
    const file = req.body.archivo;
    let cortado = file.fechaCambioEstado.split("T")
    let fechaCambioEstado = moment(cortado[0])
    if (new Date() >= moment(file.fechaCaducidad)) {
      // console.log("Estoy vencido");
      file.status = "Vencido";
    } else if (new Date() >= fechaCambioEstado._d) {
      // console.log("Estoy por vencer");
      file.status = "Por vencer";
    } else {
      // console.log("Estoy vigente");
      file.status = "Vigente";
    }
    const reg = await archivo.findByIdAndUpdate(id, file, { new: true });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar un archivo mediante _id y su nombre
const remove = async (req, res, next) => {
  try {
    const { id, fileName } = req.body;
    const reg = await archivo.findByIdAndDelete({ _id: id });
    if (reg) {
      const directoryPath = __basedir + "/uploads/";
      fs.unlink(directoryPath + fileName, (err) => {
        if (err) {
          console.log("Este archivo no existe");
        }
        res.status(200).send({
          message: "El archivo " + fileName + " ha sido borrado",
        });
      });
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para eliminar todos los archivos de una sub carpeta
const removeAll = async (req, res, next) => {
  try {
    const { id } = req.body;
    const archivos = await archivo.find({ padre: id });
    const reg = await archivo.deleteMany({ padre: id });
    if (reg) {
      const directoryPath = __basedir + "/uploads/";
      if (archivos.length > 0) {
        archivos.forEach((element) => {
          fs.unlink(directoryPath + element.archivo, (err) => {
            if (err) console.log(err);
          });
        });
        res.status(200).send({
          message: "Todos los archivos han sido borrados",
        });
      } else {
        res.status(200).send({
          message: "La carpeta no posee ningún archivo",
        });
      }
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para eliminar todos los archivos de una carpeta
const removeFolderFiles = async (req, res, next) => {
  try {
    const { id } = req.body;
    const archivos = await archivo.find({ abuelo: id });
    const reg = await archivo.deleteMany({ abuelo: id });
    if (reg) {
      const directoryPath = __basedir + "/uploads/";
      if (archivos.length > 0) {
        archivos.forEach((element) => {
          fs.unlink(directoryPath + element.archivo, (err) => {
            if (err) console.log(err);
          });
        });
        res.status(200).send({
          message: "Todos los archivos han sido borrados",
        });
      } else {
        res.status(200).send({
          message: "La carpeta no posee ningún archivo",
        });
      }
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para hacer update de los status
const updateStatus = async (req, res, next) => {
  try {
    const reg = await archivo.updateMany(
      {},
      [
        {
          $set: {
            status: {
              $switch: {
                branches: [
                  {
                    case: { $gte: [new Date(), "$fechaCaducidad"] },
                    then: "Vencido",
                  },
                  {
                    case: { $gte: [new Date(), "$fechaCambioEstado"] },
                    then: "Por vencer",
                  },
                ],
                default: "Vigente",
              },
            },
          },
        },
      ],
      { multi: true }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

module.exports = {
  add,
  query,
  update,
  remove,
  getArchivos,
  getAllFiles,
  countFiles,
  removeAll,
  removeFolderFiles,
  getArchivosStatus,
  updateStatus,
};
