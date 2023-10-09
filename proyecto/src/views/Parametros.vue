<template>
  <div>
    <!-- Barra superior -->
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text">
        Controlar Parametros
      </v-toolbar-title>
      <v-spacer></v-spacer>
    </v-toolbar>
    <!-- KPIS -->
    <v-card elevation="5" outlined class="mx-auto mt-2" max-width="98.6%">
      <div class="selector-container">
        <v-select
          v-model="parametroSeleccionado"
          :items="parametros"
          label="Selecciona un parámetro"
          hide-details
          dense
          outlined
          item-text="value"
          item-value="_id"
          @input.native="cargarParametros"
          ref="vSelect"
          return-object
        >
          <template v-slot:append-item>
            <div v-intersect="endIntersect" />
          </template>
        </v-select>
      </div>
      <kpi
        v-if="parametros.length > 0"
        :apiEndpoints="apiEndpointsParametro"
        :parametroSeleccionado="parametroSeleccionado._id"
      ></kpi>
    </v-card>
    <!-- Tabla de todos los parametros -->
    <tabla-parametros></tabla-parametros>
  </div>
</template>

<script>
import Kpi from "@/components/Kpi.vue";
import TablaParametros from "@/components/Gestion/tablaParametros.vue";
import axios from "axios";

export default {
  components: { Kpi,TablaParametros },
  name: "Parametros",
  created() {
    this.cargarParametros();
  },
  data() {
    return {
      parametroSeleccionado: "",
      parametros: [],
      currentPage: 1,
      itemsPerPage: 15,
      search: "",
      totalItems: 0,
      loading: false,
      totalPages: 0,
      reachedEnd: false,
      apiEndpointsParametro: {
        countAllFiles: "parametro/countAllFiles",
        countVigentes: "parametro/countVigentes",
        countPorVencer: "parametro/countPorVencer",
        countVencidos: "parametro/countVencidos",
      },
    };
  },
  props: {},
  methods: {
    endIntersect(entries, observer, isIntersecting) {
      if (isIntersecting) {
        this.cargarMasParametros();
      }
    },
    async cargarMasParametros() {
      if (
        !this.loading &&
        this.currentPage <= this.totalPages &&
        !this.reachedEnd
      ) {
        console.log("Evento de scroll activado");
        this.currentPage++;
        await this.cargarParametros();
      }
    },
    async cargarParametros() {
      this.loading = true;
      try {
        const response = await this.getServerData(
          0,
          0,
          this.currentPage,
          this.itemsPerPage
        );

        // Agrega los nuevos elementos a la lista existente
        this.parametros = this.parametros.concat(response.parametros);
        this.totalItems = response.cantidad;
        this.totalPages = response.pages;

        // Verificar si se ha alcanzado el final
        if (this.currentPage >= this.totalPages) {
          this.reachedEnd = true;
        }

        if (this.currentPage == 1 && this.parametros.length > 0) {
          this.parametroSeleccionado = this.parametros[0];
        }

        this.loading = false;
      } catch (error) {
        console.error("Error al obtener parámetros:", error);
        this.loading = false;
      }
    },

    async getServerData(sortBy, sortDesc, page, itemsPerPage) {
      try {
        const response = await axios.get(
          `parametro/allParametros?search=${""}&page=${page}&limit=${itemsPerPage}`
        );
        return response.data;
      } catch (error) {
        console.error("Error al obtener datos del servidor:", error);
        this.loading = false;
        return [];
      }
    },
  },
};
</script>

<style scoped>
.selector-container {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  padding: 16px;
  flex-wrap: wrap;
  width: 355px;
}
</style>
