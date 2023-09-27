<template>
  <div>
    <v-container fluid>
      <v-row class="fill-height" align="center" justify="center">
        <v-col v-for="(color, index) in colores" :key="index">
          <progreso-archivo :color="color" :apiEndpoint="apiEndpoints.archivo[countEndpoints[index]]" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
import ProgresoArchivo from './ProgresoArchivo.vue';
export default {
  components: { ProgresoArchivo },
  name: "kpi",
  created() {},
  data() {
    return {
      colores: ["blue", "green", "orange", "red"],
      apiEndpoints: {
        archivo: {
          countAllFiles: "archivo/countAllFiles",
          countVigentes: "archivo/countVigentes",
          countPorVencer: "archivo/countPorVencer",
          countVencidos: "archivo/countVencidos",
        },
      },
      countEndpoints: ["countAllFiles", "countVigentes", "countPorVencer", "countVencidos"], // Nuevos endpoints correspondientes a cada color
    };
  },
  props: {
    items: Array,
  },
  methods: {},
};
</script>

<style lang="scss" scoped>
.caja {
  width: 100%;
}
.cajon {
  margin-left: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
