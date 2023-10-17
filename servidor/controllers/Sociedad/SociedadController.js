// importar el modelo sociedad
import sociedad from "../../models/Sociedad.js";
import usuario from "../../models/Usuario.js";
import folder from "../../models/Carpeta.js";
import Token from "../../services/token.js";

const Carpeta = folder.Carpeta;

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
    //Buscar esa sociedad y devolverla con los usuariosConAcceso populados
    const sociedadPopulada = await sociedad.findOne({ _id: reg._id }).populate({ path: "usuariosConAcceso", select: "_id email rol" });
    res.status(200).json(sociedadPopulada);
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
    //console.log(req.headers.authorization)
    const tokenActual = req.headers.authorization.split(" ")[1];
    // Verificar si el token es válido y obtener el usuario
    const user = await Token.verificarTokenValido(tokenActual);

    const id = req.query._id;

    // Obtener todas las carpetas que contienen al usuario actual en usuariosConAcceso
    const reg = await Carpeta.find({
      padre: id,
      usuariosConAcceso: user._id,
    }).populate({ path: "usuariosConAcceso", select: "_id email rol" });

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
    // transformar el arreglo de usuariosConAcceso a un arreglo solo de ids
    body.usuariosConAcceso = body.usuariosConAcceso.map((usuario) => usuario._id);
    const reg = await sociedad.findByIdAndUpdate(id, body, { new: true }).populate({ path: "usuariosConAcceso", select: "_id email rol" });
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
      //console.log("Usuario válido:", usuario);

      const reg = await sociedad.find({ usuariosConAcceso: usuario._id }).populate({
        path: "usuariosConAcceso",
        select: "_id email rol"
      });;
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

export default {
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
