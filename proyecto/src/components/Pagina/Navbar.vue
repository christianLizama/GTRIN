<template>
  <div>
    <v-app-bar color="" app height="56%" elevation="1">
      <v-app-bar-nav-icon
        class="hidden-md-and-up"
        @click="drawer = true"
      ></v-app-bar-nav-icon>

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
        <span>Tema {{$vuetify.theme.dark ? "Claro" : "Oscuro"}}</span>
      </v-tooltip>
    </v-app-bar>
    <v-navigation-drawer
      v-model="drawer"
      dark
      color="#212529"
      app
      :mini-variant.sync="mini"
      :permanent="!$vuetify.breakpoint.xsOnly"
      expand-on-hover
    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>Admin</v-list-item-title>
      </v-list-item>

      <v-divider elevation="1"></v-divider>

      <v-list shaped>
        <v-list-item active-class="white--text" link to="/">
          <v-list-item-icon>
            <v-icon>mdi-monitor-dashboard</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Dashboard</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-group
          active-class="white--text"
          v-for="item in menu"
          :key="item.title"
          v-model="item.active"
          :prepend-icon="item.action"
          no-action
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title v-text="item.title"></v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            active-class="white--text"
            link
            :to="'/archivos/' + child.nombre"
            v-for="child in item.items"
            :key="child.title"
          >
            <v-list-item-content>
              <v-list-item-title v-text="child.nombre"></v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </v-list-group>
        <v-divider></v-divider>
        <v-list-group
          no-action
          prepend-icon="mdi-folder-wrench-outline"
          active-class="red--text"
        >
          <template v-slot:activator>
            <v-list-item-content active-class="red--text">
              <v-list-item-title>Configurar</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            active-class="red--text"
            v-for="item in cruds"
            :key="item.title"
            link
            :to="'/Configuracion/' + item.to"
          >
            <v-list-item-title v-text="item.title"></v-list-item-title>

            <v-list-item-icon>
              <v-icon v-text="item.icon"></v-icon>
            </v-list-item-icon>
          </v-list-item>
        </v-list-group>
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      drawer: false,
      nombre: "Christian Lizama",
      menu: [
        { action: "mdi-human-male-boy", items: [], title: "Contenedores" },
      ],
      cruds: [
        { title: "Crear", icon: "mdi-plus", to: "crear" },
        { title: "Modificar", icon: "mdi-update", to: "editar" },
        { title: "Eliminar", icon: "mdi-delete", to: "eliminar" },
      ],
      mini: true,
    };
  },
  created() {
    this.initialize();
  },
  methods: {
    async initialize() {
      await axios.get("/sociedad/getPadres").then((result) => {
        this.menu[0].items = result.data;
      });
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
