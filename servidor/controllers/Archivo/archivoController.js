import archivo from "../../models/Archivo";
const fs = require("fs");

//Metodo para crear una sub carpeta
const add = async (req, res, next) => {
  try {
    console.log(req.body);
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

    const reg = await archivo.find({ parametro: id, padre: idPadre }).count();
    res.status(200).json(reg);
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
    const body = req.body.archivo;
    const reg = await archivo.findByIdAndUpdate(id, body, { new: true });
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
    const {id,fileName} = req.body;
    const reg = await archivo.findByIdAndDelete({ _id: id });
    if (reg) {
      const directoryPath = __basedir + "/uploads/";
      fs.unlink(directoryPath + fileName, (err) => {
        if (err) {
          res.status(500).send({
            message: "Could not delete the file. " + err,
          });
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

function deleteFiles(files, callback) {
  const directoryPath = __basedir + "/uploads/";
  if(files.length>0){
    files.forEach((element) => {
      fs.unlink(directoryPath + element.archivo, (err) => {
        if (err) {
          callback(2);
          return;
        }
      });
    });
    callback(3);
  }
  else{
    callback(1)
  }
}

//Metodo para eliminar todos los archivos de una sub carpeta
const removeAll = async (req, res, next) => {
  try {
    const { id } = req.body;
    const archivos = await archivo.find({padre: id});
    const reg = await archivo.deleteMany({ padre: id });
    if (reg) {
      deleteFiles(archivos, function(err) {
        if (err==1) {
          res.status(200).send({
            message: "No hay archivos"
          });
        }
        else if(err==2){
          res.status(500).send({
            message: "Ocurrio un error al eliminar los archivos" + err
          });
        }
        else {
          res.status(200).send({
            message: "Archivos eliminados exitosamente"
          })
        }
      });
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
    const archivos = await archivo.find({abuelo: id});
    const reg = await archivo.deleteMany({ abuelo: id });
    if (reg) {
      deleteFiles(archivos, function(err) {
        if (err==1) {
          res.status(200).send({
            message: "No hay archivos"
          });
        }
        else if(err==2){
          res.status(500).send({
            message: "Ocurrio un error al eliminar los archivos" + err
          });
        }
        else {
          res.status(200).send({
            message: "Archivos eliminados exitosamente"
          })
        }
      });
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
  getAllFiles,
  countFiles,
  removeAll,
  removeFolderFiles
};
