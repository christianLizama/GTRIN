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
              $vuetify.theme.dark ? "mdi-white-balance-sunny" : "mdi-weather-night"
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
          <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>Admin</v-list-item-title>
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
        <v-list-group
          active-class="white--text"
          v-for="item in obtenerLista"
          :key="item.title"
          v-model="item.active"
          :prepend-icon="item.action"
        >
          <template v-slot:activator>
            <v-list-item-content>
              <v-list-item-title>{{ item.title }}</v-list-item-title>
            </v-list-item-content>
          </template>

          <v-list-item
            active-class="white--text"
            link
            :to="'/archivos/' + child.nombre"
            v-for="child in item.items"
            :key="child.title"
          >
            <v-list-item-icon>
              <Icon width="25" heigh="25" icon="material-symbols:boy"></Icon>
            </v-list-item-icon>
            <v-list-item-content>
              <v-tooltip top>
                <template v-slot:activator="{ on, attrs }">
                  <v-list-item-title v-on="on" v-bind="attrs">{{
                    child.nombre
                  }}</v-list-item-title>
                </template>
                <span v-if="child.descripcion.length>1">{{ child.descripcion }}</span>
                <span v-else>No posee descripcion</span>
              </v-tooltip>
            </v-list-item-content>
            <pogress-container :fracciones="child.cumplimiento" :cantidadCarpetas="child.folders.length"></pogress-container>
          </v-list-item>
        </v-list-group>
        <v-divider></v-divider>
        <v-list-item active-class="white--text" link to="/configuracion">
          <v-list-item-icon>
            <v-icon>mdi-folder-wrench-outline</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Configurar</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <!-- <v-list-item active-class="white--text" link to="/triggers">
          <v-list-item-icon>
            <v-icon>mdi-clipboard-clock</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title>Triggers</v-list-item-title>
          </v-list-item-content>
        </v-list-item> -->
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import axios from "axios";
import { Icon } from "@iconify/vue2";
import PogressContainer from '../PogressContainer.vue';
export default {
  components: {
    Icon,
    PogressContainer,
  },
  data() {
    return {
      drawer: false,
      mini: true,
      expand: true,
      nombre: "Christian Lizama",
      menu: [{ action: "mdi-human-male-boy", items: [], title: "Contenedores" }],
      contenedores: [],
      cumplidos: [],
    };
  },
  mounted() {
    this.obtenerContenedores();
  },
  computed: {
    observarMini() {
      return this.comprobarMini();
    },
    obtenerLista() {
      if (this.$store.getters.getContenedores) {
        this.initialize();
        return this.menu;
      }
      return this.menu;
    },
  },
  methods: {
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
          for (let index = 0; index < result.data.length; index++) {
            await this.getFolders(result.data[index]);
            this.cumplidos=[]
          }
          this.contenedores = result.data;
          this.$store.dispatch("cambiarContenedor", this.contenedores);
        });
      } catch (error) {
        console.log(error);
      }
    },
    async getFolders(padre) {
      await axios
        .get("sociedad/queryFolders?_id=" + padre._id)
        .then(async (res) => {
          for (let index = 0; index < res.data.length; index++) {
            await this.getSubFolders(res.data[index]);
          }
          padre.folders = res.data;
          padre.cumplimiento = this.cumplidos;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    async getSubFolders(padre) {
      const request = {
        params: {
          _id: padre._id,
          padre: padre.padre,
        },
      };

      await axios
        .get("carpeta/contarCumplimiento", request)
        .then(async (res) => {
          let cumplidas = 0;
          let totales = res.data.length;
          res.data.forEach((subCarpeta) => {
            if (subCarpeta.cumplimiento == "cumple") {
              cumplidas = cumplidas + 1;
            }
          });
          padre.cumplidas = cumplidas;
          padre.totales = totales;
          this.cumplidos.push([cumplidas, totales]);
          padre.subFolders = res.data;
        })
        .catch((e) => {
          console.log(e);
        });
    },
    initialize() {
      this.menu[0].items = this.$store.getters.getContenedores;
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
