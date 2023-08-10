import archivo from "../models/Archivo";
import { Carpeta } from "../models/Carpeta";
import subCarpeta from "../models/SubCarpeta";
import sociedad from "../models/Sociedad";

//calcula el cumplimiento de la carpeta
async function calcularCumplimientoCarpeta(idCarpeta) {
  try {
    // Buscar la carpeta
    const carpeta = await Carpeta.findById(idCarpeta);

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

    carpeta.porcentaje = porcentajeCumplimiento;
    carpeta.save();
    console.log("Porcentaje de cumplimiento actualizado:", carpeta);
  } catch (error) {
    console.error("Error:", error);
  }
}

//calcula el cumplimiento de la subcarpeta
async function calcularCumplimientoSubCarpeta(subCarpetaId) {
  try {
    // Buscar la subcarpeta y su carpeta padre para obtener los parámetros
    const subFolder = await subCarpeta.findById(subCarpetaId).populate("padre");

    if (!subFolder) {
      console.error("Subcarpeta no encontrada");
      return;
    }

    const carpeta = subFolder.padre;

    // Obtener los archivos válidos de la subcarpeta
    const archivosValidos = await archivo.find({
      padre: subCarpetaId,
      status: "Vigente",
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
    subFolder.porcentaje =
      parametrosTotales === 0
        ? 0
        : Math.round((parametrosCumplidos / parametrosTotales) * 100);

    // Ajuste para que la variable de cumplimiento muestre "Cumple" al 100%
    if (subFolder.porcentaje === 100) {
      subFolder.cumplimiento = "Cumple";
    } else {
      subFolder.cumplimiento = "No cumple";
    }

    await subFolder.save();

    console.log("Cumplimiento actualizado:", subFolder);
  } catch (error) {
    console.error("Error:", error);
  }
}

//calcula el cumplimiento de la sociedad
async function calcularCumplimientoSociedad(idSociedad) {
  try {
    // Obtener la sociedad
    const reg = await sociedad.findById(idSociedad);
    if (reg) {
      // Obtener las carpetas pertenecientes a la sociedad
      const carpetas = await Carpeta.find({ padre: idSociedad });

      // Inicializar variables para el cálculo
      let totalCarpetas = 0;
      let totalCumplimiento = 0;

      // Iterar a través de las carpetas y calcular el total de cumplimiento
      for (const carpeta of carpetas) {
        totalCarpetas++;
        totalCumplimiento += carpeta.porcentaje || 0; // Asegurarse de manejar posibles valores nulos
      }

      // Calcular el porcentaje general
      const porcentajeGeneral =
        totalCarpetas === 0 ? 0 : Math.round(totalCumplimiento / totalCarpetas);

      // Verificar y crear el atributo 'porcentaje' si no existe
      if (!reg.hasOwnProperty("porcentaje")) {
        // Actualiza el documento con el nuevo campo "porcentaje"
        console.log(porcentajeGeneral);
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

module.exports = { calcularCumplimientoCarpeta, calcularCumplimientoSubCarpeta, calcularCumplimientoSociedad };
