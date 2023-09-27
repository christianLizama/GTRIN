<template>
  <div>
    <!-- Barra superior -->
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text"> Controlar Parametros </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <!-- KPIS -->
    <v-card elevation="5" outlined class="mx-auto mt-2" max-width="98.6%">
      <div class="selector-container">
        <v-select
          v-model="parametroSeleccionado"
          :items="parametros"
          label="Selecciona un parámetro"
          @change="actualizarKPI"
          hide-details
          dense
          outlined
        ></v-select>
      </div>
      <kpi></kpi>
    </v-card>
    <!-- Tabla de todos los parametros -->
    <v-card max-width="98.6%" elevation="5" outlined class="mx-auto mb-8 mt-3">
      <tabla-parametros></tabla-parametros>
    </v-card>
  </div>
</template>

<script>
import tablaParametros from "@/components/Gestion/tablaParametros.vue";
import Kpi from "@/components/Kpi.vue";
export default {
  components: { tablaParametros, Kpi },
  name: "Parametros",
  created() {
    this.parametroSeleccionado = this.parametros[0];
  },
  data() {
    return {
      parametroSeleccionado: "",
      parametros: ["Parametro 1", "Parametro 2", "Parametro 3", "Parametro 4"],
    };
  },
  props: {},
  methods: {},
};
</script>

<style scoped>
.selector-container {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px; /* Ajusta el espaciado según tus preferencias */
  flex-wrap: wrap; /* Permite que los elementos se envuelvan si no caben en una sola línea */
  width: 355px;
}
</style>
