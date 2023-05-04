<template>
  <div>
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text"> Dashboard </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <loading v-if="isLoading" texto="Obteniendo información"></loading>
    <v-card elevation="5" outlined class="mx-auto mt-2" max-width="98.6%">
      <Kpi v-if="!isLoading" :items="kpi"></Kpi>
    </v-card>

    <div class="contenedor" v-if="!isLoading">
      <v-card elevation="5" outlined class="mx-auto" max-width="98.6%">
        <v-card-title>
          Filtros <v-spacer></v-spacer>
          <v-btn text color="blue accent-4" @click="limpiarFiltros()">
            Limpiar Filtros
          </v-btn>
        </v-card-title>
        <v-container fluid>
          <v-row>
            <v-col cols="12" :md="mdSize">
              <v-select
                :items="sociedades"
                return-object
                v-model="sociedadSeleccionada"
                item-text="nombre"
                label="Contenedores"
                dense
                outlined
              ></v-select>
            </v-col>
            <v-col cols="12" :md="mdSize">
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

            <v-col cols="12" :md="mdSize">
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

            <v-col cols="12" :md="mdSize">
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
            <v-col cols="12" :md="4">
              <v-menu
                max-width="400px"
                bottom
                rounded="xl"
                :offset-x="true"
                :offset-y="true"
                v-model="menu"
                :close-on-content-click="false"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-text-field
                    v-model="dateRangeText"
                    label="Filtrar por fecha"
                    append-icon="mdi-calendar"
                    outlined
                    readonly
                    dense
                    v-bind="attrs"
                    v-on="on"
                    style="font-size: 0.78em"
                  >
                    Escoger fechas
                  </v-text-field>
                </template>
                <v-date-picker
                  full-width
                  :selectedItemsText="comprobador()"
                  locale="cl"
                  v-model="dates"
                  range
                  :min="fechaMinimaCaducidad"
                >
                  <v-spacer></v-spacer>
                  <v-btn
                    color="grey"
                    text
                    class="body-2 font-weight-bold"
                    @click="limpiarCalendario()"
                  >
                    Limpiar
                  </v-btn>
                  <v-btn
                    color="primary"
                    @click="menu = false"
                  >
                    Listo
                  </v-btn>
                </v-date-picker>
              </v-menu>
            </v-col>
          </v-row>
        </v-container>
      </v-card>
    </div>

    <div class="contenedor" v-if="!isLoading">
      <v-card elevation="5" outlined class="mx-auto mb-8" max-width="98.6%">
        <v-data-table
          :single-expand="singleExpand"
          :expanded.sync="expanded"
          item-key="_id"
          show-expand
          :headers="headers"
          :items="filtros"
          sort-by="statusId"
          class="elevation-1"
          :search="search"
          :items-per-page="-1"
        >
          <template v-slot:[`item.number`]="{index}">
            {{ index+1}}
          </template>
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
              {{ item.status }}
            </v-chip>
          </template>

          <template v-slot:[`item.diasVigencia`]="{ item }">
            <v-tooltip top color="blue">
              <template v-slot:activator="{ on, attrs }">
                <div
                  v-on="on"
                  v-bind="attrs"
                  class="text-truncate"
                  style="max-width: 140px"
                >
                {{item.diasVigencia}}     
                </div>
              </template>
              <span>{{ transformarDiasVigencia(item.fechaEmision,item.fechaCaducidad) }}</span>
            </v-tooltip>
          </template>

          <template v-slot:[`item.ir`]="{ item }">
            <v-btn large icon @click="enviarRuta(item)">
              <Icon
                width="28"
                height="28"
                icon="vscode-icons:file-type-light-todo"
              ></Icon>
            </v-btn>
          </template>

          <template v-slot:[`item.diasRestantes`]="{ item }">
            <span v-if="item.diasRestantes >= 0">{{ item.diasRestantes }}</span>
            <span class="red--text" v-if="item.diasRestantes < 0">{{
              item.diasRestantes
            }}</span>
          </template>
          <template v-slot:[`item.archivo`]="{ item }">
            <v-tooltip top color="blue">
              <template v-slot:activator="{ on, attrs }">
                <div
                  v-on="on"
                  v-bind="attrs"
                  class="text-truncate"
                  style="max-width: 140px"
                >
                  <Icon
                    width="25"
                    height="25"
                    :icon="obtenerExtension(item.archivo)"
                    class="mr-2"
                  ></Icon>
                  <a
                    target="_blank"
                    class="texto"
                    :href="item.archivo"
                    >{{ item.archivo.substring(item.archivo.lastIndexOf('/') + 1) }}
                  </a>
                </div>
              </template>
              <span>{{ item.archivo.substring(item.archivo.lastIndexOf('/') + 1) }}</span>
            </v-tooltip>
          </template>
          <template v-slot:[`expanded-item`]="{ headers, item }">
            <td :colspan="headers.length">
              Pertenece al parametro: <b>{{ item.nombreParametro }}</b>
            </td>
          </template>
          <template v-slot:top>
            <v-toolbar flat>
              <v-toolbar-title v-if="searchClosed">Archivos</v-toolbar-title>
              <v-divider
                v-if="searchClosed"
                class="mx-4"
                inset
                vertical
              ></v-divider>
              <v-spacer v-if="searchClosed"></v-spacer>
              <v-text-field
                @focus="searchClosed = false"
                @blur="searchClosed = true"
                v-model="search"
                clearable
                dense
                filled
                rounded
                placeholder="Buscar archivo"
                prepend-inner-icon="mdi-magnify"
                class="mr-3 pt-6 expanding-search"
                :class="{ closed: searchClosed && !search }"
              ></v-text-field>
              <template>
                <vue-json-to-csv
                  :json-data="filtros"
                  :labels="{
                    nombreSociedad: { title: 'Nombre Contenedor' },
                    nombreCarpeta: { title: 'Carpeta' },
                    nombreSubCarpeta: { title: 'SubCarpeta' },
                    nombreParametro: { title: 'Nombre parametro' },
                    nombre: { title: 'Nombre archivo' },
                    archivo: { title: 'Archivo' },
                    status: { title: 'Status del archivo' },
                    fechaEmision: { title: 'Fecha emisión archivo' },
                    fechaCambioEstado: {
                      title: 'Fecha alerta archivo (status: por vencer)',
                    },
                    fechaCaducidad: { title: 'Fecha Caducidad archivo' },
                    diasVigencia: { title: 'Días vigencia archivo' },
                    diasRestantes: { title: 'Días restantes vencimiento' },
                  }"
                  :csv-title="'resumenGeneralArchivos-' + fechaHoy"
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
            <v-btn color="primary" @click="obtenerTodo"> Reset </v-btn>
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
import location from "moment/dist/locale/es";
moment.updateLocale("cl", location);
import VueJsonToCsv from "vue-json-to-csv";
import Kpi from "../Kpi.vue";
import loading from "../loading.vue";
import Trigger from "../trigger.vue";
import { Icon } from "@iconify/vue2";

export default {
  components: { VueJsonToCsv, loading, Trigger, Kpi, Icon },
  data: () => ({
    dates: ["", ""],
    menu: false,
    extensiones: [
      { type: "png", icon: "vscode-icons:file-type-image" },
      { type: "pdf", icon: "vscode-icons:file-type-pdf2", color: "red" },
      { type: "xlsx", icon: "vscode-icons:file-type-excel" },
      { type: "jpg", icon: "vscode-icons:file-type-image" },
      { type: "csv", icon: "vscode-icons:file-type-excel" },
    ],
    numero:0,
    fechaHoy: new Date().toLocaleString(),
    searchClosed: true,
    showScheduleForm: false,
    mdSize: 2,
    xlSize: 2,
    link: process.env.VUE_APP_SERVER_URL,
    busqueda: "",
    search: "",
    isLoading: true,
    sociedades: [],
    expanded: [],
    singleExpand: true,
    parametros: [],
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
        text: "",
        align: "start",
        value: "number",
      },
      {
        text: "Contenedor",
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
        text: "Temporizador vencimiento",
        align: "center",
        sortable: true,
        value: "diasRestantes",
      },
      { text: "Fecha Emisión", value: "fechaEmision" },
      {
        text: "Fecha por vencer",
        sortable: true,
        value: "fechaCambioEstado",
      },
      { text: "Fecha Caducidad", value: "fechaCaducidad" },
      { text: "Archivo", sortable: false, value: "archivo" },
      { text: "Tamaño", value: "peso" },
      { text: "Gestionar", value: "ir", align: "center", sortable: false },
      { text: "Parametro", value: "data-table-expand", align: "center" },
    ],
    archivos: [],
  }),
  computed: {
    fechaMinimaCaducidad() {
      if (this.dates.length == 1) {
        return moment(this.dates[0]).add(1, "days").toISOString().substr(0, 10);
      }

      return "";
    },
    dateRangeText() {
      return this.valoresFecha();
    },
    filtros() {
      return this.filtroSociedad(
        this.filtroCarpetas(
          this.filtroSubCarpetas(
            this.filtroFechas(this.filtroStatus(this.archivos))
          )
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
    //this.componentDidMount();
    this.obtenerTodo();
  },
  methods: {
    transformarDiasVigencia(fechaEmision,fechaCaducidad){
      var date1 = moment(fechaEmision);
      var date2 = moment(fechaCaducidad);
      var years = date2.diff(date1,'years')
      date1.add(years,'years')
      var months = date2.diff(date1, 'months');
      date1.add(months, 'months');
      var days = date2.diff(date1, 'days');
      return years + ' ' + 'Años, '+  months + ' ' + 'Meses, '+ ' ' + days + " Días"
    },
    valoresFecha() {
      if (this.dates.length == 2) {
        if (this.dates[0].length < 1 && this.dates[1].length < 1) {
          return "No hay fecha seleccionada";
        }
        return (
          "Fecha emisión: " +
          moment(this.dates[0]).format("DD/MM/YYYY") +
          "   -   " +
          "Fecha caducidad: " +
          moment(this.dates[1]).format("DD/MM/YYYY")
        );
      }
      if (this.dates.length == 1) {
        return "Fecha emisión: " + moment(this.dates[0]).format("DD/MM/YYYY");
      }
    },
    //TODO: para los apartados del calendario
    comprobador() {
      if (this.dates[0].length < 1 && this.dates[1].length < 1) {
        return "Nada seleccionado";
      } else if (this.dates.length > 1) {
        let fecha1 = moment(this.dates[0]);
        let fecha2 = moment(this.dates[1]);
        let diferencia = fecha2.diff(fecha1, "days");
        diferencia = diferencia + 1;
        let retorno = "Días seleccionados: " + diferencia;
        return retorno;
      } else {
        return this.dates.join("-");
      }
    },
    obtenerExtension(archivo) {

      const myUrl = archivo; // la URL almacenada como una cadena de texto
      const currentExtension = myUrl.substring(myUrl.lastIndexOf('.') + 1); // obtener la extensión
      
      let icono = "";
      this.extensiones.forEach((extension) => {
        if (extension.type == currentExtension) {
          icono = extension.icon;
        }
      });
      return icono;
    },
    enviarRuta(item) {
      this.$router.push({
        name: "files",
        params: {
          sociedad: item.padreSuperior,
          Folder: item.abuelo,
          subFolder: item.padre,
        },
      });
    },
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
        this.estadoSeleccionado = this.estados[0];
        this.carpetas.forEach((element) => {
          this.carpetasDefault.push(element);
        });
        return this.carpetasDefault;
      }
      this.carpetaSelecionada = this.carpetasDefault[0];
      this.estadoSeleccionado = this.estados[0];
      let hijas = carpetas.filter((item) => {
        return item.padre === this.sociedadSeleccionada._id;
      });
      hijas.unshift({ nombre: "Todo", _id: "" });
      return hijas;
    },
    subCarpetasHijas(subCarpetas) {
      if (this.subCarpetaSelecionada.nombre != "Todo") {
        this.estadoSeleccionado = this.estados[0];
      } else {
        this.estadoSeleccionado = this.estados[0];
      }
      if (
        this.carpetaSelecionada.nombre == "Todo" &&
        this.sociedadSeleccionada.nombre == "Todo"
      ) {
        this.subCarpetas.forEach((element) => {
          this.subCarpetasDefault.push(element);
        });
        return this.subCarpetasDefault;
      }
      //Si seleciono una sociedad
      else if (
        this.sociedadSeleccionada.nombre != "Todo" &&
        this.carpetaSelecionada.nombre == "Todo"
      ) {
        this.estadoSeleccionado = this.estados[0];

        this.subCarpetaSelecionada = this.subCarpetasDefault[0];
        let listaFiltrada = subCarpetas.filter(
          (carpeta) =>
            !carpeta.padreSuperior.indexOf(this.sociedadSeleccionada._id)
        );
        listaFiltrada.unshift({ nombre: "Todo", _id: "" });
        return listaFiltrada;
      }
      //Si solo selecciono una carpeta
      else if (
        this.sociedadSeleccionada.nombre == "Todo" &&
        this.carpetaSelecionada.nombre != "Todo"
      ) {
        this.estadoSeleccionado = this.estados[0];

        let carpetasFiltradas = this.carpetas.filter(
          (carpeta) => carpeta.nombre == this.carpetaSelecionada.nombre
        );
        let nuevasSubCarpetas = [];
        nuevasSubCarpetas = subCarpetas.filter((subCarpeta) => {
          return carpetasFiltradas.some((carpeta) => {
            return carpeta._id === subCarpeta.padre;
          });
        });
        nuevasSubCarpetas.unshift({ nombre: "Todo", _id: "" });
        this.subCarpetaSelecionada = this.subCarpetasDefault[0];
        return nuevasSubCarpetas;
      }
      let hijas = subCarpetas.filter((item) => {
        return item.padre === this.carpetaSelecionada._id;
      });
      hijas.unshift({ nombre: "Todo", _id: "" });
      this.subCarpetaSelecionada = this.subCarpetasDefault[0];
      this.estadoSeleccionado = this.estados[0];

      return hijas;
    },
    //TODO: filtros
    filtroSociedad(archivos) {
      return archivos.filter(
        (archivo) =>
          !archivo.padreSuperior.indexOf(this.sociedadSeleccionada._id)
      );
    },
    
    filtroCarpetas(archivos) {
      if (
        this.sociedadSeleccionada.nombre != "Todo" &&
        this.carpetaSelecionada.nombre != "Todo"
      ) {
        return archivos.filter(
          (archivo) => !archivo.abuelo.indexOf(this.carpetaSelecionada._id)
        );
      } else if (
        this.sociedadSeleccionada.nombre == "Todo" &&
        this.carpetaSelecionada.nombre != "Todo"
      ) {
        return archivos.filter(
          (archivo) =>
            !archivo.nombreCarpeta.indexOf(this.carpetaSelecionada.nombre)
        );
      }
      return archivos;
    },
    filtroSubCarpetas(archivos) {
      if (this.subCarpetaSelecionada.nombre != "Todo") {
        return archivos.filter(
          (archivo) => !archivo.padre.indexOf(this.subCarpetaSelecionada._id)
        );
      }
      return archivos;
    },
    filtroStatus(archivos) {
      if (this.estadoSeleccionado.codigo == 0) {
        return archivos;
      }
      let archivosFiltrados = archivos.filter(
        (archivo) => archivo.status === this.estadoSeleccionado.nombre
      );
      return archivosFiltrados;
    },
    filtroFechas(archivos) {
      //Si solo hay una
      if (this.dates.length == 1) {
        let archivosFiltrados = archivos.filter((archivo) =>
          moment(archivo.fechaEmision).isSame(moment(this.dates[0]))
        );
        return archivosFiltrados;
      }

      //Si hay dos fechas
      if (this.dates.length > 1) {
        if (this.dates[0].length > 1 && this.dates[1].length > 1) {
          let archivosFiltrados = archivos.filter(
            (archivo) =>
              moment(archivo.fechaEmision).isSameOrAfter(
                moment(this.dates[0])
              ) &&
              moment(archivo.fechaCaducidad).isSameOrBefore(
                moment(this.dates[1])
              )
          );
          return archivosFiltrados;
        }
      }
      return archivos;
    },
    limpiarCalendario(){
      this.dates = ["", ""];
    },
    limpiarFiltros() {
      this.sociedadSeleccionada = Object.assign({}, this.defaultFilter);
      this.carpetaSelecionada = Object.assign({}, this.defaultFilter);
      this.subCarpetaSelecionada = Object.assign({}, this.defaultFilter);
      this.estadoSeleccionado = Object.assign({}, this.defaultStatusFilter);
      this.dates = ["", ""];
    },
    obtenerNombreSociedad(itemId, sociedades) {
      let found = sociedades.find((e) => e._id === itemId);
      let nombreSociedad = found.nombre;
      return nombreSociedad;
    },
    obtenerNombreCarpeta(itemId, carpetas) {
      var found = carpetas.find((e) => e._id === itemId);
      let nombreCarpeta = found.nombre;
      return nombreCarpeta;
    },
    obtenerNombreSubCarpeta(itemId, subCarpetas) {
      var found = subCarpetas.find((e) => e._id === itemId);
      let nombreSubCarpeta = found.nombre;
      return nombreSubCarpeta;
    },
    obtenerNombreParametro(parametroID, parametros) {
      var found = parametros.find((e) => e._id === parametroID);
      let nombreParametro = found.value;
      return nombreParametro;
    },
    iniciarKpi(archivos) {
      let total = 0;
      var porcentaje = 0;
      var intPorcentaje = 0;
      this.kpi.forEach((element) => {
        element.porcentaje = 0;
        if (element.id == 0) {
          element.total = archivos.length;
          total = archivos.length;
          element.porcentaje = 100;
        } else if (element.id == 3) {
          element.total = this.contadorArchivos(archivos, "Vigente");
          porcentaje = (element.total / total) * 100;
          intPorcentaje = Math.round(porcentaje);
          element.porcentaje = intPorcentaje;
        } else if (element.id == 2) {
          element.total = this.contadorArchivos(archivos, "Por vencer");
          porcentaje = (element.total / total) * 100;
          intPorcentaje = Math.round(porcentaje);
          element.porcentaje = intPorcentaje;
        } else {
          element.total = this.contadorArchivos(archivos, "Vencido");
          porcentaje = (element.total / total) * 100;
          intPorcentaje = Math.round(porcentaje);
          element.porcentaje = intPorcentaje;
        }
      });
    },
    async obtenerTodo() {
      await axios.get("archivo/archivosStatus").then((result) => {
        let { archivos, sociedades, carpetas, subCarpetas, parametros } =
          result.data;
        this.archivos = archivos;
        this.sociedades = sociedades;
        this.sociedades.unshift({ nombre: "Todo", _id: "" });
        this.carpetas = carpetas;
        this.todoCarpetas = carpetas;
        this.parametros = parametros;
        this.subCarpetas = subCarpetas;
        this.todoSubCarpetas = subCarpetas;

        this.isLoading = false;
        this.iniciarKpi(archivos);
      });
    },
    obtenerDiferencia(fechaEmision, fechaVencimiento) {
      var fecha1 = moment(fechaEmision);
      var fecha2 = moment(fechaVencimiento);
      return fecha2.diff(fecha1, "days");
    },
    getColor(status) {
      switch (status) {
        case "Vigente":
          return "green";
        case "Por vencer":
          return "orange";
        case "Vencido":
          return "red";
        default:
          break;
      }
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

<style lang="sass">
.v-input.expanding-search
  transition: max-width 0.3s
  .v-input__slot
    cursor: pointer !important
    &before, &:after
      border-color: transparent !important
  &.closed
    max-width: 50px
    .v-input__slot
      background-color: transparent !important
</style>
