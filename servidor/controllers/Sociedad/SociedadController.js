// importar el modelo sociedad
import sociedad from "../../models/Sociedad";
import usuario from "../../models/Usuario";
import { Carpeta } from "../../models/Carpeta";
import Token from "../../services/token.js";

//Metodo para añadir una sociedad
const add = async (req, res, next) => {
  try {
    let sociedadNueva = req.body;
    //obtener todos los usuarios administradores
    const usuariosAdministradores = await usuario.find({ rol: "admin" }, "_id");
    const idsUsuariosAdministradores = usuariosAdministradores.map(
      (usuario) => usuario._id
    );
    //mezclar arreglo de usuarios administradores con arreglo de usuarios con acceso
    sociedadNueva.usuariosConAcceso = [
      ...idsUsuariosAdministradores,
      ...sociedadNueva.usuariosConAcceso,
    ];

    const reg = await sociedad.create(sociedadNueva);
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener una sociedad mediante su id
const query = async (req, res, next) => {
  try {
    const reg = await sociedad.findOne({ _id: req.query._id });
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

//Metodo para obtener una sociedad mediante su nombre
const queryNombre = async (req, res, next) => {
  try {
    const reg = await sociedad.findOne({ nombre: req.query.nombre });
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

//Metodo para obtener Carpetas de una sociedad segun el id de la sociedad
const queryFolders = async (req, res, next) => {
  try {
    const id = req.query._id;
    const reg = await Carpeta.find({ padre: id });
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

//Metodo para agregar Carpetas a una sociedad
const addFolder = async (req, res, next) => {
  try {
    const reg = await sociedad.findByIdAndUpdate(
      { _id: req.body._id },
      { carpetas: req.body.carpetas }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para actualizar una sociedad en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id;
    let body = req.body.sociedad;
    const reg = await sociedad.findByIdAndUpdate(id, body, { new: true });

    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar una sociedad mediante _id
const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    const reg = await sociedad.findByIdAndDelete({ _id: id });
    res.status(200).json(reg);
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
    const reg = await sociedad.findOne({ _id: req.query._id });
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
//Metodo para actualizar las carpetas de una sociedad
const updateCarpetas = async (req, res, next) => {
  try {
    //console.log(req.body);
    const reg = await sociedad.findByIdAndUpdate(
      { _id: req.body._id },
      { carpetas: req.body.carpetas }
    );
    if (reg) {
      res.status(200).json(reg);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener todas las sociedad
const getPadres = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];

    try {
      const usuario = await Token.verificarTokenValido(token);
      console.log("Usuario válido:", usuario);

      const reg = await sociedad.find({ usuariosConAcceso: usuario._id });
      res.status(200).json(reg);
    } catch (error) {
      if (
        error.message === "Token expirado" ||
        error.message === "Token inválido"
      ) {
        return res.status(401).send({
          message: error.message,
        });
      } else {
        throw error; // Propagar otros errores hacia arriba
      }
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrió un error",
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
  updateCarpetas,
  queryNombre,
  queryFolders,
  getPadres,
  addFolder,
};
