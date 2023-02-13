<template>
  <div>
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text"> Dashboard </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <loading v-if="isLoading" texto="Obteniendo información"></loading>
    <v-container v-if="!isLoading" :fluid="true">
      <Kpi :items="kpi"></Kpi>
    </v-container>
    <div class="contenedor" v-if="!isLoading">
      <v-card elevation="5" outlined class="mx-auto" max-width="98.6%">
        <v-card-title>
          Filtros <v-spacer></v-spacer>
          <v-btn text color="blue accent-4" @click="limpiarFiltros()">
            Limpiar Filtros
          </v-btn>
          <v-btn
            text
            color="blue accent-4"
            large
            @click.stop="showScheduleForm = true"
          >
            Enviar Trigger
          </v-btn>
        </v-card-title>
        <v-card-text>
          <v-row align="center">
            <v-col cols="11" sm="5" md="6">
              <v-select
                :items="sociedades"
                return-object
                v-model="sociedadSeleccionada"
                item-text="nombre"
                label="Sociedades"
                dense
                outlined
              ></v-select>
            </v-col>
            <v-col cols="11" sm="5" md="6">
              <v-select
                label="Carpetas"
                dense
                outlined
                item-text="nombre"
                :items="computedCarpeta"
                return-object
                v-model="carpetaSelecionada"
              ></v-select>
            </v-col>

            <v-col cols="11" sm="5" md="6">
              <v-select
                v-model="subCarpetaSelecionada"
                :items="computedSubCarpeta"
                item-text="nombre"
                return-object
                label="Sub Carpeta"
                dense
                outlined
              ></v-select>
            </v-col>

            <v-col cols="11" sm="5" md="6">
              <v-select
                :items="estados"
                v-model="estadoSeleccionado"
                item-text="nombre"
                return-object
                label="Status"
                dense
                outlined
              ></v-select>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>
    </div>

    <div class="contenedor" v-if="!isLoading">
      <v-card elevation="5" outlined class="mx-auto mb-8" max-width="98.6%">
        <v-data-table
          :headers="headers"
          :items="filtros"
          sort-by="nombre"
          class="elevation-1"
          :search="search"
        >
          <template v-slot:[`item.fechaCambioEstado`]="{ item }">
            {{ fechaFormateada(item.fechaCambioEstado) }}
          </template>
          <template v-slot:[`item.fechaEmision`]="{ item }">
            {{ fechaFormateada(item.fechaEmision) }}
          </template>
          <template v-slot:[`item.fechaCaducidad`]="{ item }">
            {{ fechaFormateada(item.fechaCaducidad) }}
          </template>

          <template v-slot:[`item.status`]="{ item }">
            <v-chip :color="getColor(item.status, item)" dark>
              {{ getNombre(item.status) }}
            </v-chip>
          </template>
          <template v-slot:[`item.archivo`]="{ item }">
            <div class="text-truncate" style="max-width: 140px">
              <v-icon class="mr-2"> mdi-file-pdf-box</v-icon>
              <a class="texto" :href="link + 'uploadFile/files/' + item.archivo"
                >{{ item.archivo }}
              </a>
            </div>
          </template>

          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title>Archivos</v-toolbar-title>
              <v-divider class="mx-4" inset vertical></v-divider>
              <v-spacer></v-spacer>
              <v-text-field
                v-model="search"
                label="Ingrese nombre de archivo"
                hide-details
                single-line
                prepend-inner-icon="mdi-magnify"
              ></v-text-field>
              <template>
                <vue-json-to-csv
                  :json-data="archivos"
                  :labels="{
                    nombreSociedad: { title: 'Nombre Contenedor' },
                    nombreCarpeta: { title: 'Carpeta' },
                    nombreSubCarpeta: { title: 'SubCarpeta' },
                    archivo: { title: 'Archivo' },
                    estado: { title: 'Status del documento' },
                    fechaEmision: { title: 'Fecha emision' },
                    fechaCambioEstado: { title: 'Fecha de alerta' },
                    fechaCaducidad: { title: 'Fecha Caducidad ' },
                  }"
                  csv-title="resumenGeneral"
                  :separator="';'"
                >
                  <v-btn icon>
                    <v-icon color="green">mdi-microsoft-excel</v-icon></v-btn
                  >
                </vue-json-to-csv>
              </template>
            </v-toolbar>
          </template>

          <template v-slot:no-data>
            <v-btn color="primary" @click="initialize"> Reset </v-btn>
          </template>
        </v-data-table>
      </v-card>
    </div>
    <trigger v-model="showScheduleForm"></trigger>
  </div>
</template>

<script>
import axios from "axios";
import moment from "moment";
import VueJsonToCsv from "vue-json-to-csv";
import Kpi from "../Kpi.vue";
import loading from "../loading.vue";
import Trigger from "../trigger.vue";
export default {
  components: { VueJsonToCsv, loading, Trigger, Kpi },
  data: () => ({
    showScheduleForm: false,
    link: process.env.VUE_APP_SERVER_URL,
    cVigente: 0,
    cPorVencer: 0,
    cCaducado: 0,
    busqueda: "",
    search: "",
    isLoading: true,
    sociedades: [],
    sociedadSeleccionada: {
      nombre: "Todo",
      _id: "",
    },
    carpetaSelecionada: {
      nombre: "Todo",
      _id: "",
    },
    subCarpetaSelecionada: {
      nombre: "Todo",
      _id: "",
    },
    estadoSeleccionado: {
      nombre: "Todos",
      codigo: 0,
    },
    defaultFilter: {
      nombre: "Todo",
      _id: "",
    },
    defaultStatusFilter: {
      nombre: "Todos",
      codigo: 0,
    },
    carpetas: [],
    todoCarpetas: [],
    carpetasDefault: [{ nombre: "Todo", _id: "" }],
    subCarpetas: [],
    todoSubCarpetas: [],
    subCarpetasDefault: [{ nombre: "Todo", _id: "" }],
    kpi: [
      {
        nombre: "Archivos totales",
        color: "blue",
        icon: "mdi-file",
        id: 0,
        total: 0,
        porcentaje: 0,
      },
      {
        nombre: "Vigentes",
        color: "green",
        id: 3,
        icon: "mdi-check",
        total: 0,
        porcentaje: 0,
      },
      {
        nombre: "Por Vencer",
        color: "orange",
        icon: "mdi-alert-octagon-outline",
        id: 2,
        total: 0,
        porcentaje: 0,
      },
      {
        nombre: "Vencidos",
        color: "red",
        icon: "mdi-close-box-outline",
        id: 1,
        total: 0,
        porcentaje: 0,
      },
    ],
    estados: [
      { nombre: "Todos", codigo: 0 },
      { nombre: "Vigente", codigo: 3 },
      { nombre: "Por vencer", codigo: 2 },
      { nombre: "Vencido", codigo: 1 },
    ],
    headers: [
      {
        text: "Sociedad",
        align: "start",
        sortable: true,
        value: "nombreSociedad",
      },
      {
        text: "Carpeta",
        align: "start",
        sortable: true,
        value: "nombreCarpeta",
      },
      {
        text: "SubCarpeta",
        align: "start",
        sortable: true,
        value: "nombreSubCarpeta",
      },
      {
        text: "Nombre",
        align: "start",
        sortable: false,
        value: "nombre",
      },
      {
        text: "Status archivo",
        align: "center",
        sortable: true,
        value: "status",
      },
      {
        text: "Dias de vigencia archivo",
        align: "center",
        sortable: false,
        value: "diasVigencia",
      },
      {
        text: "Dias restantes caducidad",
        align: "center",
        sortable: true,
        value: "diasRestantes",
      },
      { text: "Archivo", sortable: false, value: "archivo" },
      { text: "Tamaño", value: "peso" },
      { text: "Fecha Emisión", value: "fechaEmision" },
      {
        text: "Fecha estado por vencer",
        sortable: false,
        align: "center",
        value: "fechaCambioEstado",
      },
      { text: "Fecha Caducidad", value: "fechaCaducidad" },
    ],
    message: "",
    archivos: [],
  }),
  computed: {
    filtros() {
      return this.filtroSociedad(
        this.filtroCarpetas(
          this.filtroSubCarpetas(this.filtroStatus(this.archivos))
        )
      );
    },
    computedCarpeta() {
      return this.carpetasHijas(this.carpetas);
    },
    computedSubCarpeta() {
      return this.subCarpetasHijas(this.subCarpetas);
    },
  },
  watch: {},
  created() {
    this.iniciarSociedad();
    //this.componentDidMount();
    // this.iniciarCarpetas();
    // this.iniciarSubCarpetas();
  },
  methods: {
    fechaFormateada(fecha) {
      let fechaFormat = moment(fecha).format("DD/MM/YYYY");
      return fechaFormat;
    },
    obtenerFechaAviso(item) {
      let fecha = moment(item.fechaEmision)
        .add(item.diasAviso, "days")
        .format("DD/MM/YYYY");
      return fecha;
    },
    contadorArchivos(lista, opcion) {
      let archivosFiltrados = lista.filter(
        (archivo) => archivo.status === opcion
      );
      return archivosFiltrados.length;
    },
    carpetasHijas(carpetas) {
      if (this.sociedadSeleccionada.nombre == "Todo") {
        this.carpetaSelecionada = this.carpetasDefault[0];
        return this.carpetasDefault;
      }
      let hijas = carpetas.filter((item) => {
        return item.padre === this.sociedadSeleccionada._id;
      });
      hijas.unshift({ nombre: "Todo", _id: "" });
      return hijas;
    },
    subCarpetasHijas(subCarpetas) {
      if (
        this.carpetaSelecionada.nombre == "Todo" &&
        this.sociedadSeleccionada.nombre == "Todo"
      ) {
        this.subCarpetaSelecionada = this.subCarpetasDefault[0];
        return this.subCarpetasDefault;
      }
      let hijas = subCarpetas.filter((item) => {
        return item.padre === this.carpetaSelecionada._id;
      });
      hijas.unshift({ nombre: "Todo", _id: "" });
      return hijas;
    },
    filtroSociedad(archivos) {
      return archivos.filter(
        (archivo) =>
          !archivo.padreSuperior.indexOf(this.sociedadSeleccionada._id)
      );
    },
    filtroCarpetas(archivos) {
      let listaFiltrada = archivos.filter(
        (archivo) => !archivo.abuelo.indexOf(this.carpetaSelecionada._id)
      );
      return listaFiltrada;
    },
    filtroSubCarpetas(archivos) {
      return archivos.filter(
        (archivo) => !archivo.padre.indexOf(this.subCarpetaSelecionada._id)
      );
    },
    filtroStatus(archivos) {
      if (this.estadoSeleccionado.codigo == 0) {
        return archivos;
      }
      let archivosFiltrados = archivos.filter(
        (archivo) => archivo.status === this.estadoSeleccionado.codigo
      );
      return archivosFiltrados;
    },
    limpiarFiltros() {
      this.sociedadSeleccionada = Object.assign({}, this.defaultFilter);
      this.carpetaSelecionada = Object.assign({}, this.defaultFilter);
      this.subCarpetaSelecionada = Object.assign({}, this.defaultFilter);
      this.estadoSeleccionado = Object.assign({}, this.defaultStatusFilter);
    },
    obtenerNombreSociedad(itemId) {
      let found = this.sociedades.find((e) => e._id === itemId);
      let nombreSociedad = found.nombre;
      return nombreSociedad;
    },
    obtenerNombreCarpeta(itemId) {
      var found = this.todoCarpetas.find((e) => e._id === itemId);
      return found.nombre;
    },
    obtenerNombreSubCarpeta(itemId) {
      var found = this.todoSubCarpetas.find((e) => e._id === itemId);
      return found.nombre;
    },
    async iniciarSociedad() {
      await axios
        .get("/sociedad/getPadres")
        .then((result) => {
          this.sociedades = result.data;
          this.sociedades.unshift({ nombre: "Todo", _id: "" });
          return axios.get("/carpeta/getAllFolders");
        })
        .then((result) => {
          this.carpetas = result.data;
          this.todoCarpetas = result.data;
          return axios.get("/subCarpeta/getAllSubFolders");
        })
        .then((result) => {
          this.subCarpetas = result.data;
          this.todoSubCarpetas = result.data;
          return axios.get("archivo/allFiles");
        })
        .then((result) => {
          result.data.forEach((element) => {
            this.iniciarFile(element);
          });
          this.archivos = result.data;
          this.isLoading = false;
          let total = 0;
          var porcentaje = 0;
          var intPorcentaje = 0;
          this.kpi.forEach((element) => {
            element.porcentaje = 0;
            if (element.id == 0) {
              element.total = this.archivos.length;
              total = this.archivos.length;
              element.porcentaje = 100;
            } else if (element.id == 3) {
              element.total = this.contadorArchivos(this.archivos, 3);
              porcentaje = (element.total / total) * 100;
              intPorcentaje = Math.round(porcentaje);
              element.porcentaje = intPorcentaje;
            } else if (element.id == 2) {
              element.total = this.contadorArchivos(this.archivos, 2);
              porcentaje = (element.total / total) * 100;
              intPorcentaje = Math.round(porcentaje);
              element.porcentaje = intPorcentaje;
            } else {
              element.total = this.contadorArchivos(this.archivos, 1);
              porcentaje = (element.total / total) * 100;
              intPorcentaje = Math.round(porcentaje);
              element.porcentaje = intPorcentaje;
            }
          });
        });
    },
    async iniciarCarpetas() {
      await axios.get("/carpeta/getAllFolders").then((result) => {
        this.carpetas = result.data;
        this.todoCarpetas = result.data;
      });
    },
    async iniciarSubCarpetas() {
      await axios.get("/subCarpeta/getAllSubFolders").then((result) => {
        this.subCarpetas = result.data;
        this.todoSubCarpetas = result.data;
      });
    },
    obtenerDiferencia(fechaEmision, fechaVencimiento) {
      var fecha1 = moment(fechaEmision);
      var fecha2 = moment(fechaVencimiento);
      return fecha2.diff(fecha1, "days");
    },
    getNombre(status) {
      if (status == 3) return "Vigente";
      else if (status == 2) return "Por vencer";
      else return "Vencido";
    },
    getColor(status) {
      if (status == 3) return "green";
      else if (status == 2) {
        return "orange";
      } else return "red";
    },
    async initialize() {
      await this.iniciarSociedad();

      await axios.get("archivo/allFiles").then((result) => {
        result.data.forEach((element) => {
          this.iniciarFile(element);
        });
        this.archivos = result.data;
        this.isLoading = false;
        let total = 0;
        var porcentaje = 0;
        var intPorcentaje = 0;
        this.kpi.forEach((element) => {
          element.porcentaje = 0;
          if (element.id == 0) {
            element.total = this.archivos.length;
            total = this.archivos.length;
            element.porcentaje = 100;
          } else if (element.id == 3) {
            element.total = this.contadorArchivos(this.archivos, 3);
            porcentaje = (element.total / total) * 100;
            intPorcentaje = Math.round(porcentaje);
            element.porcentaje = intPorcentaje;
          } else if (element.id == 2) {
            element.total = this.contadorArchivos(this.archivos, 2);
            porcentaje = (element.total / total) * 100;
            intPorcentaje = Math.round(porcentaje);
            element.porcentaje = intPorcentaje;
          } else {
            element.total = this.contadorArchivos(this.archivos, 1);
            porcentaje = (element.total / total) * 100;
            intPorcentaje = Math.round(porcentaje);
            element.porcentaje = intPorcentaje;
          }
        });
      });
    },
    iniciarFile(element) {
      element.nombreSociedad = this.obtenerNombreSociedad(
        element.padreSuperior
      );
      element.nombreCarpeta = this.obtenerNombreCarpeta(element.abuelo);
      element.nombreSubCarpeta = this.obtenerNombreSubCarpeta(element.padre);
      let fechaCrea = element.fechaCreacion.split("T");
      let fechaEmi = element.fechaEmision.split("T");
      let fechaCadu = element.fechaCaducidad.split("T");
      let fechaAviso = element.fechaCambioEstado.split("T");
      element.fechaCreacion = fechaCrea[0];
      element.fechaEmision = fechaEmi[0];
      element.fechaCaducidad = fechaCadu[0];
      element.fechaCambioEstado = fechaAviso[0];

      var today = new Date();
      var now = today.toISOString();
      var fechaActual = now.split("T");
      var fechaEmis = moment(element.fechaEmision);
      var fechaCaducidad1 = moment(element.fechaCaducidad);
      var fechaCaducidad = moment(element.fechaCaducidad);

      var diasVigencia = fechaCaducidad1.diff(fechaEmis, "days");
      var diasRestantes = fechaCaducidad.diff(fechaActual[0], "days");

      element.diasVigencia = diasVigencia;
      element.diasRestantes = diasRestantes;
      // console.log(element.nombre);
      // console.log("Fecha emision: " + element.fechaEmision);
      // console.log("Fecha vencimiento: " + element.fechaCaducidad);
      // console.log("Dias alerta: " + element.diasAviso);
      // console.log("Fecha que cambia de estado: " + moment(element.fechaEmision).add(element.diasAviso,"days").format("DD/MM/YYYY"))
      // console.log("Dias de vigencia: " + element.diasVigencia);
      // console.log("Dias restantes: " + element.diasRestantes);

      let dateArray = element.fechaEmision.split("-");
      var diaCambio2 = new Date(dateArray[0], dateArray[1] - 1, dateArray[2]);
      diaCambio2.setDate(diaCambio2.getDate() + element.diasAviso);
      diaCambio2.setHours(0, 0, 0, 0);

      let date2Array = element.fechaCaducidad.split("-");
      var fechaCaducidadAux = new Date(
        date2Array[0],
        date2Array[1] - 1,
        date2Array[2]
      );
      fechaCaducidadAux.setHours(0, 0, 0, 0);

      // console.log("--------------------");
      var hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      if (diasRestantes < 1) {
        element.diasRestantes = 0;
      }
      //Si el día de cambio de estado es igual al día de hoy pasa a estado por vencer
      if (diaCambio2.getTime() <= hoy.getTime() && diasRestantes >= 1) {
        element.status = 2;
        element.estado = "Por Vencer";
      }
      //Si el día de cambio de estado es despues del día de hoy esta vigente
      else if (diaCambio2.getTime() > hoy.getTime()) {
        element.status = 3;
        element.estado = "Vigente";
      }
      //Quiere decir que el día de cambio no es ni igual a hoy, ni mayor que hoy por lo que puede estar vencido
      else if (diaCambio2.getTime() <= fechaCaducidadAux.getTime()) {
        element.status = 1;
        element.estado = "Vencido";
      }
    },

    eliminarDiacriticos(texto) {
      return texto.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    },
    formatBytes(bytes, decimals = 2) {
      if (!+bytes) return "0 Bytes";

      const k = 1024;
      const dm = decimals < 0 ? 0 : decimals;
      const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

      const i = Math.floor(Math.log(bytes) / Math.log(k));

      return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
    },
  },
};
</script>

<style>
.contenedor {
  margin-top: 1%;
}
.v-progress-circular {
  margin: 1rem;
}
.caja {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
