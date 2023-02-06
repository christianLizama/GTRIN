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
        v-model="busqueda"
        label="Buscador"
        hide-details
        single-line
        filled
        prepend-inner-icon="mdi-magnify"
        class="shrink"
      ></v-text-field>
    </v-toolbar>
    <v-data-table
      :headers="headers"
      :items="resultadoBusqueda"
      sort-by="calories"
      class="elevation-1"
    >
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
  </div>
</template>

<script>
import axios from "axios";
import tablaArchivos from "../Gestion/tablaArchivos.vue";
export default {
  components: { tablaArchivos },
  data: () => ({
    dialog: false,
    busqueda: "",
    parametroID: "",
    parametroNombre: "",
    folder: {},
    padre: {},
    headers: [
      { text: "Cumplimiento", value: "cumplimiento", sortable: false },
      {
        text: "Nombre",
        align: "start",
        sortable: false,
        value: "value",
      },
      { text: "Actions", align: "center", value: "actions", sortable: false },
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
    async obtenerPadreSuperior(id) {
      await axios
        .get("carpeta/query?_id=" + id)
        .then((result) => {
          this.padre = result.data;
          this.parametros = result.data.parametros
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
