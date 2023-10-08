import archivo from "../models/Archivo.js";
import folder from "../models/Carpeta.js";
import subCarpeta from "../models/SubCarpeta.js";
import sociedad from "../models/Sociedad.js";

const Carpeta = folder.Carpeta;

// Actualizar el cumplimiento de todas las carpetas
async function actualizarCumplimientoTodasCarpetas() {
  try {
    // Obtener todas las carpetas
    const carpetas = await Carpeta.find();

    // Iterar a través de las carpetas y actualizar el cumplimiento
    for (const carpeta of carpetas) {
      await calcularCumplimientoCarpeta(carpeta._id);
    }

    console.log("Cumplimiento de todas las carpetas actualizado");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Actualizar el cumplimiento de todas las subcarpetas
async function actualizarCumplimientoTodasSubCarpetas() {
  try {
    // Obtener todas las subcarpetas
    const subCarpetas = await subCarpeta.find();

    // Iterar a través de las subcarpetas y actualizar el cumplimiento
    for (const subCarpeta of subCarpetas) {
      await calcularCumplimientoSubCarpeta(subCarpeta._id);
    }

    console.log("Cumplimiento de todas las subcarpetas actualizado");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Actualizar el cumplimiento de todas las subcarpetas
async function actualizarCumplimientoTodasSociedades() {
  try {
    // Obtener todas las subcarpetas
    const sociedades = await sociedad.find();

    // Iterar a través de las subcarpetas y actualizar el cumplimiento
    for (const soc of sociedades) {
      await calcularCumplimientoSociedad(soc._id);
    }

    console.log("Cumplimiento de todas las subcarpetas actualizado");
  } catch (error) {
    console.error("Error:", error);
  }
}

//calcula el cumplimiento de la carpeta
async function calcularCumplimientoCarpeta(idCarpeta) {
  try {
    console.log("Actualizando cumplimiento de carpeta");
    // Buscar la carpeta
    let carpeta = await Carpeta.findById(idCarpeta);

    if (!carpeta) {
      console.error("Carpeta no encontrada");
      return;
    }

    // Obtener las subcarpetas que pertenecen a la carpeta
    const subCarpetas = await subCarpeta.find({ padre: idCarpeta });

    // Contador de subcarpetas cumplidas
    let subCarpetasCumplidas = 0;

    // Contador de subcarpetas totales
    const subCarpetasTotales = subCarpetas.length;

    // Verificar si cada subcarpeta cumple con el atributo "cumplimiento" igual a "Cumple"
    subCarpetas.forEach((subCarpeta) => {
      if (subCarpeta.cumplimiento === "Cumple") {
        subCarpetasCumplidas++;
      }
    });

    // Calcular el porcentaje de cumplimiento de la carpeta
    const porcentajeCumplimiento =
      subCarpetasTotales === 0
        ? 0
        : Math.round((subCarpetasCumplidas / subCarpetasTotales) * 100);

    console.log("--------");
    console.log(carpeta);
    console.log("--------");

    // Actualizar el porcentaje de cumplimiento de la carpeta
    if (!comprobarExistenciaAtributo(carpeta, "porcentaje")) {
      // Actualiza el documento con el nuevo campo "porcentaje"
      //console.log("Porcentaje nuevo de la carpeta: "+porcentajeCumplimiento);
      await carpeta.updateOne(
        { _id: idCarpeta },
        { $set: { porcentaje: porcentajeCumplimiento } }
      );
    } else {
      // Si ya existe, actualizamos su valor
      //console.log(porcentajeCumplimiento)
      carpeta.porcentaje = porcentajeCumplimiento;
      carpeta.save();
    }

    console.log("Porcentaje de carpeta actualizado");
  } catch (error) {
    console.error("Error:", error);
  }
}

function comprobarExistenciaAtributo(objeto, atributo) {
  for (const key in objeto) {
    if (key === atributo) {
      return true;
    }
  }
  return false;
}

//calcula el cumplimiento de la subcarpeta
async function calcularCumplimientoSubCarpeta(subCarpetaId) {
  console.log("Actualizando cumplimiento de SubCarpeta");
  try {
    // Buscar la subcarpeta y su carpeta padre para obtener los parámetros
    let subFolder = await subCarpeta.findById(subCarpetaId).populate({
      path: "padre",
      populate: { path: "parametros" }, // Poblar los parámetros de la carpeta
    });

    if (!subFolder) {
      console.error("Subcarpeta no encontrada");
      return;
    }

    let carpeta = subFolder.padre;

    // Obtener los archivos válidos de la subcarpeta
    const archivosValidos = await archivo.find({
      padre: subCarpetaId,
      status: { $in: ["Vigente", "Por vencer"] },
    });

    // Obtener los parámetros de la carpeta que tienen option = true
    const parametrosCarpeta = carpeta.parametros
      .filter((parametro) => parametro.option)
      .map((parametro) => parametro._id.toString());

    // Crear un conjunto para llevar un registro de parámetros ya contados
    const parametrosContados = new Set();

    // Contador de parámetros cumplidos
    let parametrosCumplidos = 0;

    // Verificar si cada archivo cumple con al menos un parámetro válido
    archivosValidos.forEach((archivo) => {
      const parametroId = archivo.parametro.toString();
      if (
        parametrosCarpeta.includes(parametroId) &&
        !parametrosContados.has(parametroId)
      ) {
        parametrosCumplidos++;
        parametrosContados.add(parametroId);
      }
    });

    // Obtener el total de parámetros de la carpeta
    const parametrosTotales = parametrosCarpeta.length;

    // Calcular el cumplimiento y actualizar la subcarpeta
    let porcentajeGeneral =
      parametrosTotales === 0
        ? 0
        : Math.round((parametrosCumplidos / parametrosTotales) * 100);

    // Ajuste para que la variable de cumplimiento muestre "Cumple" al 100%
    let cumplimientoSubCarpeta = "No cumple";

    if (porcentajeGeneral === 100) {
      cumplimientoSubCarpeta = "Cumple";
    }
    console.log("--------soy la subcarpeta----------");
    console.log(subFolder);
    console.log("------------------");

    //Verificar existencia de atributos de la subcarpeta
    if (!comprobarExistenciaAtributo(subFolder, "porcentaje")) {
      console.log("subcarpeta no posee porcentaje");
      if (!comprobarExistenciaAtributo(subFolder, "cumplimiento")) {
        console.log("subcarpeta no posee cumplimiento");
        await subCarpeta.updateOne(
          { _id: subFolder._id },
          { $set: { cumplimiento: cumplimientoSubCarpeta } }
        );
      }
      // Actualiza el documento con el nuevo campo "porcentaje"
      await subCarpeta.updateOne(
        { _id: subFolder._id },
        { $set: { porcentaje: porcentajeGeneral } }
      );
    } else {
      // Si ya existe, actualizamos su valor
      subFolder.porcentaje = porcentajeGeneral;
      subFolder.cumplimiento = cumplimientoSubCarpeta;
      await subFolder.save();
    }

    //console.log("Cumplimiento actualizado:", subFolder);
    console.log("cumplimiento de SubCarpeta actualizado");
  } catch (error) {
    console.error("Error:", error);
  }
}

//calcula el cumplimiento de la sociedad
async function calcularCumplimientoSociedad(idSociedad) {
  try {
    // Obtener la sociedad
    let reg = await sociedad.findById(idSociedad);
    if (reg) {
      // Obtener las carpetas pertenecientes a la sociedad
      let carpetas = await Carpeta.find({ padre: idSociedad });

      // Inicializar variables para el cálculo
      let totalCarpetas = 0;
      let totalCumplimiento = 0;

      console.log(carpetas);

      // Iterar a través de las carpetas y calcular el total de cumplimiento
      for (const carpeta of carpetas) {
        totalCarpetas++;
        totalCumplimiento += carpeta.porcentaje || 0; // Asegurarse de manejar posibles valores nulos
      }

      // Calcular el porcentaje general
      const porcentajeGeneral =
        totalCarpetas === 0 ? 0 : Math.round(totalCumplimiento / totalCarpetas);

      // Verificar y crear el atributo 'porcentaje' si no existe
      if (!comprobarExistenciaAtributo(reg, "porcentaje")) {
        // Actualiza el documento con el nuevo campo "porcentaje"
        await sociedad.updateOne(
          { _id: idSociedad },
          { $set: { porcentaje: porcentajeGeneral } }
        );
      } else {
        // Si ya existe, actualizamos su valor
        reg.porcentaje = porcentajeGeneral;
        await reg.save();
      }
      console.log(
        "Porcentaje general de cumplimiento de la sociedad:",
        porcentajeGeneral + "%"
      );
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

export default {
  calcularCumplimientoCarpeta,
  calcularCumplimientoSubCarpeta,
  calcularCumplimientoSociedad,
  actualizarCumplimientoTodasCarpetas,
  actualizarCumplimientoTodasSubCarpetas,
  actualizarCumplimientoTodasSociedades,
};
