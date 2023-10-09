<template>
  <v-card elevation="5" outlined class="mx-auto mb-8 mt-3" max-width="98.6%">
    <v-card-title>
      Archivos eliminados
      <v-divider class="mx-4" inset vertical></v-divider>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Buscar archivo eliminado"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="eliminados"
      :search="search"
      :items-per-page="30"
      :footer-props="{
        'items-per-page-options': [15, 20, 25, 30, 35, 40],
      }"
    >
    </v-data-table>
  </v-card>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      search: "",
      headers: [
        {
          text: "Contenedor",
          align: "start",
          filterable: false,
          value: "padreSuperior",
        },
        { text: "Carpeta", value: "abuelo" },
        { text: "SubCarpeta", value: "padre" },
        { text: "Nombre Archivo", value: "nombre" },
        { text: "Fecha Creación", value: "fechaCreacion" },
        { text: "Fecha eliminación", value: "fechaEliminacion" },
        { text: "Tamaño", value: "peso" },
        { text: "Subido por", value: "usuarioCreador" },
        { text: "Eliminado por", value: "usuarioEliminador" },
      ],
      eliminados: [],
    };
  },
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      await axios.get("eliminado/allDeletedFiles").then((result) => {
        this.eliminados = result.data;
        console.log(this.eliminados);
      });
    },
  },
};
</script>
