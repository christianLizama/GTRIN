<template>
  <div>
    <v-app-bar color="" app height="56%" elevation="1">
      <v-spacer></v-spacer>
      <div class="text-center">
        <v-menu offset-y>
          <template v-slot:activator="{ on, attrs }">
            <v-btn text v-bind="attrs" v-on="on"
              ><v-icon>mdi-account</v-icon> {{ nombre }}
            </v-btn>
          </template>
          <v-card>
            <v-list>
              <v-list-item>
                <v-list-item-avatar>
                  <img src="https://cdn.vuetifyjs.com/images/john.jpg" alt="John" />
                </v-list-item-avatar>

                <v-list-item-content>
                  <v-list-item-title>Christian Lizama</v-list-item-title>
                  <v-list-item-subtitle>Admin</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn text @click="menu = false" to="home"> Mi Perfil </v-btn>
              <v-btn color="primary" text @click="menu = false"> Salir </v-btn>
            </v-card-actions>
          </v-card>
        </v-menu>
      </div>
    </v-app-bar>
    <v-navigation-drawer
      dark
      color="#212529"
      app
      :mini-variant.sync="mini"
      permanent
      expand-on-hover

    >
      <v-list-item class="px-2">
        <v-list-item-avatar>
          <v-img src="https://randomuser.me/api/portraits/men/85.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-title>Admin</v-list-item-title>
      </v-list-item>

      <v-divider elevation="1"></v-divider>

      <v-list-item link to="/">
        <v-list-item-icon>
          <v-icon>mdi-home-city</v-icon>
        </v-list-item-icon>
        <v-list-item-content>
          <v-list-item-title>Dashboard</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-list>
        <v-list-group
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
      </v-list>
    </v-navigation-drawer>
  </div>
</template>

<script>
import axios from "axios";
export default {
  data() {
    return {
      nombre: "Christian Lizama",
      menu: [{ action: "mdi-ticket", items: [], title: "Sociedades" }],
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
    toRoute(nombre) {
      this.$router.push(nombre);
    },
  },
};
</script>
