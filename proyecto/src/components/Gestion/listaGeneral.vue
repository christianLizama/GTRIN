<template>
  <div>
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text"> Dashboard </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <loading v-if="isLoading" texto="Obteniendo información"></loading>
    <v-card elevation="5" outlined class="mx-auto mt-2" max-width="98.6%">
      <v-card-title>KPI</v-card-title>
      <Kpi v-if="!isLoading" :items="kpi"></Kpi>
    </v-card>

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
            <v-col cols="11" sm="5" :md="mdSize">
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
            <v-col cols="11" sm="5" :md="mdSize">
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

            <v-col cols="11" sm="5" :md="mdSize">
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

            <v-col cols="11" sm="5" :md="mdSize">
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

            <v-col>
              <v-menu
                right
                rounded="xl"
                :offset-x="true"
                :offset-y="true"
                v-model="menu"
                :close-on-content-click="false"
                min-width="300px"
              >
                <template v-slot:activator="{ on, attrs }">
                  <v-btn color="indigo" dark v-bind="attrs" v-on="on">
                    Escoger fechas
                  </v-btn>
                </template>

                <v-card>
                  <v-container>
                    <v-row>
                      <v-col>
                        <v-date-picker
                          selectedItemsText="{0} seleccionados"
                          locale="cl"
                          v-model="dates"
                          range
                        ></v-date-picker>
                      </v-col>
                    </v-row>
                  </v-container>
                </v-card>
              </v-menu>
            </v-col>
            <v-col cols="11" sm="5" :md="mdSize">
              <v-text-field
                v-model="dateRangeText"
                label="Rango fechas"
                prepend-icon="mdi-calendar"
                readonly
              
              ></v-text-field>
            </v-col>
            <v-col cols="11" sm="5" :md="mdSize">
              <v-select
                item-text="Año"
                return-object
                label="Ordernar por"
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
          :single-expand="singleExpand"
          :expanded.sync="expanded"
          item-key="_id"
          show-expand
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
              {{ item.status }}
            </v-chip>
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
            <div class="text-truncate" style="max-width: 140px">
              <Icon
                width="25"
                height="25"
                :icon="obtenerExtension(item.archivo)"
                class="mr-2"
              ></Icon>
              <a class="texto" :href="link + 'uploadFile/files/' + item.archivo"
                >{{ item.archivo }}
              </a>
            </div>
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
                :class="{ closed: searchClosed && !busqueda }"
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
    fechaHoy: new Date().toLocaleString(),
    searchClosed: true,
    showScheduleForm: false,
    mdSize: 3,
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
        text: "Días vencimiento",
        align: "center",
        sortable: true,
        value: "diasRestantes",
      },
      { text: "Tamaño", value: "peso" },
      { text: "Fecha Emisión", value: "fechaEmision" },
      {
        text: "Fecha por vencer",
        sortable: true,
        value: "fechaCambioEstado",
      },
      { text: "Fecha Caducidad", value: "fechaCaducidad" },
      { text: "Archivo", sortable: false, value: "archivo" },
      { text: "Gestionar", value: "ir", align: "center", sortable: false },
      { text: "Parametro", value: "data-table-expand", align: "center" },
    ],
    archivos: [],
  }),
  computed: {
    dateRangeText() {
      return this.dates.join(" ~ ");
    },
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
    //this.iniciarSociedad();
    //this.componentDidMount();
    this.obtenerTodo();
    // this.iniciarCarpetas();
    // this.iniciarSubCarpetas();
  },
  methods: {
    obtenerExtension(archivo) {
      let cortes = archivo.split(".");
      let icono = "";
      this.extensiones.forEach((extension) => {
        if (extension.type == cortes[1]) {
          icono = extension.icon;
        }
      });
      return icono;
    },
    obtenerColorExtension(archivo) {
      let cortes = archivo.split(".");
      console.log(cortes[1]);
      let color = "";
      this.extensiones.forEach((extension) => {
        if (extension.type == cortes[1]) {
          color = extension.color;
        }
      });
      return color;
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
      // let fechaCortada = fecha.split("T")
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
    async componentDidMount() {
      try {
        const [padres, carpetas, subCarpetas] = await Promise.all([
          axios.get("/sociedad/getPadres"),
          axios.get("/carpeta/getAllFolders"),
          axios.get("/subCarpeta/getAllSubFolders"),
        ]);
        this.sociedades = padres.data;
        this.sociedades.unshift({ nombre: "Todo", _id: "" });
        this.carpetas = carpetas.data;
        this.todoCarpetas = carpetas.data;
        carpetas.data.forEach((folder) => {
          folder.parametros.forEach((param) => {
            this.parametros.push(param);
          });
        });
        this.subCarpetas = subCarpetas.data;
        this.todoSubCarpetas = subCarpetas.data;
        await axios.get("archivo/allFiles").then((result) => {
          result.data.forEach((element) => {
            this.iniciarFile(
              element,
              padres.data,
              carpetas.data,
              subCarpetas.data
            );
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
      } catch (err) {
        console.log(err);
      }
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
    iniciarFile(element, padres, carpetas, subCarpetas) {
      element.nombreSociedad = this.obtenerNombreSociedad(
        element.padreSuperior,
        padres
      );
      element.nombreCarpeta = this.obtenerNombreCarpeta(
        element.abuelo,
        carpetas
      );
      element.nombreSubCarpeta = this.obtenerNombreSubCarpeta(
        element.padre,
        subCarpetas
      );

      element.nombreParametro = this.obtenerNombreParametro(
        element.parametro,
        this.parametros
      );

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
      var cortado = now.split("T");
      var fechaEmis = moment(element.fechaEmision);
      var fechaCaducidad1 = moment(element.fechaCaducidad);
      var fechaCaducidad = moment(element.fechaCaducidad);

      var diasVigencia = fechaCaducidad1.diff(fechaEmis, "days");
      var diasRestantes = fechaCaducidad.diff(cortado[0], "days");

      element.diasVigencia = diasVigencia;
      element.diasRestantes = diasRestantes;
      // console.log(element.nombre);
      // console.log(element.archivo)
      // console.log("Fecha emision: " + element.fechaEmision);
      // console.log("Fecha vencimiento: " + element.fechaCaducidad);
      // console.log("Dias alerta: " + element.diasAviso);
      // console.log("Fecha que cambia de estado: " + moment(element.fechaEmision).add(element.diasAviso,"days").format("DD/MM/YYYY"))
      // console.log("Dias de vigencia: " + element.diasVigencia);
      // console.log("Dias restantes: " + element.diasRestantes);
      // console.log("-----------------------------------------------")
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
