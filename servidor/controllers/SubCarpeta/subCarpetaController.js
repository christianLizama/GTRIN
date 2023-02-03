import subCarpeta from "../../models/SubCarpeta";
import archivo from "../../models/Archivo";
import moment from "moment";
//Metodo para crear una sub carpeta
const add = async (req, res, next) => {
  try {
    const reg = await subCarpeta.create(req.body.carpeta);
    // const buscado = await subCarpeta.findOne(reg._id);
    // req.body.parametros.forEach(element => {
    //   buscado.parametros.push(element); 
    // });
    // const actualizado = await subCarpeta.findByIdAndUpdate(buscado._id, buscado, { new: true });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener una sub carpeta mediante su id
const query = async (req, res, next) => {
  try {
    console.log(req.query._id);
    const reg = await subCarpeta.findOne({ _id: req.query._id });
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

//Metodo para obtener una subCarpeta carpeta mediante su nombre
const queryNombre = async (req, res, next) => {
  try {
    const reg = await subCarpeta.findOne({ nombre: req.query.nombre });
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

//Metodo para obtener los hijos de una carpeta
const getArchivosParametro = async (req, res, next) => {
  try {
    const id = req.query._id;
    const reg = await archivo.find({ parametro: id });
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



//Metodo para obtener los hijos de una carpeta
const getArchivos = async (req, res, next) => {
  try {
    const id = req.query._id;
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

//Metodo para agregar archivos a una subCarpeta
const addFile = async (req, res, next) => {
  try {
    console.log(req.body);
    const reg = await subCarpeta.findByIdAndUpdate(
      { _id: req.body._id },
      { archivos: req.body.archivo }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para actualizar una sub carpeta en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id;
    const body = req.body.subCarpeta;
    const reg = await subCarpeta.findByIdAndUpdate(id, body, { new: true });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar una sub carpeta mediante _id
const remove = async (req, res, next) => {
  try {
    const id = req.params;
    console.log(id);
    const reg = await subCarpeta.findByIdAndDelete({ _id: id.id });
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

//Metodo para actualizar los archivos de una sub carpeta
const updateHijos = async (req, res, next) => {
  try {
    console.log(req.body);
    const reg = await subCarpeta.findByIdAndUpdate(
      { _id: req.body._id },
      { archivos: req.body.archivos }
    );
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener todas las subcarpetas
const getAllSubFolders = async (req, res, next) => {
  try {
    const reg = await subCarpeta.find();
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
  queryNombre,
  addFile,
  updateHijos,
  getAllSubFolders,
  getArchivosParametro
};
