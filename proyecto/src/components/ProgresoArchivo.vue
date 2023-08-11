<template>
  <div>
    <v-hover v-slot="{ hover }">
      <v-card
        dark
        elevation="5"
        :color="color"
        class="mx-auto"
        height="140"
        outlined
      >
        <v-expand-transition>
          <div
            v-if="hover"
            class="caja transition-fast-in-fast-out darken-2 v-card--reveal text-h5 white--text"
            style="height: 100%"
          >
            <v-progress-circular
              :rotate="-90"
              :size="100"
              :width="10"
              :value="item.porcentaje"
              color="white"
            >
              {{ item.porcentaje }}%
            </v-progress-circular>
          </div>
        </v-expand-transition>
        <v-list-item three-line>
          <v-list-item-content>
            <h1>{{ item.total }}</h1>
            <v-list-item-title class="text-h7 mb-1">
              {{ item.nombre }}
            </v-list-item-title>
          </v-list-item-content>
          <v-list-item-avatar tile size="100">
            <!-- <v-icon color="white" size="65"> {{ item.icon }}</v-icon> -->
          </v-list-item-avatar>
        </v-list-item>
      </v-card>
    </v-hover>
  </div>
</template>

<script>
import axios from "axios";
export default {
  name: "Test",
  created() {
    this.solicitarDatos();
  },
  data() {
    return {
      porcentaje: 0,
      item: {},
    };
  },
  props: {
    indice: Number,
    color: String,
  },
  methods: {
    async solicitarDatos() {
      switch (this.indice) {
        case 0:
          await axios.get("archivo/countAllFiles").then((res) => {
            this.item = res.data
          });
          break;
        case 1:
          await axios.get("archivo/countVigentes").then((res) => {
            this.item = res.data
          });
          break;
        case 2:
          await axios.get("archivo/countPorVencer").then((res) => {
            this.item = res.data
          });
          break;
        case 3:
          await axios.get("archivo/countVencidos").then((res) => {
            this.item = res.data
          });
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss" scoped></style>
