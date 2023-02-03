import {Carpeta} from "../../models/Carpeta";
import subCarpeta from "../../models/SubCarpeta";

//Metodo para crear una Carpeta
const add = async (req, res, next) => {
  try {
    const reg = await Carpeta.create(req.body.Carpeta);
    // const buscado = await Carpeta.findOne(reg._id);
    // req.body.parametros.forEach(element => {
    //   buscado.parametros.push(element); 
    // });
    // const actualizado = await Carpeta.findByIdAndUpdate(buscado._id, buscado, { new: true });
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
    let {id,parametros} = req.body
    console.log(id)
    const folder = await Carpeta.findOne({_id:id});
    console.log(folder)
    if(folder){
      parametros.forEach(parametro => {
        folder.parametros.push(parametro)
      });
      const CarpetaActualizada = await Carpeta.findByIdAndUpdate(id,folder)
      if(CarpetaActualizada){
        res.status(200).json(CarpetaActualizada)
      }
    }
    else{
      res.status(404).json("La Carpeta buscada no existe")
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
    let {id,parametros,eliminados} = req.body
    const CarpetaActualizada = await Carpeta.findById(id).then((folder) => {
      
      parametros.forEach(param => {
        const params = folder.parametros.id(param._id)
        if(params){
          params.set(param)
        }
        else{
          folder.parametros.addToSet(param);
        }
      });
      //Para eliminar
      eliminados.forEach(eliminado => {
        const a = folder.parametros.id(eliminado._id).remove();
      });
      // 
      return folder.save();
    })
    if(CarpetaActualizada){
      res.status(200).json(CarpetaActualizada)
    }
    else{
      res.status(404).json("La Carpeta buscada no existe")
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
    console.log(req.query._id);
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
    const body = req.body.Carpeta;
    const reg = await Carpeta.findByIdAndUpdate(id, body, { new: true });
    // const subCarpetas = await subCarpeta.find();
    // subCarpetas.forEach(async Carpeta => {
    //   if(Carpeta.padre == id){
    //     await subCarpeta.findByIdAndUpdate(
    //       { _id: Carpeta._id},
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
//Metodo para eliminar una Carpeta mediante _id
const remove = async (req, res, next) => {
  try {
    const id = req.params;
    console.log(id);
    const reg = await Carpeta.findByIdAndDelete({ _id: id.id });
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
//Metodo para eliminar todas las subCarpetas de una Carpeta eliminada
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
    console.log(req.body);
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
  actualizarParametros
};
