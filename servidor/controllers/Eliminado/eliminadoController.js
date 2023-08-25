import eliminado from "../../models/Eliminado";

// Función para formatear la fecha
function formatearFechaYHoraChilenaConGuion(fecha) {
  const optionsFecha = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "America/Santiago", // Zona horaria de Chile
  };

  const optionsHora = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "America/Santiago", // Zona horaria de Chile
  };

  const fechaFormateada = fecha.toLocaleDateString("es-CL", optionsFecha).replace(/-/g, '/');;
  const horaFormateada = fecha.toLocaleTimeString("es-CL", optionsHora);

  return `${fechaFormateada} - ${horaFormateada}`;
}

// function formatearFecha(fecha) {
//   const dia = fecha.getDate().toString().padStart(2, "0");
//   const mes = (fecha.getMonth() + 1).toString().padStart(2, "0");
//   const año = fecha.getFullYear();
//   return `${dia}/${mes}/${año}`;
// }

//Metodo para obtener los archivos de una sub carpeta
const getAllDeletedFiles = async (req, res, next) => {
  try {
    const reg = await eliminado.find();

    const archivosFormateados = reg.map((archivo) => {
      return {
        ...archivo.toObject(),
        fechaCreacion: formatearFechaYHoraChilenaConGuion(
          archivo.fechaCreacion
        ),
        fechaEliminacion: formatearFechaYHoraChilenaConGuion(
          archivo.fechaEliminacion
        ),
      };
    });

    if (!reg) {
      res.status(404).send({
        message: "No hay ningun registro",
      });
    } else {
      res.status(200).json(archivosFormateados);
    }
  } catch (e) {
    res.status(500).send({
      message: "Ocurrio un error",
    });
    next(e);
  }
};

module.exports = {
  getAllDeletedFiles,
};
