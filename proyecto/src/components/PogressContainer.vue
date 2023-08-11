<template>
  <div>
    <v-tooltip top :color="obtenerColor()">
      <template v-slot:activator="{ on, attrs }">
        <v-progress-circular
          v-bind="attrs"
          v-on="on"
          :rotate="-90"
          :size="28"
          :width="3"
          :value="valor"
          :color="obtenerColor()"
          style="font-size: 0.75em"
        >
          {{ porcentaje }}
        </v-progress-circular>
      </template>
      <span>{{porcentaje}}% de avance </span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  name: "progressContainer",
  data() {
    return {
      carpetasCumplidas: 0,
      interval: {},
      valor: 0,
    };
  },
  created(){
  },
  props: {
    porcentaje: Number,
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
  mounted() {
    this.interval = setInterval(() => {
      if (this.valor === this.porcentaje) {
        return (this.valor = this.porcentaje);
      }
      this.valor += 1;
    }, 8);
  },
  methods: {
    obtenerColor(){
      if(this.porcentaje<33){
        return "#FF1744"
      }
      else if(this.porcentaje>33 && this.porcentaje<66){
        return "#FF6D00"
      }
      return "#00E676"
    },
  },
};
</script>
