<template>
  <v-card>
    <v-toolbar dense dark>
      <v-toolbar-title class="white--text"> sociedades </v-toolbar-title>
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

    <loading texto="Cargando Datos" v-if="isLoading"></loading>
    <v-list v-if="!isLoading" two-line subheader>
      <div class="container">
        <v-expand-transition>
          <v-text-field
            v-show="!hidden"
            v-model="busqueda"
            clearable
            hide-details
            filled
            dense
            autofocus
            rounded
            full-width
            color="black darken"
            placeholder="Buscar Sociedad"
            prepend-inner-icon="mdi-folder-search-outline"
          ></v-text-field>
        </v-expand-transition>
      </div>

      <v-list-item
        v-for="item in resultadoBusqueda"
        :key="item.nombre"
        link
        @click="enviarRuta(item)"
      >
        <v-list-item-avatar> <v-icon>mdi-folder </v-icon> </v-list-item-avatar>
        <v-list-item-content>
          <v-list-item-title>{{ item.nombre }}</v-list-item-title>
          <v-list-item-subtitle>{{
            obtenerFecha(item.fechaCreacion)
          }}</v-list-item-subtitle>
        </v-list-item-content>

        <progress-folder :porcentaje="item.porcentaje"></progress-folder>

        <v-list-item-action>
          <v-tooltip top>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon v-bind="attrs" v-on="on">
                <v-icon color="grey lighten-1"> mdi-information </v-icon>
              </v-btn>
            </template>
            <span v-if="!!item.descripcion">{{ item.descripcion }}</span>
            <span v-else>Esta carpeta no posee descripcion</span>
          </v-tooltip>
        </v-list-item-action>
      </v-list-item>
    </v-list>
  </v-card>
</template>

<script>
import axios from "axios";
import loading from "../loading.vue";
import ProgressFolder from "../ProgressFolder.vue";

export default {
  components: { loading, ProgressFolder },
  data: () => ({
    // finds: [],
    hidden: true,
    busqueda: "",
    isLoading: true,
    sociedades: {},
  }),
  created() {
    this.initialize();
  },
  watch: {},
  computed: {
    resultadoBusqueda() {
      if (this.busqueda) {
        return this.sociedades.filter((item) => {
          return this.busqueda
            .toLowerCase()
            .split(" ")
            .every((v) => item.nombre.toLowerCase().includes(v));
        });
      } else {
        return this.sociedades;
      }
    },
  },
  methods: {
    obtenerFecha(fecha) {
      let retorno = fecha.split("T");
      return retorno[0];
    },
    async initialize() {
      try {
        await axios.get("/sociedad/getPadres").then(async (result) => {
          this.sociedades = result.data;
          this.isLoading = false;
        });
      } catch (error) {
        console.log(error);
      }
    },
    enviarRuta(child) {
      this.$router.push({
        path: "/archivos/" + child.nombre,
      });
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
    &before, &:after
      border-color: transparent !important
  &.closed
    max-width: 50px
    .v-input__slot
      background-color: transparent !important
</style>
