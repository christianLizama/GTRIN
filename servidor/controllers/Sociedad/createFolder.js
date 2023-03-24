import fs from "fs";

//Metodo para crear una carpeta padre
const addFolder = async (req, res, next) => {
  try {
    var reg = false;
    var ruta = req.body.ruta;
    //console.log("Nueva Carpeta: " + req.body.ruta);
    if (fs.existsSync("./uploads/" + ruta)) {
      reg = false;
    } else {
      fs.mkdir("./uploads/" + ruta, (error) => {
        if (error) {
          console.log(error.message);
          return;
        }
        console.log("se logro la insercion");
      });
      reg = true;
    }
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para renombrar una carpeta
const renameFolder = async (req, res, next) => {
  try {
    var reg = false;
    var ruta = req.body.ruta;
    var nuevoNombre = req.body.nuevoNombre;
    var path = "./uploads/" + ruta
    var nueva = path.substring(0, path.lastIndexOf('/'));
    if (fs.existsSync(path)) {
      console.log("si existe la ruta")
      reg = false;
      var newName = nueva+ "/" + nuevoNombre;
      console.log(newName)
      
      fs.rename(path, newName, function (err) {
        if (err){
          console.log(err);
          res.status(200).json(false);
        }
        else{
          console.log('Carpeta renombrada');
          res.status(200).json(true);
        } 
      });
    }
    else{
      res.status(200).json(false)
    }

  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//metodo para crear una carpeta dentro de otra
const addsubFolder = async (req, res, next) => {
  try {
    var reg = false;
    var nombreCarpeta = req.body.nombre;
    var nombreCarpetaR = req.body.origen;
    console.log("Nueva Carpeta: " + req.body.nombre);
    console.log("Carpeta de Origen: " + req.body.origen);
    if (fs.existsSync("./uploads/" + nombreCarpetaR + "/" + nombreCarpeta)) {
      reg = false;
    } else {
      fs.mkdir("./uploads/" + nombreCarpetaR + "/" + nombreCarpeta, (error) => {
        if (error) {
          console.log(error.message);
          return;
        }
        console.log("se logro la insercion");
      });
      reg = true;
    }
    res.status(200).json(reg);
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

//Metodo para obtener las carpetas dentro de otras carpetas

module.exports = {
  addFolder,
  addsubFolder,
  renameFolder,
};
