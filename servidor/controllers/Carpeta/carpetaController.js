import { Carpeta } from "../../models/Carpeta";
import subCarpeta from "../../models/SubCarpeta";
import Archivo from "../../models/Archivo";
const cumplimiento = require("../../utils/cumplimientos");
const { Storage } = require("@google-cloud/storage");

const storage = new Storage({
  keyFilename: "cool-kit-375714-32d9f4710e16.json",
});
const bucket = storage.bucket("prueba-2");

//Metodo para crear una Carpeta
const add = async (req, res, next) => {
  try {
    const reg = await Carpeta.create(req.body.carpeta);
    if (reg) {
      //Actualizamos el cumplimiento de la sociedad
      const idSociedad = reg.padre;
      await cumplimiento.calcularCumplimientoSociedad(idSociedad);
    }
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//metodo para agregar parametros
const agregarParametros = async (req, res, next) => {
  try {
    let { id, parametros } = req.body;
    //console.log(id);
    const folder = await Carpeta.findOne({ _id: id });
    //console.log(folder);
    if (folder) {
      parametros.forEach((parametro) => {
        folder.parametros.push(parametro);
      });
      const CarpetaActualizada = await Carpeta.findByIdAndUpdate(id, folder);
      if (CarpetaActualizada) {
        await cumplimiento.actualizarCumplimientoTodasSubCarpetas();
        await cumplimiento.calcularCumplimientoCarpeta(id);
        await cumplimiento.calcularCumplimientoSociedad(
          CarpetaActualizada.padre
        );

        res.status(200).json(CarpetaActualizada);
      }
    } else {
      res.status(404).json("La Carpeta buscada no existe");
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//metodo para actualizar parametros
const actualizarParametros = async (req, res, next) => {
  try {
    let { id, parametros, eliminados } = req.body;

    //Verificamos si hay archivos que borrar
    const archivosDelete = await Archivo.find({
      parametro: { $in: eliminados },
    });
    //Si hay procedemos a borrarlos
    if (archivosDelete.length > 0) {
      archivosDelete.forEach((element) => {
        let nombreArchivo = element.archivo.substring(
          element.archivo.lastIndexOf("/") + 1
        );
        bucket
          .file(nombreArchivo)
          .delete()
          .then(() => {
            console.log(`Archivo:///${nombreArchivo} ha sido eliminado.`);
          })
          .catch((err) => {
            console.log("El archivo no existe");
          });
      });

      const borrados = await Archivo.deleteMany({
        parametro: { $in: eliminados },
      });
      console.log(borrados);
    }

    const CarpetaActualizada = await Carpeta.findById(id).then((folder) => {
      parametros.forEach((param) => {
        const params = folder.parametros.id(param._id);
        if (params) {
          params.set(param);
        } else {
          folder.parametros.addToSet(param);
        }
      });
      //Para eliminar los parametros
      eliminados.forEach((eliminado) => {
        folder.parametros.id(eliminado).remove();
      });
      return folder.save();
    });

    if (CarpetaActualizada) {
      await cumplimiento.actualizarCumplimientoTodasSubCarpetas();
      await cumplimiento.calcularCumplimientoCarpeta(id);
      await cumplimiento.calcularCumplimientoSociedad(CarpetaActualizada.padre);
      res.status(200).json(CarpetaActualizada);
    } else {
      res.status(404).json("La Carpeta buscada no existe");
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener una Carpeta mediante su id
const query = async (req, res, next) => {
  try {
    //console.log(req.query._id);
    const reg = await Carpeta.findOne({ _id: req.query._id });
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

//Metodo para obtener una Carpeta mediante su nombre
const queryNombre = async (req, res, next) => {
  try {
    const reg = await Carpeta.findOne({ nombre: req.query.nombre });
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

//Metodo para obtener los hijos de una Carpeta
const querysubFolders = async (req, res, next) => {
  try {
    const id = req.query._id;
    const reg = await subCarpeta.find({ padre: id });

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

//Metodo para agregar subCarpetas a una Carpeta
const addFolder = async (req, res, next) => {
  try {
    const reg = await Carpeta.findByIdAndUpdate(
      { _id: req.body._id },
      { hijos: req.body.hijos }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para actualizar una Carpeta en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id;
    const body = req.body.carpeta;
    //console.log(body);
    const reg = await Carpeta.findByIdAndUpdate(id, body, { new: true });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar una Carpeta mediante _id
const remove = async (req, res, next) => {
  try {
    const id = req.params;
    //console.log(id);
    const reg = await Carpeta.findByIdAndDelete({ _id: id.id });
    if (reg) {
      const idSociedad = reg.padre;
      await cumplimiento.calcularCumplimientoSociedad(idSociedad);
      res.status(200).json(reg);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar todas las subCarpetas de una Carpeta eliminada
const removeSubFolders = async (req, res, next) => {
  try {
    const id = req.params;
    const reg = await subCarpeta.deleteMany({ padre: id.id });
    //console.log(req.params.id);
    if (reg) {
      res.status(200).json(true);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener los archivos de una sociedad mediante el id de la misma
const getArchivos = async (req, res, next) => {
  try {
    const reg = await Carpeta.findOne({ _id: req.query._id });
    if (!reg) {
      res.status(404).sed({
        message: "El registro no existe",
      });
    } else {
      res.status(200).json(reg.archivos);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para agregar un archivo a la sociedad
const updateHijos = async (req, res, next) => {
  try {
    //console.log(req.body);
    const reg = await Carpeta.findByIdAndUpdate(
      { _id: req.body._id },
      { hijos: req.body.hijos }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para obtener todas las Carpetas
const getAllFolders = async (req, res, next) => {
  try {
    const reg = await Carpeta.find();
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Conteo de cumplimiento
const contarCumplimiento = async (req, res, next) => {
  try {
    //console.log(req.query)
    let idPadre = req.query.padre;
    let idFolder = req.query._id;
    //console.log(idPadre);
    //console.log(idFolder);
    let carpetaFind = await Carpeta.find({ padre: idPadre, _id: idFolder });
    if (carpetaFind) {
      let carpeta = JSON.parse(JSON.stringify(carpetaFind))[0];
      let archivosRequeridos = 0;
      carpeta.parametros.forEach((element) => {
        if (element.option) {
          archivosRequeridos = archivosRequeridos + 1;
        }
      });
      //console.log("Archivos Requeridos: "+archivosRequeridos);
      let subCarpetasFind = await subCarpeta.find({ padre: idFolder });
      let subCarpetas = JSON.parse(JSON.stringify(subCarpetasFind));
      for (let index = 0; index < subCarpetas.length; index++) {
        let contador = 0;
        for (let index2 = 0; index2 < carpeta.parametros.length; index2++) {
          const conteo = await Archivo.find({
            parametro: carpeta.parametros[index2],
            padre: subCarpetas[index]._id,
            fechaCaducidad: { $gt: new Date() },
          }).count();
          if (conteo > 0 && carpeta.parametros[index2].option) {
            contador = contador + 1;
          }
        }
        subCarpetas[index].archivosSubidos = contador;
        subCarpetas[index].archivosRequeridos = archivosRequeridos;
        if (contador >= archivosRequeridos) {
          subCarpetas[index].cumplimiento = "cumple";
        } else {
          subCarpetas[index].cumplimiento = "No cumple";
        }
        let intPorcentaje = 0;

        if (contador > 0) {
          let porcentaje = (contador / archivosRequeridos) * 100;
          intPorcentaje = Math.round(porcentaje);
        }
        subCarpetas[index].porcentaje = intPorcentaje;
      }
      //console.log(subCarpetas)
      res.status(200).json(subCarpetas);
    }
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
  updateHijos,
  queryNombre,
  querysubFolders,
  addFolder,
  removeSubFolders,
  getAllFolders,
  agregarParametros,
  actualizarParametros,
  contarCumplimiento,
};
