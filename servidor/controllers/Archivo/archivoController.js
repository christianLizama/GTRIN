import archivo from "../../models/Archivo";

//Metodo para crear una sub carpeta
const add = async (req, res, next) => {
    try {
      console.log(req.body)
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


//Metodo para obtener los archivos de una sub carpeta
const getArchivos = async (req, res, next) => {
  try {
    const id = req.query._id;
    const reg = await archivo.find({padre:id});

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


//Metodo para actualizar una sub carpeta en concreto mediante el _id
const update = async (req, res, next) => {
  try {
    const id = req.body._id
    const body = req.body.subCarpeta
    const reg = await archivo.findByIdAndUpdate(id,body, {new: true});
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
    const id  = req.params;
    console.log(id)
    const reg = await archivo.findByIdAndDelete({ _id: id.id });
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

module.exports = {
  add,
  query,
  update,
  remove,
  getArchivos,
  getAllFiles,
};
