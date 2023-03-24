// importar el modelo sociedad
import sociedad from "../../models/Sociedad";
import {Carpeta} from "../../models/Carpeta";

//Metodo para añadir una sociedad
const add = async (req, res, next) => {
  try {
    const reg = await sociedad.create(req.body);
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
    //console.log(req.query._id)
    const id = req.query._id;
    const reg = await Carpeta.find({padre:id});
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
    //console.log(req.body);
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
    const id = req.body._id
    const body = req.body.sociedad
    const reg = await sociedad.findByIdAndUpdate(id,body, {new: true});
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
//Metodo para agregar un archivo a la sociedad
const updateCarpetas = async (req, res, next) => {
  try {
    //console.log(req.body);
    const reg = await sociedad.findByIdAndUpdate(
      { _id: req.body._id },
      { carpetas: req.body.carpetas }
    );
    if(reg){
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
    const reg = await sociedad.find();
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
  updateCarpetas,
  queryNombre,
  queryFolders,
  getPadres,
  addFolder
};
