<template>
  <div>
    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-progress-circular
          v-bind="attrs"
          v-on="on"
          :rotate="-90"
          :size="40"
          :width="5"
          :value="calularPorcentaje()"
          :color="obtenerColor(calularPorcentaje())"
        >
          {{ calularPorcentaje() }}
        </v-progress-circular>
      </template>
      <span> Nivel de cumplimiento </span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "Test",
  created() {},
  data() {
    return {};
  },
  props: {
    archivosSubidos: Number,
    archivosRequeridos: Number,
  },
  methods: {
    obtenerColor(valor) {
      if (valor < 100) {
        return "red";
      } else {
        return "green";
      }
    },
    calularPorcentaje() {
      if(this.archivosSubidos==0){
        return 0
      }
      let porcentaje = (this.archivosSubidos / this.archivosRequeridos) * 100;
      let intPorcentaje = Math.round(porcentaje);
      return intPorcentaje;
    },
  },
};
</script>

<style lang="scss" scoped></style>
