import folder from "../../models/Carpeta.js";
import subCarpeta from "../../models/SubCarpeta.js";
import Archivo from "../../models/Archivo.js";
import Usuario from "../../models/Usuario.js";
import cumplimiento from "../../utils/cumplimientos.js"; // Importación con ruta relativa
import { Storage } from "@google-cloud/storage"; // Importación de un paquete npm
import Parametro from "../../models/Parametro.js";
import Token from "../../services/token.js";

const Carpeta = folder.Carpeta;

const storage = new Storage({
  keyFilename: "cool-kit-375714-32d9f4710e16.json",
});
const bucket = storage.bucket("prueba-2");

//Metodo para crear una Carpeta
const add = async (req, res, next) => {
  try {
    let nuevaCarpeta = req.body.carpeta;
    //obtener todos los usuarios administradores
    const usuariosAdministradores = await Usuario.find({ rol: "admin" }, "_id");
    const idsUsuariosAdministradores = usuariosAdministradores.map(
      (usuario) => usuario._id
    );
    //mezclar arreglo de usuarios administradores con arreglo de usuarios con acceso
    nuevaCarpeta.usuariosConAcceso = [
      ...idsUsuariosAdministradores,
      ...nuevaCarpeta.usuariosConAcceso,
    ];

    const reg = await Carpeta.create(nuevaCarpeta);
    if (reg) {
      //Actualizamos el cumplimiento de la sociedad
      const idSociedad = reg.padre;
      await cumplimiento.calcularCumplimientoSociedad(idSociedad);
    }
    //Buscar esa carpeta y devolverla con los usuariosConAcceso populados
    const carpetaPopulada = await Carpeta.findOne({ _id: reg._id }).populate({
      path: "usuariosConAcceso",
      select: "_id email rol",
    });
    res.status(200).json(carpetaPopulada);
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
    let { id, parametros: nuevosParametros } = req.body;

    // //Verificamos si hay archivos que borrar
    // const archivosDelete = await Archivo.find({
    //   parametro: { $in: eliminados },
    // });
    // //Si hay procedemos a borrarlos
    // if (archivosDelete.length > 0) {
    //   archivosDelete.forEach((element) => {
    //     let nombreArchivo = element.archivo.substring(
    //       element.archivo.lastIndexOf("/") + 1
    //     );
    //     bucket
    //       .file(nombreArchivo)
    //       .delete()
    //       .then(() => {
    //         console.log(`Archivo:///${nombreArchivo} ha sido eliminado.`);
    //       })
    //       .catch((err) => {
    //         console.log("El archivo no existe");
    //       });
    //   });

    //   const borrados = await Archivo.deleteMany({
    //     parametro: { $in: eliminados },
    //   });
    //   console.log(borrados);
    // }

    // Obtenemos la carpeta con sus parametros
    const carpeta = await Carpeta.findOne({ _id: id }).populate("parametros");

    // Verificamos si los parametros actuales tienen archivos
    const archivosPorParametro = await Archivo.aggregate([
      {
        $match: {
          abuelo: carpeta._id, // Filtrar por la carpeta actual
          parametro: {
            $in: carpeta.parametros.map((parametro) => parametro._id),
          },
        },
      },
      {
        $group: {
          _id: "$parametro",
          cantidadArchivos: { $sum: 1 },
        },
      },
    ]);

    // Crear un mapa para mapear el ID de parámetro con la cantidad de archivos
    const archivosPorParametroMap = new Map();
    archivosPorParametro.forEach((item) => {
      archivosPorParametroMap.set(item._id.toString(), item.cantidadArchivos);
    });

    // Agregar la cantidad de archivos a cada parámetro
    const parametrosConArchivos = carpeta.parametros.map((parametro) => ({
      ...parametro.toObject(),
      cantidadArchivos:
        archivosPorParametroMap.get(parametro._id.toString()) || 0,
    }));

    let parametrosAusentes = [];

    // Obtener que parametro de parametros con archivos no esta en nuevosParametros
    parametrosConArchivos.forEach((parametro) => {
      let parametroEncontrado = nuevosParametros.find(
        (parametroNuevo) => parametroNuevo._id == parametro._id
      );
      if (!parametroEncontrado) {
        parametrosAusentes.push(parametro);
      }
    });

    let listaFinal = [];
    // Recorremos los parametros ausentes y verificamos si tienen archivos
    parametrosAusentes.forEach((parametro) => {
      // Verificar si el parámetro tiene archivos (supongamos que la propiedad es "cantidadArchivos")
      if (parametro.cantidadArchivos > 0) {
        // Agregar el parámetro a la lista final
        listaFinal.push(parametro);
      }
    });

    // Si la lista final tiene elementos, significa que hay parámetros con archivos que no están en nuevosParametros
    if (listaFinal.length > 0) {
      // Agregar los nuevos elementos a nuevosParametros
      nuevosParametros = [...nuevosParametros, ...listaFinal];
    }
    
    const carpetaActualizada = await Carpeta.findByIdAndUpdate(
      id,
      { parametros: nuevosParametros },
      { new: true }
    );

    if (carpetaActualizada) {
      await cumplimiento.actualizarCumplimientoTodasSubCarpetas();
      await cumplimiento.calcularCumplimientoCarpeta(id);
      await cumplimiento.calcularCumplimientoSociedad(carpetaActualizada.padre);
      res.status(200).json(carpetaActualizada);
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

const query = async (req, res, next) => {
  try {
    const tokenActual = req.headers.authorization.split(" ")[1];
    // Verificar si el token es válido y obtener el usuario
    const user = await Token.verificarTokenValido(tokenActual);

    const carpetaId = req.query._id; // Obtener el ID de la carpeta
    // Buscar la carpeta por su ID y poblar los parámetros
    let carpeta = await Carpeta.findOne({
      _id: carpetaId,
      usuariosConAcceso: user._id,
    }).populate({
      path: "parametros",
      match: { usuariosConAcceso: user._id }, // Filtrar los parámetros por usuariosConAcceso que coincidan con el usuario actual
    });

    if (!carpeta) {
      return res.status(404).json({ message: "La carpeta no existe" });
    }

    // Obtener la cantidad de archivos por parámetro en la carpeta utilizando la agregación de MongoDB
    const archivosPorParametro = await Archivo.aggregate([
      {
        $match: {
          abuelo: carpeta._id, // Filtrar por la carpeta actual
          parametro: {
            $in: carpeta.parametros.map((parametro) => parametro._id),
          },
        },
      },
      {
        $group: {
          _id: "$parametro",
          cantidadArchivos: { $sum: 1 },
        },
      },
    ]);

    // Crear un mapa para mapear el ID de parámetro con la cantidad de archivos
    const archivosPorParametroMap = new Map();
    archivosPorParametro.forEach((item) => {
      archivosPorParametroMap.set(item._id.toString(), item.cantidadArchivos);
    });

    // Agregar la cantidad de archivos a cada parámetro
    const parametrosConArchivos = carpeta.parametros.map((parametro) => ({
      ...parametro.toObject(),
      cantidadArchivos:
        archivosPorParametroMap.get(parametro._id.toString()) || 0,
      disabled: archivosPorParametroMap.get(parametro._id.toString()) > 0,
    }));

    const folder = JSON.parse(JSON.stringify(carpeta));
    // Asignar el valor de parametrosConArchivos a la copia de carpeta
    folder.parametros = parametrosConArchivos;

    const resultado = {
      folder,
    };

    res.status(200).json(resultado);
  } catch (e) {
    res.status(500).json({ message: "Ocurrió un error", error: e.message });
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
    let body = req.body.carpeta;
    // transformar el arreglo de usuariosConAcceso a un arreglo solo de ids
    body.usuariosConAcceso = body.usuariosConAcceso.map(
      (usuario) => usuario._id
    );
    const reg = await Carpeta.findByIdAndUpdate(id, body, {
      new: true,
    }).populate({ path: "usuariosConAcceso", select: "_id email rol" });
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

export default {
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
