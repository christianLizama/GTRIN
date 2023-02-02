import carpeta from "../../models/Carpeta";
import subCarpeta from "../../models/SubCarpeta";

//Metodo para crear una carpeta
const add = async (req, res, next) => {
  try {
    const reg = await carpeta.create(req.body.carpeta);
    // const buscado = await carpeta.findOne(reg._id);
    // req.body.parametros.forEach(element => {
    //   buscado.parametros.push(element); 
    // });
    // const actualizado = await carpeta.findByIdAndUpdate(buscado._id, buscado, { new: true });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener una carpeta mediante su id
const query = async (req, res, next) => {
  try {
    console.log(req.query._id);
    const reg = await carpeta.findOne({ _id: req.query._id });
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

//Metodo para obtener una carpeta mediante su nombre
const queryNombre = async (req, res, next) => {
  try {
    const reg = await carpeta.findOne({ nombre: req.query.nombre });
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
    console.log(req.body);
    const reg = await carpeta.findByIdAndUpdate(
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

//Metodo para actualizar una carpeta en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id;
    const body = req.body.carpeta;
    const reg = await carpeta.findByIdAndUpdate(id, body, { new: true });
    // const subCarpetas = await subCarpeta.find();
    // subCarpetas.forEach(async carpeta => {
    //   if(carpeta.padre == id){
    //     await subCarpeta.findByIdAndUpdate(
    //       { _id: carpeta._id},
    //       { parametros: reg.parametros }
    //     );
    //   }  
    // });
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};
//Metodo para eliminar una carpeta mediante _id
const remove = async (req, res, next) => {
  try {
    const id = req.params;
    console.log(id);
    const reg = await carpeta.findByIdAndDelete({ _id: id.id });
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
//Metodo para eliminar todas las subcarpetas de una carpeta eliminada
const removeSubFolders = async (req, res, next) => {
  try {
    const id = req.params;
    const reg = await subCarpeta.deleteMany({ padre: id.id });
    console.log(req.params.id);
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
    const reg = await carpeta.findOne({ _id: req.query._id });
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
    console.log(req.body);
    const reg = await carpeta.findByIdAndUpdate(
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
//Metodo para obtener todas las carpetas
const getAllFolders = async (req, res, next) => {
  try {
    const reg = await carpeta.find();
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
  updateHijos,
  queryNombre,
  querysubFolders,
  addFolder,
  removeSubFolders,
  getAllFolders,
};
