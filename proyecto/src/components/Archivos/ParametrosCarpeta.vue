<template>
  <div>
    <v-toolbar dense dark>
      <v-btn @click="atras" big icon>
        <v-icon>mdi-chevron-left</v-icon>
      </v-btn>
      <v-toolbar-title class="white--text">
        {{ folder.nombre }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-on="on" v-bind="attrs" icon @click="hidden = !hidden">
            <v-icon>{{ hidden ? "mdi-magnify" : "mdi-close" }}</v-icon>
          </v-btn>
        </template>
        <span>Buscar</span>
      </v-tooltip>
    </v-toolbar>
    <div class="container">
      <v-expand-transition>
        <v-text-field
          v-show="!hidden"
          v-model="busqueda"
          clearable
          hide-details
          filled
          dense
          rounded
          full-width
          color="black darken"
          placeholder="Buscar Parametro"
          prepend-inner-icon="mdi-folder-search-outline"
        ></v-text-field>
      </v-expand-transition>
    </div>
    <kpi-parametros
      :parametros="parametros"
      :archivos-requeridos="archivosRequeridos"
      :archivosSubidos="archivosSubidos"
    ></kpi-parametros>

    <v-card elevation="5" outlined class="mx-auto mb-8" max-width="98.6%">
      <v-data-table
        :headers="headers"
        :items="resultadoBusqueda"
        sort-by="option"
        :sort-desc="true"
        class="elevation-1"
      >
        <template v-slot:[`item.cantidad`]="{ item }">
          <v-icon xl :color="obtenerCumplimiento(item).color">{{
            obtenerCumplimiento(item).icon
          }}</v-icon>
        </template>

        <template v-slot:[`item.option`]="{ item }">
          <div v-if="item.option">Si</div>
          <div v-else>No</div>
        </template>
        <template v-slot:top>
          <v-toolbar flat>
            <v-toolbar-title>Mis Parametros</v-toolbar-title>
            <v-divider class="mx-4" inset vertical></v-divider>
            <v-spacer></v-spacer>
            <vue-json-to-csv
              :json-data="archivos"
              :labels="{
                nombre: {title: 'Nombre'},
                archivo: { title: 'Archivo' },
                status: { title: 'Status del documento' },
                fechaEmision: { title: 'Fecha emisión' },
                fechaCambioEstado: { title: 'Fecha de alerta' },
                fechaCaducidad: { title: 'Fecha Caducidad ' },
                descripcion: {title:'Descripción'}
              }"
              :csv-title="'resumen-'+folder.nombre"
              :separator="';'"
            >
              <v-btn icon>
                <v-icon color="green">mdi-microsoft-excel</v-icon></v-btn
              >
            </vue-json-to-csv>
            <v-tooltip bottom>
              <template v-slot:activator="{ on, attrs }">
                <v-btn icon v-bind="attrs" v-on="on" @click="reloadPage">
                  <v-icon>mdi-reload</v-icon>
                </v-btn>
              </template>
              <span>Refrescar</span>
            </v-tooltip>
            

            <v-dialog v-model="dialog" max-width="80%" persistent>
              <v-card>
                <v-toolbar dark color="black lighten-3" dense flat>
                  <v-btn icon dark @click="dialog = !dialog">
                    <v-icon>mdi-close</v-icon>
                  </v-btn>
                  <v-toolbar-title
                    class="text-body-3 font-weight-bold white--text"
                  >
                    {{ parametroNombre }}
                  </v-toolbar-title>
                </v-toolbar>

                <tabla-archivos
                  :key="parametroID"
                  :Parametro="parametroID"
                  :nombre-parametro="parametroNombre"
                ></tabla-archivos>
              </v-card>
            </v-dialog>
          </v-toolbar>
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-icon class="mr-2" @click="editItem(item)"> mdi-file-plus </v-icon>
        </template>

        <template v-slot:no-data>
          <v-btn color="primary" @click="initialize"> Reset </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
import axios from "axios";
import tablaArchivos from "../Gestion/tablaArchivos.vue";
import VueJsonToCsv from "vue-json-to-csv";
import KpiParametros from "../KpiParametros.vue";
export default {
  components: { VueJsonToCsv, tablaArchivos, KpiParametros },
  data: () => ({
    hidden: true,
    searchClosed: true,
    dialog: false,
    busqueda: "",
    parametroID: "",
    parametroNombre: "",
    folder: {},
    archivosRequeridos: 0,
    archivosSubidos: 0,
    padre: {},
    archivos: [],
    headers: [
      {
        text: "Archivo subido?",
        value: "cantidad",
        sortable: false,
        align: "center",
      },
      {
        text: "Nombre",
        align: "start",
        sortable: false,
        value: "value",
      },
      {
        text: "Requerido",
        align: "center",
        sortable: false,
        value: "option",
      },
      { text: "Acciones", align: "center", value: "actions", sortable: false },
    ],
    parametros: [],
  }),
  computed: {
    resultadoBusqueda() {
      if (this.busqueda) {
        return this.parametros.filter((item) => {
          return this.busqueda
            .toLowerCase()
            .split(" ")
            .every((v) => item.value.toLowerCase().includes(v));
        });
      } else {
        return this.parametros;
      }
    },
  },
  watch: {
    dialog(val) {
      val || this.close();
    },
  },
  created() {
    this.initialize();
  },
  methods: {
    reloadPage() {
      window.location.reload();
    },
    obtenerCumplimiento(parametro) {
      if (parametro.option) {
        if (parametro.cantidad > 0) {
          return { color: "green", icon: "mdi-note-check" };
        } else {
          return { color: "red", icon: "mdi-note-remove" };
        }
      } else {
        return "No aplica";
      }
    },
    contar(parametros) {
      parametros.forEach(async (parametro) => {
        const request = {
          params: {
            _id: parametro._id,
            padre: this.$route.params.subFolder,
          },
        };
        await axios.get("archivo/countFiles", request).then((result) => {
          parametro.cantidad = result.data;
          if (parametro.option) {
            if (parametro.cantidad > 0) {
              this.archivosSubidos = this.archivosSubidos + 1;
            }
            this.archivosRequeridos = this.archivosRequeridos + 1;
          }
        });
      });
    },
    async obtenerPadreSuperior(id) {
      await axios.get("carpeta/query?_id=" + id).then((result) => {
        this.padre = result.data;
        this.parametros = result.data.parametros;
        this.contar(result.data.parametros, result.data._id);
      });
    },
    async initialize() {
      await axios
        .get("subCarpeta/query?_id=" + this.$route.params.subFolder)
        .then((result) => {
          this.folder = result.data;
          let idPadre = result.data.padre;
          this.obtenerPadreSuperior(idPadre);
          this.obtenerArchivos(result.data._id);
        });
    },
    async obtenerArchivos(padreId) {
      console.log(padreId);
      const request = {
        params: {
          _id: padreId,
        },
      };

      await axios.get("archivo/getArchivos", request).then((result) => {
        this.archivos = result.data;
      });
    },
    editItem(item) {
      this.dialog = true;
      this.parametroID = item._id;
      this.parametroNombre = item.value;
    },
    close() {
      this.dialog = false;
    },
    save() {
      this.close();
    },
    atras() {
      this.$router.go(-1);
    },
  },
};
</script>

<style>
.container {
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 100%;
}
</style>

<style lang="sass">
.v-input.expanding-search
  transition: max-width 0.3s
  .v-input__slot
    cursor: pointer !important
    &:before, &:after
      border-color: transparent !important
  &.closed
    max-width: 50px
    .v-input__slot
      background: transparent !important
</style>
