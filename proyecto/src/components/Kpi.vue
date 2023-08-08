<template>
  <div>
    <v-container fluid>
      <v-row class="fill-height" align="center" justify="center">
        <v-col v-for="index in 4" :key="index">
          <progreso-archivo :color="colores[index-1]" :indice="index-1"></progreso-archivo>
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
      model: null,
      cantidad: 4,
      colores: ["blue", "green", "orange", "red"],
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
