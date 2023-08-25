<template>
  <div>
    <v-app-bar color="" app height="56%" elevation="1">
      <v-app-bar-nav-icon @click="cambiar()"></v-app-bar-nav-icon>

      <v-spacer></v-spacer>
      <v-img
        class="imagen mr-3"
        max-height="55"
        max-width="55"
        src="../../assets/logo.e34e8d2.png"
      ></v-img>

      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on" icon @click="changeThemeColor">
            <v-icon>{{
              $vuetify.theme.dark
                ? "mdi-white-balance-sunny"
                : "mdi-weather-night"
            }}</v-icon>
          </v-btn>
        </template>
        <span>Tema {{ $vuetify.theme.dark ? "Claro" : "Oscuro" }}</span>
      </v-tooltip>
    </v-app-bar>

    <v-navigation-drawer
      :expand-on-hover="observarMini"
      :permanent="!$vuetify.breakpoint.xsOnly"
      :mini-variant="observarMini"
      v-model="drawer"
      dark
      color="#212529"
      app
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-icon>mdi-account</v-icon>
        </v-list-item-avatar>

        <v-list-item-title v-if="usuario">{{
          usuario.nombreCompleto
        }}</v-list-item-title>

        <v-tooltip bottom color="blue">
          <template v-slot:activator="{ on, attrs }">
            <div v-on="on" v-bind="attrs"></div>
            <v-btn @click="salir" icon dark v-bind="attrs" v-on="on">
              <v-icon>mdi-logout-variant</v-icon>
            </v-btn>
          </template>
          <span>Salir</span>
        </v-tooltip>
      </v-list-item>

      <v-divider elevation="1"></v-divider>

      <v-list>
        <v-list-item active-class="white--text" link to="/">
          <v-list-item-icon>
            <v-icon>mdi-monitor-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item active-class="white--text" link to="/sociedades">
          <v-list-item-icon>
            <v-icon>mdi-human-male-boy</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Contenedores</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-divider></v-divider>
        <v-list-item
          v-if="esAdmin"
          active-class="white--text"
          link
          to="/configuracion"
        >
          <v-list-item-icon>
            <v-icon>mdi-folder-wrench-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Configurar</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="esAdmin"
          active-class="white--text"
          link
          to="/triggers"
        >
          <v-list-item-icon>
            <v-icon>mdi-clipboard-clock</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Triggers</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="esAdmin"
          active-class="white--text"
          link
          to="/adminCrud"
        >
          <v-list-item-icon>
            <v-icon>mdi-account-group</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Usuarios</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item
          v-if="esAdmin"
          active-class="white--text"
          link
          to="/archivosEliminados"
        >
          <v-list-item-icon>
            <v-icon>mdi-file-chart-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Control Archivos</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import axios from "axios";
import { mapState } from "vuex";
export default {
  components: {},
  data() {
    return {
      usuarioActual: "",
      drawer: false,
      mini: true,
      expand: true,
      // menu: [{ icon: "mdi-human-male-boy", items: [], title: "Contenedores" }],
      contenedores: [],
    };
  },
  created() {
    //this.obtenerContenedores();
  },
  computed: {
    ...mapState(["usuario"]),
    esAdmin() {
      return (
        this.$store.state.usuario && this.$store.state.usuario.rol == "admin"
      );
    },
    observarMini() {
      return this.comprobarMini();
    },
  },
  methods: {
    salir() {
      this.$store.dispatch("salir");
    },
    cambiar() {
      if (this.$vuetify.breakpoint.xsOnly) {
        this.drawer = !this.drawer;
      } else {
        this.mini = !this.mini;
      }
    },
    comprobarMini() {
      if (this.mini && !this.$vuetify.breakpoint.xsOnly) {
        return true;
      } else {
        return false;
      }
    },
    async obtenerContenedores() {
      try {
        await axios.get("/sociedad/getPadres").then(async (result) => {
          this.contenedores = result.data;
        });
      } catch (error) {
        console.log(error);
      }
    },
    changeThemeColor() {
      if (this.$vuetify.theme.dark === true) {
        this.$vuetify.theme.dark = false;
      } else {
        this.$vuetify.theme.dark = true;
      }
    },
    toRoute(nombre) {
      this.$router.push(nombre);
    },
  },
};
</script>
