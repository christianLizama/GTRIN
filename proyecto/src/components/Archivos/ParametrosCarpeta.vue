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

      <v-text-field
        @focus="searchClosed = false"
        @blur="searchClosed = true"
        v-model="busqueda"
        clearable
        dense
        filled
        rounded
        placeholder="Buscar categoria"
        prepend-inner-icon="mdi-magnify"
        class="pt-6 expanding-search"
        :class="{ closed: searchClosed && !busqueda }"
      ></v-text-field>
    </v-toolbar>
    <kpi-parametros
      :parametros="parametros"
      :archivos-requeridos="archivosRequeridos"
      :archivosSubidos="archivosSubidos"
    ></kpi-parametros>

    <v-card elevation="5" outlined class="mx-auto mb-8" max-width="98.6%">
      <v-data-table
        :headers="headers"
        :items="resultadoBusqueda"
        sort-by="calories"
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
            <v-dialog v-model="dialog" max-width="80%">
              <v-card>
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
import KpiParametros from "../KpiParametros.vue";
export default {
  components: { tablaArchivos, KpiParametros },
  data: () => ({
    searchClosed: true,
    dialog: false,
    busqueda: "",
    parametroID: "",
    parametroNombre: "",
    folder: {},
    archivosRequeridos: 0,
    archivosSubidos: 0,
    padre: {},
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
          const nuevo = {
            _id: parametro._id,
            value: parametro.value,
            cantidad: result.data,
          };
          let index = parametros.indexOf(parametro);
          Object.assign(parametros[index], nuevo);
          this.parametros.push(parametro);
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
