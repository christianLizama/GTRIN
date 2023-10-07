import Parametro from "../../models/Parametro.js";
import Archivo from "../../models/Archivo.js";
import Usuario from "../../models/Usuario.js";

//Obtener todos los parametros
export async function getParametros(req, res) {
  const searchQuery = {}; // Objeto de consulta vacío por defecto

  if (req.query.search) {
    // Si se proporciona un término de búsqueda en la consulta, agregamos criterios de búsqueda
    searchQuery.$or = [
      { value: { $regex: req.query.search, $options: "i" } }, // Búsqueda insensible a mayúsculas y minúsculas en el campo "value"
      // Agrega más campos de búsqueda si es necesario
    ];
  }
  const page = req.query.page || 1;
  const limit = req.query.limit || 10;

  const sortOptions = { value: 1 }; // Ordenar en orden ascendente (alfabético) por el campo "value"

  const options = {
    page,
    limit,
    sort: sortOptions,
    populate: {
      path: "usuariosConAcceso",
      select: "email",
    },
  };

  try {
    const result = await Parametro.paginate(searchQuery, options);

    // Obtener el total de parametros
    const total = result.totalDocs;

    // Retornar respuesta con parametros, total de parametros, paginas totales y pagina actual
    res.json({
      parametros: result.docs,
      cantidad: total,
      pages: result.totalPages,
      page: result.page,
    });
  } catch (err) {
    res.status(500).json({ error: "Error al obtener parámetros paginados." });
  }
}

//Obtener un parametro
export async function getParametro(req, res) {
  try {
    const parametro = await Parametro.findById(req.params.id);
    res.json(parametro);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

//Agregar un parametro
export async function addParametro(req, res) {
  try {
    const { value, option, usuariosConAcceso } = req.body;

    let newParametro = new Parametro({
      value,
      option,
      usuariosConAcceso,
    });

    //obtener todos los usuarios administradores
    const usuariosAdministradores = await Usuario.find({ rol: "admin" }, "_id");
    const idsUsuariosAdministradores = usuariosAdministradores.map(
      (usuario) => usuario._id
    );
    //mezclar arreglo de usuarios administradores con arreglo de usuarios con acceso
    newParametro.usuariosConAcceso = [
      ...idsUsuariosAdministradores,
      ...usuariosConAcceso,
    ];

    const parametroSaved = await newParametro.save();
    res.json(parametroSaved);
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.value === 1
    ) {
      // El valor ya existe en la base de datos
      res
        .status(400)
        .json({ message: "Ya existe un parámetro con ese nombre." });
    } else {
      // Otro tipo de error
      res.status(500).json({ message: "Error al agregar el parámetro." });
    }
  }
}

//Eliminar un parametro
export async function deleteParametro(req, res) {
  try {
    const parametro = await Parametro.findByIdAndDelete(req.params.id);
    //Retornar un mensaje de éxito si se elimina el parametro
    if (parametro) {
      // Verificar si hay el menos 1 archivo con este parametro
      const archivos = await Archivo.find({ parametro: parametro._id }).count();
      if (archivos > 0) {
        res.json({
          type: "warning",
          message: `El ${parametro.value} no se puede eliminar porque hay ${archivos} archivos con este parametro`,
          parametro: parametro,
        });
      } else {
        res.json({
          type: "succes",
          message: `El ${parametro.value} ha sido eliminado exitosamente`,
          parametro: parametro,
        });
      }
    }
  } catch (error) {
    res.json({
      message: error,
      type: "error",
    });
  }
}

//Actualizar un parametro
export async function updateParametro(req, res) {
  try {
    const { value, option, usuariosConAcceso } = req.body;
    const newParametro = {
      value,
      option,
      usuariosConAcceso,
    };
    const parametro = await Parametro.findByIdAndUpdate(
      req.params.id,
      newParametro
    );
    res.json(parametro);
  } catch (error) {
    if (
      error.code === 11000 &&
      error.keyPattern &&
      error.keyPattern.value === 1
    ) {
      // El valor ya existe en la base de datos
      res
        .status(400)
        .json({ message: "Ya existe un parámetro con ese nombre." });
    } else {
      // Otro tipo de error
      res.status(500).json({ message: "Error al agregar el parámetro." });
    }
  }
}

// Contar todos los archivos de un parametro
export async function countArchivos(req, res) {
  try {
    let parametroEncontrado = await Parametro.findById(req.query._id);
    console.log(parametroEncontrado);

    const archivos = await Archivo.find({ parametro: req.query._id }).count();
    const retorno = {
      nombre: "Archivos Totales",
      total: archivos,
      porcentaje: 100,
    };
    res.json(retorno);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

// Contar todos los archivos vencidos de un parametro
export async function countArchivosVencidos(req, res) {
  try {
    const archivos = await Archivo.find({
      parametro: req.query._id,
      status: "Vencido",
    }).count();

    let retorno = {
      nombre: "Vencidos",
      total: 0,
      porcentaje: 0,
    };

    // Verificar si hay el menos 1 archivo con este parametro
    if (archivos > 0) {
      const total = await Archivo.find().count();
      const porcentaje = (archivos / total) * 100;
      let intPorcentaje = Math.round(porcentaje);
      retorno = {
        nombre: "Vencidos",
        total: archivos,
        porcentaje: intPorcentaje,
      };
    }

    res.json(retorno);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

// Contar todos los archivos vigentes de un parametro
export async function countArchivosVigentes(req, res) {
  try {
    const archivos = await Archivo.find({
      parametro: req.query._id,
      status: "Vigente",
    }).count();

    let retorno = {
      nombre: "Vigentes",
      total: 0,
      porcentaje: 0,
    };

    // Verificar si hay el menos 1 archivo con este parametro
    if (archivos > 0) {
      const total = await Archivo.find().count();
      const porcentaje = (archivos / total) * 100;
      let intPorcentaje = Math.round(porcentaje);
      retorno = {
        nombre: "Vigentes",
        total: archivos,
        porcentaje: intPorcentaje,
      };
    }
    res.json(retorno);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

// Contar todos los archivos por vencer de un parametro
export async function countArchivosPorVencer(req, res) {
  try {
    const archivos = await Archivo.find({
      parametro: req.query._id,
      status: "Por vencer",
    }).count();

    let retorno = {
      nombre: "Por vencer",
      total: 0,
      porcentaje: 0,
    };

    // Verificar si hay el menos 1 archivo con este parametro
    if (archivos > 0) {
      const total = await Archivo.find().count();
      const porcentaje = (archivos / total) * 100;
      let intPorcentaje = Math.round(porcentaje);
      retorno = {
        nombre: "Por vencer",
        total: archivos,
        porcentaje: intPorcentaje,
      };
    }

    res.json(retorno);
  } catch (error) {
    res.json({
      message: error,
    });
  }
}

export default {
  getParametros,
  getParametro,
  addParametro,
  deleteParametro,
  updateParametro,
  countArchivos,
  countArchivosVencidos,
  countArchivosVigentes,
  countArchivosPorVencer,
};
